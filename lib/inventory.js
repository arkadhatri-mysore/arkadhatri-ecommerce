// Shared inventory + store-settings helpers (used by public API and admin API).
// Guarantees: a reservation is released at most once, never for paid/committed orders,
// and a late payment can never oversell (it must re-reserve stock or is flagged for refund).

export const RESERVATION_TTL_MS = 24 * 60 * 60 * 1000

export const paymentsEnabled = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)

/** Releases an order's reserved stock exactly once. Returns true if this call released it. */
export async function releaseOrderReservation(db, orderId, reason = 'cancelled') {
  const res = await db.collection('orders').findOneAndUpdate(
    { id: orderId, stockReserved: true, stockCommitted: { $ne: true }, paymentStatus: { $ne: 'paid' } },
    { $set: { stockReserved: false, stockReleasedAt: new Date(), stockReleaseReason: reason, updatedAt: new Date() } },
    { returnDocument: 'before' }
  )
  const order = res?.value !== undefined ? res.value : res
  if (!order) return false
  for (const it of order.items || []) {
    const qty = Math.max(1, Number(it.qty) || 1)
    await db.collection('products').updateOne({ sku: it.sku }, { $inc: { stock: qty }, $set: { updatedAt: new Date() } }).catch(() => {})
  }
  return true
}

let lastSweep = 0
/** Cancels unpaid orders older than 24h and releases their stock. Throttled to once per 5 min unless forced. */
export async function expireStaleReservations(db, { force = false } = {}) {
  const now = Date.now()
  if (!force && now - lastSweep < 5 * 60 * 1000) return 0
  lastSweep = now
  const cutoff = new Date(now - RESERVATION_TTL_MS)
  const stale = await db.collection('orders')
    .find({ paymentStatus: 'pending', stockReserved: true, stockCommitted: { $ne: true }, createdAt: { $lt: cutoff } }, { projection: { _id: 0, id: 1 } })
    .limit(200).toArray()
  let n = 0
  for (const { id } of stale) {
    const upd = await db.collection('orders').updateOne(
      { id, paymentStatus: 'pending', stockCommitted: { $ne: true } },
      { $set: { status: 'CANCELLED', cancelReason: 'Payment not completed within 24 hours', expiredAt: new Date(), updatedAt: new Date() } }
    )
    if (upd.modifiedCount && (await releaseOrderReservation(db, id, 'expired'))) n++
  }
  return n
}

// ---------------- store settings (admin Settings -> storefront/checkout) ----------------
let cache = { at: 0, value: null }
export function invalidateStoreSettings() { cache = { at: 0, value: null } }

export async function getStoreSettings(db) {
  if (cache.value && Date.now() - cache.at < 30_000) return cache.value
  const s = (await db.collection('settings').findOne({ id: 'main' }, { projection: { _id: 0 } }).catch(() => null)) || {}
  const num = (v, d) => (v === '' || v == null || isNaN(Number(v)) ? d : Math.max(0, Number(v)))
  const value = {
    shippingFlat: num(s.shippingFlat, num(process.env.SHIPPING_FLAT_RATE, 250)),
    freeShippingThreshold: num(s.freeShippingThreshold, num(process.env.SHIPPING_FREE_ABOVE, 15000)),
    contactEmail: String(s.contactEmail || '').trim(),
    contactPhone: String(s.contactPhone || '').trim(),
    whatsappNumber: String(s.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/[^\d+]/g, ''),
    whatsappDisplay: String(s.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').trim(),
    instagram: /^https?:\/\//.test(s.instagram || '') ? s.instagram : '',
    youtube: /^https?:\/\//.test(s.youtube || '') ? s.youtube : '',
    pinterest: /^https?:\/\//.test(s.pinterest || '') ? s.pinterest : ''
  }
  cache = { at: Date.now(), value }
  return value
}

export const shippingFor = (subtotal, st) => (subtotal <= 0 || subtotal >= st.freeShippingThreshold ? 0 : st.shippingFlat)
