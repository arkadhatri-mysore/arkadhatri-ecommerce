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

/** True when the signing secret + admin email are configured (password may live as a stored hash). */
export const adminConfigured = () => {
  const email = process.env.ADMIN_EMAIL || ''
  return Boolean(SECRET && email)
}

/** Bootstrap password from hosting settings (only used until the owner sets their own). */
const envPassword = () => {
  const p = process.env.ADMIN_PASSWORD || ''
  return p && !PLACEHOLDERS.has(p) ? p : ''
}

// ---------- Password storage (scrypt, no extra dependencies) ----------
const scrypt = (pw, salt) => new Promise((res, rej) =>
  crypto.scrypt(String(pw), salt, 64, { N: 16384, r: 8, p: 1 }, (e, k) => (e ? rej(e) : res(k.toString('hex')))))
export const hashPassword = async (pw) => {
  const salt = crypto.randomBytes(16).toString('hex')
  return { salt, hash: await scrypt(pw, salt) }
}
const sha = (v) => crypto.createHash('sha256').update(String(v || '')).digest('hex')
// Salted, slow fingerprint of the hosting bootstrap password (detects when the owner changes it for recovery).
const envFp = async (salt) => (envPassword() ? scrypt(envPassword(), `envfp:${salt}`) : '')

/** Password policy: 10+ chars, upper, lower, number. Returns error string or null. */
export const passwordProblem = (pw) => {
  const s = String(pw || '')
  if (s.length < 10) return 'Password must be at least 10 characters.'
  if (s.length > 128) return 'Password is too long.'
  if (!/[a-z]/.test(s) || !/[A-Z]/.test(s) || !/[0-9]/.test(s)) return 'Use upper-case and lower-case letters and at least one number.'
  if (PLACEHOLDERS.has(s)) return 'Please choose a different password.'
  return null
}

const adminEmail = () => String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()

/** Loads the stored admin record (hash, salt, session version). */
export const getAdminRecord = async (db) => {
  const email = adminEmail()
  const rec = await db.collection('admin_users').findOne({ email }, { projection: { _id: 0 } })
  return rec || { email, tokenVersion: 0 }
}

/**
 * Constant-time credential check.
 * - Normal case: compares against the stored scrypt hash.
 * - Migration: if no hash is stored yet, the hosting bootstrap password is accepted once and immediately
 *   saved as a hash (flagged so the admin panel asks the owner to choose their own password).
 * - Owner recovery: if the hosting ADMIN_PASSWORD is changed after a hash was stored, the new hosting
 *   password is accepted, re-hashed, and all existing sessions are signed out.
 */
export const checkCredentials = async (db, email, password) => {
  if (!adminConfigured()) return false
  const okEmail = safeEqual(String(email || '').trim().toLowerCase(), adminEmail())
  const rec = await getAdminRecord(db)
  const env = envPassword()
  let envChanged = false
  if (env && rec.hash) {
    const fp = rec.envFingerprint || ''
    envChanged = fp.length === 64 ? fp !== sha(env) : fp !== (await envFp(rec.salt)) // 64 = legacy unsalted form
  }
  let okPass = false
  if (rec.hash && rec.salt && !envChanged) {
    okPass = safeEqual(await scrypt(String(password || ''), rec.salt), rec.hash)
    if (okPass && okEmail && rec.envFingerprint && rec.envFingerprint.length === 64) {
      await db.collection('admin_users').updateOne({ email: adminEmail() }, { $set: { envFingerprint: await envFp(rec.salt) } })
    }
    // Still using the password that is written in hosting settings -> ask the owner to choose their own.
    if (okPass && okEmail && env && !rec.bootstrap && safeEqual(password, env)) {
      await db.collection('admin_users').updateOne({ email: adminEmail() }, { $set: { bootstrap: true } })
    }
  } else if (env) {
    okPass = safeEqual(password, env)
    if (okPass && okEmail) {
      const { salt, hash } = await hashPassword(env)
      await db.collection('admin_users').updateOne(
        { email: adminEmail() },
        { $set: { email: adminEmail(), salt, hash, envFingerprint: await envFp(salt), bootstrap: true, tokenVersion: (rec.tokenVersion || 0) + (envChanged ? 1 : 0), passwordChangedAt: new Date() } },
        { upsert: true }
      )
    }
  } else {
    await scrypt(String(password || ''), 'no-admin-configured') // keep timing similar
  }
  return okEmail && okPass
}

/** True while the owner is still on the hosting bootstrap password. */
export const needsPasswordChange = (rec) => Boolean(rec?.bootstrap)

/** Saves a new password hash and bumps the session version (signs out other devices). */
export const setAdminPassword = async (db, newPassword) => {
  const email = adminEmail()
  const prev = await getAdminRecord(db)
  const { salt, hash } = await hashPassword(newPassword)
  const tokenVersion = (prev.tokenVersion || 0) + 1
  await db.collection('admin_users').updateOne(
    { email },
    { $set: { email, salt, hash, tokenVersion, envFingerprint: await envFp(salt), bootstrap: false, passwordChangedAt: new Date() } },
    { upsert: true }
  )
  return tokenVersion
}

// ---------- Reset tokens (stored hashed, single use, 15 min) ----------
export const createResetToken = async (db) => {
  const token = crypto.randomBytes(32).toString('base64url')
  await db.collection('admin_reset_tokens').deleteMany({})
  await db.collection('admin_reset_tokens').insertOne({ tokenHash: sha(token), expiresAt: new Date(Date.now() + 15 * 60_000), createdAt: new Date() })
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

/** Server-only sub-key derived from the signing secret (used for customer order sessions/codes). */
export const deriveServerKey = (label) => {
  const own = process.env.ORDER_ACCESS_SECRET || ''
  if (own.length >= 32 && !PLACEHOLDERS.has(own)) return crypto.createHmac('sha256', own).update(label).digest()
  return SECRET ? crypto.createHmac('sha256', SECRET).update(label).digest() : null
}

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
