// Attempt limits.
// - limitHits(): shared, atomic MongoDB counters (survive restarts, shared across instances). Used for
//   admin login / password reset, order-access codes and order creation.
// - rateLimit(): light in-memory limiter kept for low-risk forms (newsletter, contact, coupon checks).
// These limits slow down automated guessing; they cannot make abuse impossible.

import { MongoClient } from 'mongodb'

// ---------- Trusted client IP ----------
// Forwarded headers are only trusted for the number of proxy hops we control (TRUSTED_PROXY_HOPS).
// Each trusted proxy appends to X-Forwarded-For, so the client address is the entry just before them;
// anything further left was supplied by the client and is ignored. With 0 hops (default) the header is not
// trusted at all and the nearest hop (added by the server itself) is used.
export function ipFromRequest(request) {
  const hops = Math.max(0, parseInt(process.env.TRUSTED_PROXY_HOPS || '0', 10) || 0)
  const list = String(request?.headers?.get?.('x-forwarded-for') || '').split(',').map((s) => s.trim()).filter(Boolean)
  if (!list.length) return 'unknown'
  const idx = list.length - 1 - hops
  return idx >= 0 ? list[idx] : (list.length === 1 ? list[0] : 'untrusted')
}

// ---------- Shared persistent counters ----------
let _db = null
let _indexed = false
async function col() {
  if (!_db) {
    const c = new MongoClient(process.env.MONGO_URL)
    await c.connect()
    _db = c.db(process.env.DB_NAME)
  }
  const k = _db.collection('rate_limits')
  if (!_indexed) { _indexed = true; await k.createIndex({ purgeAt: 1 }, { expireAfterSeconds: 0 }).catch(() => {}) }
  return k
}

/**
 * Atomically counts one attempt against `key`. Fixed window of `windowMs`; once `max` is exceeded the key is
 * blocked for `blockMs` (cooldown). Returns { allowed, retryAfter }.
 */
export async function limitHit(key, { max, windowMs, blockMs = windowMs }) {
  const k = await col()
  const now = new Date()
  const doc = await k.findOneAndUpdate(
    { _id: String(key) },
    [{
      $set: (() => {
        const expired = { $or: [
          { $eq: [{ $ifNull: ['$resetAt', null] }, null] }, { $lte: ['$resetAt', now] },
          { $and: [{ $ne: [{ $ifNull: ['$blockedUntil', null] }, null] }, { $lte: ['$blockedUntil', now] }] }
        ] }
        const blocked = { $gt: [{ $ifNull: ['$blockedUntil', now] }, now] }
        return {
          count: { $cond: [blocked, '$count', { $cond: [expired, 1, { $add: ['$count', 1] }] }] },
          resetAt: { $cond: [blocked, '$resetAt', { $cond: [expired, new Date(now.getTime() + windowMs), '$resetAt'] }] },
          blockedUntil: '$blockedUntil'
        }
      })()
    }, {
      $set: {
        blockedUntil: { $cond: [
          { $gt: [{ $ifNull: ['$blockedUntil', now] }, now] }, '$blockedUntil',
          { $cond: [{ $gt: ['$count', max] }, new Date(now.getTime() + blockMs), null] }
        ] }
      }
    }, {
      $set: { purgeAt: { $max: ['$resetAt', { $ifNull: ['$blockedUntil', '$resetAt'] }] } }
    }],
    { upsert: true, returnDocument: 'after' }
  )
  const d = doc?.value !== undefined ? doc.value : doc
  if (d?.blockedUntil && new Date(d.blockedUntil) > now) {
    return { allowed: false, retryAfter: Math.ceil((new Date(d.blockedUntil) - now) / 1000) }
  }
  return { allowed: true }
}

/** Checks several layered limits (IP, account/contact, order). Every layer is counted; any block wins. */
export async function limitAll(rules) {
  let blocked = null
  for (const [key, opts] of rules) {
    if (!key) continue
    const r = await limitHit(key, opts)
    if (!r.allowed && (!blocked || r.retryAfter > blocked.retryAfter)) blocked = r
  }
  return blocked || { allowed: true }
}

/** Clears a key (e.g. account failure counter after a successful sign-in). */
export async function limitClear(key) {
  try { await (await col()).deleteOne({ _id: String(key) }) } catch {}
}

// ---------- Light in-memory limiter (low-risk forms only) ----------
const buckets = new Map()
export function rateLimit(key, { max = 20, windowMs = 60_000 } = {}) {
  const now = Date.now()
  const fresh = (buckets.get(key) || []).filter((t) => now - t < windowMs)
  if (fresh.length >= max) {
    buckets.set(key, fresh)
    return { allowed: false, retryAfter: Math.ceil((windowMs - (now - fresh[0])) / 1000) }
  }
  fresh.push(now)
  buckets.set(key, fresh)
  return { allowed: true, remaining: max - fresh.length }
}
