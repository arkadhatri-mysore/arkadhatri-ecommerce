// Private order access: order number + matching contact -> one-time email code -> short-lived order session.
import crypto from 'crypto'
import { deriveServerKey } from '@/lib/admin-auth'

export const OTP_TTL_MS = 5 * 60_000
export const OTP_MAX_ATTEMPTS = 5
export const OTP_RESEND_MS = 60_000
export const ORDER_SESSION_TTL = 30 * 60 // seconds
export const ORDER_COOKIE = 'ark_order'

const codeKey = () => deriveServerKey('order-access-code:v1')
const sessKey = () => deriveServerKey('order-session:v1')
export const orderAccessReady = () => Boolean(codeKey() && sessKey())

export const genCode = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
export const hashCode = (orderId, code) => crypto.createHmac('sha256', codeKey()).update(`${orderId}:${code}`).digest('hex')
export const safeEq = (a, b) => {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''))
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

/** Normalises what the customer typed: a full order id or the 8-character order number shown to them. */
export const normaliseOrderRef = (v) => {
  const s = String(v || '').trim().replace(/^#/, '').toLowerCase()
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s)) return { full: s }
  if (/^[0-9a-f]{8}$/.test(s)) return { prefix: s }
  return null
}
export const findOrdersByRef = async (db, ref) => {
  if (!ref) return []
  const q = ref.full ? { id: ref.full } : { id: { $regex: `^${ref.prefix}-` } }
  return db.collection('orders').find(q, { projection: { _id: 0, id: 1, customer: 1 } }).limit(5).toArray()
}

export const contactKind = (v) => {
  const s = String(v || '').trim()
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return 'email'
  if (s.replace(/\D/g, '').length >= 10 && /^[+\d\s().-]+$/.test(s)) return 'phone'
  return null
}
export const contactMatches = (order, kind, value) => {
  const c = order?.customer || {}
  if (kind === 'email') return safeEq(String(c.email || '').trim().toLowerCase(), String(value).trim().toLowerCase())
  if (kind === 'phone') {
    const a = String(c.mobile || '').replace(/\D/g, '').slice(-10), b = String(value).replace(/\D/g, '').slice(-10)
    return a.length === 10 && safeEq(a, b)
  }
  return false
}

// ---------- Order-scoped session (signed cookie) ----------
export const signOrderSession = (orderId) => {
  const body = Buffer.from(JSON.stringify({ oid: orderId, scope: 'order', exp: Math.floor(Date.now() / 1000) + ORDER_SESSION_TTL })).toString('base64url')
  const sig = crypto.createHmac('sha256', sessKey()).update(body).digest('base64url')
  return `${body}.${sig}`
}
export const orderSessionFrom = (request) => {
  const key = sessKey()
  if (!key) return null
  const m = (request.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${ORDER_COOKIE}=([^;]+)`))
  if (!m) return null
  const [body, sig] = decodeURIComponent(m[1]).split('.')
  if (!body || !sig) return null
  const expected = crypto.createHmac('sha256', key).update(body).digest('base64url')
  if (!safeEq(sig, expected)) return null
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (p?.scope !== 'order' || !p.oid || !p.exp || p.exp < Math.floor(Date.now() / 1000)) return null
    return p
  } catch { return null }
}
export const canAccessOrder = (request, orderId) => {
  const s = orderSessionFrom(request)
  return Boolean(s && orderId && s.oid === orderId)
}
export const orderCookie = (request, orderId, maxAge = ORDER_SESSION_TTL) => {
  const https = process.env.NODE_ENV === 'production' || (request?.headers?.get('x-forwarded-proto') || '').includes('https')
  const v = orderId ? encodeURIComponent(signOrderSession(orderId)) : ''
  return `${ORDER_COOKIE}=${v}; HttpOnly; Path=/; Max-Age=${orderId ? maxAge : 0}; SameSite=Lax${https ? '; Secure' : ''}`
}

/** Customer-safe order view: whitelisted fields only (never internal notes, review flags or payment ids). */
export const publicOrder = (o) => o && ({
  id: o.id,
  number: String(o.id || '').slice(0, 8).toUpperCase(),
  status: o.status,
  paymentStatus: o.paymentStatus,
  items: (o.items || []).map((i) => ({ sku: i.sku, slug: i.slug, name: i.name, qty: i.qty, price: i.price, image: i.image })),
  subtotal: o.subtotal, shipping: o.shipping, discount: o.discount, total: o.total, currency: o.currency || 'INR',
  couponCode: o.couponApplied?.code || null,
  customer: o.customer ? {
    fullName: o.customer.fullName, email: o.customer.email, mobile: o.customer.mobile,
    address1: o.customer.address1, address2: o.customer.address2, city: o.customer.city, state: o.customer.state, pincode: o.customer.pincode
  } : null,
  courier: o.courier || null, awb: o.awb || null, trackingUrl: o.trackingUrl || null, shipmentStatus: o.shipmentStatus || null,
  createdAt: o.createdAt, placedAt: o.createdAt, paidAt: o.paidAt || null, shippedAt: o.shippedAt || null, deliveredAt: o.deliveredAt || null
})
