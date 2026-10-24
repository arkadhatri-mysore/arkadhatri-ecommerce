import crypto from 'crypto'

const COOKIE = 'ark_admin'
const TTL = 60 * 60 * 24 * 7 // 7 days
const PLACEHOLDERS = new Set(['', 'change-me', 'please-replace-with-a-64-hex-secret', 'change-this-strong-password'])
const IS_PROD = process.env.NODE_ENV === 'production'

// Signing secret. In production a missing/placeholder/short secret disables admin login entirely
// (fail closed) instead of falling back to a guessable value.
const rawSecret = process.env.ADMIN_JWT_SECRET || ''
const SECRET_OK = !PLACEHOLDERS.has(rawSecret) && rawSecret.length >= 32
if (!SECRET_OK) {
  console.warn('[admin-auth] ADMIN_JWT_SECRET is missing or weak.' + (IS_PROD ? ' Admin login is DISABLED until a strong secret (32+ chars) is set.' : ' Using a temporary dev-only secret.'))
}
const SECRET = SECRET_OK ? rawSecret : (IS_PROD ? null : crypto.randomBytes(32).toString('hex'))

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a ?? ''))
  const y = Buffer.from(String(b ?? ''))
  if (x.length !== y.length) { crypto.timingSafeEqual(x, x); return false }
  return crypto.timingSafeEqual(x, y)
}

/** True when admin credentials + secret are properly configured. */
export const adminConfigured = () => {
  const email = process.env.ADMIN_EMAIL || ''
  const pass = process.env.ADMIN_PASSWORD || ''
  return Boolean(SECRET && email && pass && !PLACEHOLDERS.has(pass))
}

// ---------- Password storage (scrypt, no extra dependencies) ----------
const scrypt = (pw, salt) => new Promise((res, rej) =>
  crypto.scrypt(String(pw), salt, 64, { N: 16384, r: 8, p: 1 }, (e, k) => (e ? rej(e) : res(k.toString('hex')))))
export const hashPassword = async (pw) => {
  const salt = crypto.randomBytes(16).toString('hex')
  return { salt, hash: await scrypt(pw, salt) }
}
const sha = (v) => crypto.createHash('sha256').update(String(v || '')).digest('hex')
export const envPasswordFingerprint = () => sha(process.env.ADMIN_PASSWORD || '')

/** Password policy: 10+ chars, upper, lower, number. Returns error string or null. */
export const passwordProblem = (pw) => {
  const s = String(pw || '')
  if (s.length < 10) return 'Password must be at least 10 characters.'
  if (s.length > 128) return 'Password is too long.'
  if (!/[a-z]/.test(s) || !/[A-Z]/.test(s) || !/[0-9]/.test(s)) return 'Use upper-case and lower-case letters and at least one number.'
  if (PLACEHOLDERS.has(s)) return 'Please choose a different password.'
  return null
}

/**
 * Loads the stored admin record. A stored password is used unless the hosting
 * ADMIN_PASSWORD has been changed since it was set (owner recovery path).
 */
export const getAdminRecord = async (db) => {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const rec = await db.collection('admin_users').findOne({ email }, { projection: { _id: 0 } })
  if (rec && rec.envFingerprint && rec.envFingerprint !== envPasswordFingerprint()) return { email, tokenVersion: (rec.tokenVersion || 0) + 1000, envReset: true }
  return rec || { email, tokenVersion: 0 }
}

/** Constant-time credential check against stored hash (or hosting password). */
export const checkCredentials = async (db, email, password) => {
  if (!adminConfigured()) return false
  const okEmail = safeEqual(String(email || '').trim().toLowerCase(), String(process.env.ADMIN_EMAIL).trim().toLowerCase())
  const rec = await getAdminRecord(db)
  let okPass
  if (rec.hash && rec.salt) okPass = safeEqual(await scrypt(String(password || ''), rec.salt), rec.hash)
  else okPass = safeEqual(password, process.env.ADMIN_PASSWORD)
  return okEmail && okPass
}

/** Saves a new password hash and bumps the session version (signs out other devices). */
export const setAdminPassword = async (db, newPassword) => {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const prev = await getAdminRecord(db)
  const { salt, hash } = await hashPassword(newPassword)
  const tokenVersion = (prev.tokenVersion || 0) + 1
  await db.collection('admin_users').updateOne(
    { email },
    { $set: { email, salt, hash, tokenVersion, envFingerprint: envPasswordFingerprint(), passwordChangedAt: new Date() } },
    { upsert: true }
  )
  return tokenVersion
}

// ---------- Reset tokens (stored hashed, single use, 30 min) ----------
export const createResetToken = async (db) => {
  const token = crypto.randomBytes(32).toString('base64url')
  await db.collection('admin_reset_tokens').deleteMany({})
  await db.collection('admin_reset_tokens').insertOne({ tokenHash: sha(token), expiresAt: new Date(Date.now() + 30 * 60_000), createdAt: new Date() })
  return token
}
export const consumeResetToken = async (db, token) => {
  if (!token || typeof token !== 'string') return false
  const doc = await db.collection('admin_reset_tokens').findOneAndDelete({ tokenHash: sha(token), expiresAt: { $gt: new Date() } })
  return Boolean(doc && (doc.value !== undefined ? doc.value : doc))
}

export const signToken = (payload) => {
  if (!SECRET) throw new Error('Admin auth not configured')
  const data = { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + TTL }
  const body = Buffer.from(JSON.stringify(data)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}

export const verifyToken = (token) => {
  if (!SECRET || !token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [body, sig] = parts
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  if (!safeEqual(sig, expected)) return null
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (!p || p.role !== 'admin') return null
    if (!p.exp || p.exp < Math.floor(Date.now() / 1000)) return null
    return p
  } catch { return null }
}

export const COOKIE_NAME = COOKIE
export const COOKIE_MAX_AGE = TTL

/** Cookie attributes; adds Secure when served over HTTPS (or in production). */
export const cookieAttrs = (request, maxAge = TTL) => {
  const https = IS_PROD || (request?.headers?.get('x-forwarded-proto') || '').includes('https') || String(request?.url || '').startsWith('https:')
  return `HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${https ? '; Secure' : ''}`
}

export const checkAdmin = (request) => {
  const cookie = request.headers.get('cookie') || ''
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))
  if (!m) return null
  try { return verifyToken(decodeURIComponent(m[1])) } catch { return null }
}

/** Full session check: valid signature + not signed out by a password change. */
export const checkAdminSession = async (db, request) => {
  const p = checkAdmin(request)
  if (!p) return null
  const rec = await getAdminRecord(db)
  if ((p.tv || 0) !== (rec.tokenVersion || 0)) return null
  return p
}
