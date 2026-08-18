import crypto from 'crypto'

const SECRET = process.env.ADMIN_JWT_SECRET || 'change-me'
const COOKIE = 'ark_admin'
const TTL = 60 * 60 * 24 * 7 // 7 days

export const signToken = (payload) => {
  const data = { ...payload, exp: Math.floor(Date.now() / 1000) + TTL }
  const body = Buffer.from(JSON.stringify(data)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}

export const verifyToken = (token) => {
  if (!token || !token.includes('.')) return null
  const [body, sig] = token.split('.')
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  if (sig !== expected) return null
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (p.exp && p.exp < Math.floor(Date.now() / 1000)) return null
    return p
  } catch { return null }
}

export const COOKIE_NAME = COOKIE
export const COOKIE_MAX_AGE = TTL

export const checkAdmin = (request) => {
  const cookie = request.headers.get('cookie') || ''
  const m = cookie.match(new RegExp(`${COOKIE}=([^;]+)`))
  if (!m) return null
  return verifyToken(decodeURIComponent(m[1]))
}
