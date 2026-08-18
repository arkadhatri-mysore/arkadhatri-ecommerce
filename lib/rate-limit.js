// Very light in-memory sliding-window rate limiter.
// Adequate for MVP. For production behind multiple pods, replace with Redis.

const buckets = new Map()

export function rateLimit(key, { max = 20, windowMs = 60_000 } = {}) {
  const now = Date.now()
  const b = buckets.get(key) || []
  // drop expired
  const fresh = b.filter(t => now - t < windowMs)
  if (fresh.length >= max) {
    buckets.set(key, fresh)
    return { allowed: false, retryAfter: Math.ceil((windowMs - (now - fresh[0])) / 1000) }
  }
  fresh.push(now)
  buckets.set(key, fresh)
  return { allowed: true, remaining: max - fresh.length }
}

export function ipFromRequest(request) {
  return (request?.headers?.get?.('x-forwarded-for') || '').split(',')[0].trim()
      || request?.headers?.get?.('x-real-ip')
      || 'unknown'
}
