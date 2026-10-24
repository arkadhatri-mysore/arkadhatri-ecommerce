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

/** Constant-time credential check. Never matches when credentials are not configured. */
export const checkCredentials = (email, password) => {
  if (!adminConfigured()) return false
  const okEmail = safeEqual(String(email || '').trim().toLowerCase(), String(process.env.ADMIN_EMAIL).trim().toLowerCase())
  const okPass = safeEqual(password, process.env.ADMIN_PASSWORD)
  return okEmail && okPass
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
