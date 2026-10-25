import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { handleAdmin } from '@/lib/admin-api'
import { ORDER_STATES, PAYMENT_STATES } from '@/lib/orders'
import { applyCors } from '@/lib/cors'
import { rateLimit, ipFromRequest, limitAll } from '@/lib/rate-limit'
import { sendOrderConfirmation, sendPaymentFailed, sendRefundProcessed, sendOrderAccessCode, mailConfigured } from '@/lib/mailer'
import { orderAccessReady, genCode, hashCode, safeEq, normaliseOrderRef, findOrdersByRef, contactKind, contactMatches, canAccessOrder, orderCookie, publicOrder, OTP_TTL_MS, OTP_MAX_ATTEMPTS, OTP_RESEND_MS } from '@/lib/order-access'
import { serveMedia } from '@/lib/media'
import { paymentsEnabled, releaseOrderReservation, expireStaleReservations, getStoreSettings, shippingFor } from '@/lib/inventory'

// Node.js runtime is required for `crypto` and MongoDB.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Constant-time HMAC comparison to defeat timing attacks.
function safeEqualHex(aHex, bHex) {
  if (!aHex || !bHex || aHex.length !== bHex.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(aHex, 'utf8'), Buffer.from(bHex, 'utf8'))
  } catch { return false }
}

// -------- MongoDB --------
let client
let db
let connecting = null
async function connectToMongo() {
  // Concurrent first requests share one connection promise (prevents "db is undefined" races)
  if (db) return db
  if (!connecting) connecting = (async () => {
    const c = new MongoClient(process.env.MONGO_URL)
    await c.connect()
    client = c
    const d = c.db(process.env.DB_NAME)
    db = d
    return d
  })().catch((e) => { connecting = null; throw e })
  await connecting
  if (!globalThis.__arkIndexes) {
    globalThis.__arkIndexes = true
    // Ensure indexes (idempotent)
    await Promise.all([
      db.collection('orders').createIndex({ id: 1 }, { unique: true }).catch(()=>{}),
      db.collection('orders').createIndex({ razorpayOrderId: 1 }).catch(()=>{}),
      db.collection('orders').createIndex({ 'customer.email': 1 }).catch(()=>{}),
      db.collection('orders').createIndex({ 'customer.mobile': 1 }).catch(()=>{}),
      db.collection('products').createIndex({ sku: 1 }, { unique: true }).catch(()=>{}),
      db.collection('coupons').createIndex({ code: 1 }, { unique: true }).catch(()=>{}),
      db.collection('webhook_events').createIndex({ eventId: 1 }, { unique: true }).catch(()=>{}),
      db.collection('newsletter').createIndex({ email: 1 }, { unique: true }).catch(()=>{}),
      db.collection('order_otps').createIndex({ purgeAt: 1 }, { expireAfterSeconds: 0 }).catch(()=>{})
    ])
  }
  return db
}

// -------- Helpers --------
const respond = (data, status = 200, request) => applyCors(NextResponse.json(data, { status }), request)

// Server-side recomputation from cart items — never trust client for pricing.
async function recomputeCart(db, items = []) {
  const skus = items.map(i => i.sku).filter(Boolean)
  const products = await db.collection('products').find({ sku: { $in: skus } }).toArray()
  const bySku = new Map(products.map(p => [p.sku, p]))
  let subtotal = 0
  const priced = []
  for (const it of items) {
    const p = bySku.get(it.sku)
    if (!p) throw new Error(`Product not found: ${it.sku}`)
    const qty = Math.max(1, Number(it.qty) || 1)
    const price = Number(p.price) || 0
    subtotal += price * qty
    priced.push({
      sku: p.sku, slug: p.slug, name: p.name,
      price, qty, image: p.images?.[0] || it.image || ''
    })
  }
  return { items: priced, subtotal }
}

async function applyCouponServer(db, code, subtotal) {
  if (!code) return { discount: 0, couponApplied: null, couponDoc: null }
  const coupon = await db.collection('coupons').findOne({ code: String(code).toUpperCase() })
  if (!coupon) throw new Error('Invalid coupon code')
  if (coupon.active === false) throw new Error('Coupon is inactive')
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) throw new Error('Coupon expired')
  if (coupon.usageLimit && coupon.used >= coupon.usageLimit) throw new Error('Coupon usage limit reached')
  if (coupon.minPurchase && subtotal < Number(coupon.minPurchase)) throw new Error(`Minimum order ₹ ${coupon.minPurchase} required`)
  const discount = coupon.type === 'percentage'
    ? Math.round(subtotal * (Number(coupon.value) / 100))
    : Number(coupon.value) || 0
  return { discount, couponApplied: { code: coupon.code, type: coupon.type, value: coupon.value, discount }, couponDoc: coupon }
}

// Atomic stock reservation. Rolls back on partial failure. Returns list of reserved skus.
async function reserveStock(db, items) {
  const reserved = []
  for (const it of items) {
    const qty = Math.max(1, Number(it.qty) || 1)
    const res = await db.collection('products').findOneAndUpdate(
      { sku: it.sku, stock: { $gte: qty } },
      { $inc: { stock: -qty }, $set: { updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    // MongoDB driver v6: returns document directly (or null)
    const doc = res?.value ?? res
    if (!doc) {
      // rollback
      for (const r of reserved) {
        await db.collection('products').updateOne(
          { sku: r.sku }, { $inc: { stock: r.qty } }
        ).catch(()=>{})
      }
      const err = new Error(`Insufficient stock for ${it.sku}`)
      err.sku = it.sku; err.code = 'STOCK_UNAVAILABLE'
      throw err
    }
    reserved.push({ sku: it.sku, qty })
  }
  return reserved
}

async function releaseStock(db, items) {
  for (const it of items || []) {
    const qty = Math.max(1, Number(it.qty) || 1)
    await db.collection('products').updateOne(
      { sku: it.sku }, { $inc: { stock: qty } }
    ).catch(()=>{})
  }
}

// Marks an order PAID exactly once without ever overselling.
// Normal path: the order still holds its reservation -> commit it.
// Late path (reservation expired/cancelled before payment arrived): try to re-reserve;
// if stock is gone, record the payment but flag the order for refund instead of selling stock twice.
async function commitPaidOrder(db, orderId, set) {
  const now = new Date()
  let r = await db.collection('orders').findOneAndUpdate(
    { id: orderId, paymentStatus: PAYMENT_STATES.PENDING, stockReserved: true },
    { $set: { ...set, paymentStatus: PAYMENT_STATES.PAID, status: ORDER_STATES.PAID, stockCommitted: true, paidAt: now, updatedAt: now } },
    { returnDocument: 'after' }
  )
  let doc = r?.value ?? r
  if (doc) return { doc, confirmed: true }
  const o = await db.collection('orders').findOne({ id: orderId })
  if (!o || o.paymentStatus !== PAYMENT_STATES.PENDING) return { doc: o, confirmed: false }
  let reservedOk = true
  try { await reserveStock(db, o.items || []) } catch { reservedOk = false }
  r = await db.collection('orders').findOneAndUpdate(
    { id: orderId, paymentStatus: PAYMENT_STATES.PENDING },
    { $set: {
        ...set, paymentStatus: PAYMENT_STATES.PAID, paidAt: now, updatedAt: now, latePayment: true,
        ...(reservedOk
          ? { status: ORDER_STATES.PAID, stockReserved: true, stockCommitted: true }
          : { stockConflict: true, needsRefundReview: true, adminNote: 'Payment arrived after the reservation expired and the saree is no longer in stock. Please refund.' })
    } },
    { returnDocument: 'after' }
  )
  doc = r?.value ?? r
  if (!doc && reservedOk) await releaseStock(db, o.items || []) // lost a race: give stock back
  return { doc: doc || o, confirmed: Boolean(doc && reservedOk) }
}

async function razorpayCreateOrder({ amount, currency = 'INR', receipt, notes = {} }) {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) return { mocked: true }
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  const r = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency, receipt, notes, payment_capture: 1, capture: 'automatic' })
  })
  const d = await r.json()
  if (!r.ok) throw new Error(d?.error?.description || 'Razorpay order creation failed')
  return { mocked: false, keyId, order: d }
}

// -------- Catalog helpers --------
let catalogSeeded = false
async function seedCatalogIfEmpty(db) {
  if (catalogSeeded) return
  const count = await db.collection('products').countDocuments()
  if (count === 0) {
    const { PRODUCTS } = await import('@/lib/products')
    if (PRODUCTS?.length) {
      const now = Date.now()
      await db.collection('products').insertMany(
        PRODUCTS.map((p, i) => ({ ...p, id: uuidv4(), status: 'published', stock: 5, createdAt: new Date(now + i) }))
      ).catch(() => {})
    }
  }
  catalogSeeded = true
}

// Shape a DB product for the storefront. Never exposes internal admin-only fields.
function publicProduct(p) {
  const stock = Number(p.stock) || 0
  const details = Object.fromEntries(
    Object.entries(p.details || {}).filter(([, v]) => typeof v === 'string' && v.trim())
  )
  const { metaKeywords, archivedFromStatus, archivedAt, restoredAt, ...rest } = p
  const price = Number(p.price) || 0
  const cmp = Number(p.comparePrice) || 0
  return {
    ...rest,
    currency: p.currency || '\u20b9',
    price,
    comparePrice: cmp > price ? cmp : 0, // only a genuine higher "was" price is shown
    images: Array.isArray(p.images) ? p.images.filter(Boolean) : [],
    occasion: Array.isArray(p.occasion) ? p.occasion : [],
    details,
    stock,
    inStock: p.status !== 'out-of-stock' && stock > 0
  }
}

// -------- OPTIONS --------
export async function OPTIONS(request) {
  return applyCors(new NextResponse(null, { status: 200 }), request)
}

// -------- Main router --------
async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // Delegate admin routes
    if (route.startsWith('/admin')) {
      return handleAdmin(request, { params: { path } })
    }

    // Health
    if ((route === '/root' || route === '/' || route === '/health') && method === 'GET') {
      // Safe health check — does NOT expose secrets, DB creds, or PII.
      let dbOk = false
      try { await db.command({ ping: 1 }); dbOk = true } catch {}
      return respond({
        ok: true,
        service: 'arkadhatri-api',
        version: 'v1',
        time: new Date().toISOString(),
        db: dbOk ? 'up' : 'down',
        integrations: {
          razorpay: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
          razorpayWebhook: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
          smtp: Boolean(process.env.SMTP_HOST),
          ga4: Boolean(process.env.NEXT_PUBLIC_GA4_ID),
          metaPixel: Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID)
        }
      }, 200, request)
    }

    // ================= MEDIA (uploaded photos & videos) =================
    if (route.match(/^\/media\/[A-Za-z0-9-]+\.[a-z0-9]+$/) && (method === 'GET' || method === 'HEAD')) {
      return serveMedia(db, route.split('/')[2], request)
    }

    // ================= STORE CONFIG (public, non-secret) =================
    if (route === '/store-config' && method === 'GET') {
      const st = await getStoreSettings(db)
      return respond({ paymentsEnabled: paymentsEnabled(), ...st }, 200, request)
    }

    // ================= PUBLIC CATALOG =================
    // GET /api/catalog          -> all visible products (live from DB, edited via Admin)
    // GET /api/catalog/:slug    -> one visible product
    if ((route === '/catalog' || route.match(/^\/catalog\/[^/]+$/)) && method === 'GET') {
      await seedCatalogIfEmpty(db)
      const visible = { status: { $in: ['published', 'out-of-stock'] } }
      const projection = { _id: 0 }
      if (route === '/catalog') {
        const list = await db.collection('products').find(visible, { projection }).sort({ createdAt: 1, _id: 1 }).toArray()
        return respond({ products: list.map(publicProduct) }, 200, request)
      }
      const slug = decodeURIComponent(route.split('/')[2])
      const p = await db.collection('products').findOne({ ...visible, slug }, { projection })
      if (!p) return respond({ error: 'Not found' }, 404, request)
      return respond({ product: publicProduct(p) }, 200, request)
    }

    // ================= ORDERS =================
    // POST /api/orders  -> create order in PAYMENT_PENDING + reserve stock + (optionally) init Razorpay order
    if (route === '/orders' && method === 'POST') {
      const ip = ipFromRequest(request)
      const rl = await limitAll([[`orders:ip:${ip}`, { max: 10, windowMs: 60_000, blockMs: 5 * 60_000 }]])
      if (!rl.allowed) return respond({ error: 'Too many requests. Please try again in a few minutes.' }, 429, request)
      // Online payment not configured yet: refuse BEFORE validating or reserving any stock.
      if (!paymentsEnabled()) {
        return respond({ error: 'Online payments are opening soon. Please message us on WhatsApp to reserve this saree.', code: 'PAYMENTS_UNAVAILABLE' }, 503, request)
      }
      expireStaleReservations(db).catch((e) => console.error('expiry sweep', e))

      const body = await request.json().catch(() => ({}))
      const cust = body?.customer || {}
      const rlc = await limitAll([[cust.email ? `orders:contact:${String(cust.email).trim().toLowerCase()}` : null, { max: 6, windowMs: 10 * 60_000, blockMs: 15 * 60_000 }]])
      if (!rlc.allowed) return respond({ error: 'Too many requests. Please try again in a few minutes.' }, 429, request)
      const requiredCust = ['fullName','email','mobile','address1','city','state','pincode']
      for (const k of requiredCust) {
        if (!cust[k]) return respond({ error: `Customer field required: ${k}` }, 400, request)
      }
      if (!Array.isArray(body?.items) || body.items.length === 0) {
        return respond({ error: 'Cart is empty' }, 400, request)
      }

      // Server-side price recomputation
      let priced
      try { priced = await recomputeCart(db, body.items) }
      catch (e) { return respond({ error: e.message }, 400, request) }

      // Coupon (server validated)
      let discount = 0, couponApplied = null
      try {
        const c = await applyCouponServer(db, body.couponCode, priced.subtotal)
        discount = c.discount; couponApplied = c.couponApplied
      } catch (e) { return respond({ error: e.message }, 400, request) }

      // Shipping rule (env-configurable)
      const storeCfg = await getStoreSettings(db)
      const shipping = shippingFor(priced.subtotal, storeCfg)
      const total = Math.max(0, priced.subtotal + shipping - discount)

      // Atomic stock reservation
      try { await reserveStock(db, priced.items) }
      catch (e) {
        return respond({ error: e.message, code: e.code || 'STOCK', sku: e.sku }, 409, request)
      }

      // Build order (PAYMENT_PENDING)
      const order = {
        id: uuidv4(),
        items: priced.items,
        customer: {
          fullName: cust.fullName, email: cust.email.toLowerCase(), mobile: cust.mobile,
          address1: cust.address1, address2: cust.address2 || '',
          city: cust.city, state: cust.state, pincode: cust.pincode,
          paymentMethod: cust.paymentMethod || 'razorpay'
        },
        subtotal: priced.subtotal, shipping, discount, couponApplied,
        total, currency: 'INR',
        paymentMethod: cust.paymentMethod || 'razorpay',
        paymentStatus: PAYMENT_STATES.PENDING,
        status: ORDER_STATES.PAYMENT_PENDING,
        stockReserved: true, stockCommitted: false,
        createdAt: new Date(), updatedAt: new Date()
      }

      // Attempt Razorpay order init immediately if keys present
      let razorpay = { mocked: true }
      try {
        razorpay = await razorpayCreateOrder({
          amount: Math.round(total * 100),
          currency: 'INR',
          receipt: order.id,
          notes: { orderId: order.id, email: order.customer.email }
        })
      } catch (e) {
        // fall through with mocked
        razorpay = { mocked: true, error: e.message }
      }
      if (!razorpay.mocked && razorpay.order?.id) {
        order.razorpayOrderId = razorpay.order.id
      }

      // Increment coupon usage AFTER stock reserved & order object built
      if (couponApplied?.code) {
        await db.collection('coupons').updateOne({ code: couponApplied.code }, { $inc: { used: 1 } })
      }

      await db.collection('orders').insertOne(order)

      const created = respond({
        ok: true,
        order: publicOrder(order),
        payment: razorpay.mocked
          ? { mocked: true }
          : { mocked: false, keyId: razorpay.keyId, razorpayOrderId: razorpay.order.id, amount: razorpay.order.amount }
      }, 200, request)
      // The person who just placed the order gets a short-lived session for that order only.
      if (orderAccessReady()) created.headers.append('Set-Cookie', orderCookie(request, order.id))
      return created
    }

    // ================= PRODUCT FEED (Meta Commerce / Google Merchant, published products only) =================
    // GET /api/feed/products.csv — real catalogue data only; no GTIN/MPN invented (identifier_exists = no).
    if (route === '/feed/products.csv' && method === 'GET') {
      const origin = String(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '')
      const list = await db.collection('products').find({ status: { $in: ['published', 'out-of-stock'] } }, { projection: { _id: 0 } }).toArray()
      const q = (v) => `"${String(v ?? '').replace(/\s+/g, ' ').replace(/"/g, '""').trim()}"`
      const head = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'additional_image_link', 'brand', 'identifier_exists', 'product_type', 'color', 'material']
      const rows = list.map((p) => {
        const avail = p.status === 'out-of-stock' || Number(p.stock) <= 0 ? 'out of stock' : 'in stock'
        return [p.sku, `${p.name} - ${p.tagline || 'Saree'}`, p.description || p.tagline, avail, 'new', `${Number(p.price || 0).toFixed(2)} INR`,
          `${origin}/product/${p.slug}`, (p.images || [])[0], (p.images || []).slice(1, 6).join(','), 'ARKADHATRI', 'no',
          `Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing > Saris & Lehengas > ${p.collectionName || 'Sarees'}`, p.colourName, p.fabricType].map(q).join(',')
      })
      return new Response([head.join(','), ...rows].join('\n'), { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Cache-Control': 'public, max-age=900', 'X-Robots-Tag': 'noindex' } })
    }

    // ================= PRIVATE ORDER ACCESS =================
    // Step 1: POST /api/orders/access/request { orderNumber, contact } -> 6-digit code to the email on that order.
    if (route === '/orders/access/request' && method === 'POST') {
      const body = await request.json().catch(() => ({}))
      const contact = String(body?.contact || '').trim().slice(0, 200)
      const kind = contactKind(contact)
      const ref = normaliseOrderRef(body?.orderNumber)
      if (!ref || !kind) return respond({ error: 'Please enter your order number and the email address used for the order.' }, 400, request)
      const ip = ipFromRequest(request)
      const rl = await limitAll([
        [`otp-send:ip:${ip}`, { max: 10, windowMs: 15 * 60_000 }],
        [`otp-send:contact:${contact.toLowerCase()}`, { max: 5, windowMs: 15 * 60_000 }],
        [`otp-send:order:${ref.full || ref.prefix}`, { max: 5, windowMs: 15 * 60_000 }]
      ])
      if (!rl.allowed) return respond({ error: 'Too many requests. Please wait a few minutes and try again.' }, 429, request)
      // SMS needs a text-message provider, which is not set up yet.
      if (kind === 'phone') return respond({ error: 'Text-message codes are not available yet. Please use the email address on your order.', code: 'SMS_UNAVAILABLE' }, 503, request)
      // Fail closed (before any lookup) when email delivery or the server key is missing.
      if (!mailConfigured() || !orderAccessReady()) return respond({ error: 'Order verification is temporarily unavailable. Please contact us on WhatsApp for help with your order.', code: 'DELIVERY_UNAVAILABLE' }, 503, request)
      const generic = respond({ ok: true, message: 'If those details match an order, we have emailed a 6-digit code to the address on that order. It expires in 5 minutes.', resendIn: Math.round(OTP_RESEND_MS / 1000) }, 200, request)
      const order = (await findOrdersByRef(db, ref)).find((o) => contactMatches(o, kind, contact))
      if (!order) return generic
      const now = Date.now()
      const prev = await db.collection('order_otps').findOne({ _id: order.id })
      if (prev?.lastSentAt && now - new Date(prev.lastSentAt).getTime() < OTP_RESEND_MS) return generic // cooldown
      const code = genCode()
      // Replaces any earlier code for this order (old codes stop working).
      await db.collection('order_otps').updateOne(
        { _id: order.id },
        { $set: { codeHash: hashCode(order.id, code), expiresAt: new Date(now + OTP_TTL_MS), attempts: 0, lastSentAt: new Date(now), channel: 'email', purgeAt: new Date(now + 60 * 60_000) } },
        { upsert: true }
      )
      const sent = await sendOrderAccessCode(order.customer.email, order.id, code)
      if (!sent?.ok) {
        await db.collection('order_otps').deleteOne({ _id: order.id })
        return respond({ error: 'Order verification is temporarily unavailable. Please contact us on WhatsApp for help with your order.', code: 'DELIVERY_UNAVAILABLE' }, 503, request)
      }
      return generic
    }

    // Step 2: POST /api/orders/access/verify { orderNumber, code } -> short-lived session for that one order.
    if (route === '/orders/access/verify' && method === 'POST') {
      const body = await request.json().catch(() => ({}))
      const ref = normaliseOrderRef(body?.orderNumber)
      const code = String(body?.code || '').trim()
      const bad = () => respond({ error: 'That code is not valid or has expired. Please request a new code.' }, 400, request)
      if (!ref || !/^\d{6}$/.test(code)) return bad()
      if (!orderAccessReady()) return respond({ error: 'Order verification is temporarily unavailable.', code: 'DELIVERY_UNAVAILABLE' }, 503, request)
      const ip = ipFromRequest(request)
      const rl = await limitAll([
        [`otp-verify:ip:${ip}`, { max: 20, windowMs: 15 * 60_000 }],
        [`otp-verify:order:${ref.full || ref.prefix}`, { max: 10, windowMs: 15 * 60_000 }]
      ])
      if (!rl.allowed) return respond({ error: 'Too many attempts. Please wait a few minutes and try again.' }, 429, request)
      const ids = (await findOrdersByRef(db, ref)).map((o) => o.id)
      if (!ids.length) return bad()
      // Atomically use up one of the 5 attempts on a live code.
      const r = await db.collection('order_otps').findOneAndUpdate(
        { _id: { $in: ids }, expiresAt: { $gt: new Date() }, attempts: { $lt: OTP_MAX_ATTEMPTS } },
        { $inc: { attempts: 1 } },
        { returnDocument: 'after' }
      )
      const otp = r?.value !== undefined ? r.value : r
      if (!otp || !safeEq(hashCode(otp._id, code), otp.codeHash)) return bad()
      // Single use: delete only if it is still the same code (guards against a parallel resend/reuse).
      const del = await db.collection('order_otps').deleteOne({ _id: otp._id, codeHash: otp.codeHash })
      if (!del.deletedCount) return bad()
      const res = respond({ ok: true, orderId: otp._id }, 200, request)
      res.headers.append('Set-Cookie', orderCookie(request, otp._id))
      return res
    }

    if (route === '/orders/access/logout' && method === 'POST') {
      const res = respond({ ok: true }, 200, request)
      res.headers.append('Set-Cookie', orderCookie(request, null))
      return res
    }

    // GET /api/orders/:id  -> only with a session for that order; customer-safe fields only
    if (route.match(/^\/orders\/[^/]+$/) && method === 'GET') {
      const id = route.split('/')[2]
      if (!canAccessOrder(request, id)) return respond({ error: 'Please verify your order to view it.', code: 'VERIFY_REQUIRED' }, 401, request)
      const order = await db.collection('orders').findOne({ id })
      if (!order) return respond({ error: 'Order not found' }, 404, request)
      return respond({ order: publicOrder(order) }, 200, request)
    }

    // POST /api/orders/track { orderId } -> same as above (kept for older links); requires an order session
    if (route === '/orders/track' && method === 'POST') {
      const body = await request.json().catch(() => ({}))
      const ref = normaliseOrderRef(body?.orderId)
      const ids = ref ? (await findOrdersByRef(db, ref)).map((o) => o.id) : []
      const id = ids.find((x) => canAccessOrder(request, x))
      if (!id) return respond({ error: 'Please verify your order to view it.', code: 'VERIFY_REQUIRED' }, 401, request)
      const order = await db.collection('orders').findOne({ id })
      return respond({ order: publicOrder(order) }, 200, request)
    }

    // ================= COUPONS (public) =================
    if (route === '/coupons/validate' && method === 'POST') {
      const rl = rateLimit(`coupon:${ipFromRequest(request)}`, { max: 20, windowMs: 60_000 })
      if (!rl.allowed) return respond({ error: 'Too many attempts.' }, 429, request)
      const body = await request.json()
      const code = String(body?.code || '').toUpperCase()
      const subtotal = Number(body?.subtotal || 0)
      if (!code) return respond({ ok: false, error: 'Coupon code required' }, 400, request)
      try {
        const { discount, couponApplied } = await applyCouponServer(db, code, subtotal)
        return respond({ ok: true, coupon: { code: couponApplied.code, type: couponApplied.type, value: couponApplied.value }, discount }, 200, request)
      } catch (e) {
        const msg = e.message || 'Invalid coupon'
        const status = /not found|invalid/i.test(msg) ? 404 : 400
        return respond({ ok: false, error: msg }, status, request)
      }
    }

    // ================= PAYMENTS =================
    // POST /api/payments/razorpay/init  { orderId } — usually not needed since /orders returns razorpayOrderId,
    // but kept for retry / mocked mode.
    if (route === '/payments/razorpay/init' && method === 'POST') {
      const body = await request.json()
      const orderId = body?.orderId
      if (!orderId) return respond({ error: 'orderId required' }, 400, request)
      if (!canAccessOrder(request, orderId)) return respond({ error: 'Please verify your order first.', code: 'VERIFY_REQUIRED' }, 401, request)
      const order = await db.collection('orders').findOne({ id: orderId })
      if (!order) return respond({ error: 'Order not found' }, 404, request)
      if (order.paymentStatus === PAYMENT_STATES.PAID) return respond({ error: 'Already paid' }, 409, request)

      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return respond({ ok: true, mocked: true, message: 'Razorpay keys not configured. Order in PAYMENT_PENDING.', orderId, amount: Math.round(order.total * 100) }, 200, request)
      }
      try {
        const rz = await razorpayCreateOrder({
          amount: Math.round(order.total * 100),
          currency: 'INR', receipt: order.id, notes: { orderId: order.id }
        })
        if (rz.mocked) return respond({ ok: true, mocked: true, orderId }, 200, request)
        await db.collection('orders').updateOne({ id: order.id }, { $set: { razorpayOrderId: rz.order.id, updatedAt: new Date() } })
        return respond({ ok: true, mocked: false, keyId: rz.keyId, razorpayOrder: rz.order }, 200, request)
      } catch (e) { return respond({ ok: false, error: e.message }, 500, request) }
    }

    // POST /api/payments/razorpay/verify  — called from client after Razorpay Checkout success
    if (route === '/payments/razorpay/verify' && method === 'POST') {
      const body = await request.json().catch(() => ({}))
      const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {}
      if (!orderId) return respond({ error: 'orderId required' }, 400, request)
      if (!canAccessOrder(request, orderId)) return respond({ error: 'Please verify your order first.', code: 'VERIFY_REQUIRED' }, 401, request)

      const existing = await db.collection('orders').findOne({ id: orderId })
      if (!existing) return respond({ error: 'Order not found' }, 404, request)

      // Idempotency: if already paid, just return ok
      if (existing.paymentStatus === PAYMENT_STATES.PAID) {
        return respond({ ok: true, already: true, order: publicOrder(existing) }, 200, request)
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET
      if (!keySecret) {
        // Mocked mode: DO NOT mark as paid; keep PAYMENT_PENDING.
        return respond({ ok: true, mocked: true, message: 'Razorpay not configured; order remains payment_pending.' }, 200, request)
      }
      if (!razorpay_payment_id || !razorpay_signature) {
        return respond({ error: 'razorpay_payment_id and razorpay_signature are required' }, 400, request)
      }
      // CRITICAL: use the SERVER-STORED razorpayOrderId, not the browser-supplied one.
      const serverOrderId = existing.razorpayOrderId
      if (!serverOrderId) {
        return respond({ error: 'Razorpay order not linked to this internal order' }, 409, request)
      }
      if (razorpay_order_id && razorpay_order_id !== serverOrderId) {
        return respond({ error: 'Order mismatch' }, 400, request)
      }
      const expected = crypto.createHmac('sha256', keySecret)
        .update(`${serverOrderId}|${razorpay_payment_id}`).digest('hex')
      if (!safeEqualHex(expected, razorpay_signature)) {
        return respond({ ok: false, error: 'Invalid signature' }, 400, request)
      }

      // Signature is authentic, but authorised != captured. Confirm capture status.
      let captured = false
      try {
        const keyId = process.env.RAZORPAY_KEY_ID
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
        const pr = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
          headers: { 'Authorization': `Basic ${auth}` }, cache: 'no-store'
        })
        const payment = await pr.json()
        captured = payment?.status === 'captured'
      } catch (e) { /* webhook remains authoritative */ }

      // Atomic transition (only if captured; else keep pending — the webhook will finalise)
      let updated, confirmedNow = false
      if (captured) {
        const res = await commitPaidOrder(db, orderId, { razorpayPaymentId: razorpay_payment_id })
        updated = res.doc; confirmedNow = res.confirmed
      } else {
        updated = await db.collection('orders').findOneAndUpdate(
          { id: orderId, paymentStatus: PAYMENT_STATES.PENDING },
          { $set: {
              razorpayPaymentId: razorpay_payment_id,
              signatureVerifiedAt: new Date(),
              updatedAt: new Date()
          } },
          { returnDocument: 'after' }
        )
      }
      const orderDoc = (updated?.value ?? updated) || await db.collection('orders').findOne({ id: orderId })
      if (captured && confirmedNow && orderDoc?.paymentStatus === PAYMENT_STATES.PAID) {
        sendOrderConfirmation(orderDoc).catch(err => console.error('mail err', err))
      }
      return respond({ ok: true, captured, order: publicOrder(orderDoc) }, 200, request)
    }

    // POST /api/payments/razorpay/cancel — customer closed modal; DO NOT release stock immediately.
    // A cron / TTL clean-up is out of scope for MVP; instead, we set a status flag so admin can review.
    if (route === '/payments/razorpay/cancel' && method === 'POST') {
      const body = await request.json()
      const orderId = body?.orderId
      if (!orderId) return respond({ error: 'orderId required' }, 400, request)
      if (!canAccessOrder(request, orderId)) return respond({ error: 'Please verify your order first.', code: 'VERIFY_REQUIRED' }, 401, request)
      const existing = await db.collection('orders').findOne({ id: orderId })
      if (!existing) return respond({ error: 'Order not found' }, 404, request)
      if (existing.paymentStatus === PAYMENT_STATES.PAID) return respond({ ok: true, already: true }, 200, request)
      await db.collection('orders').updateOne(
        { id: orderId, paymentStatus: PAYMENT_STATES.PENDING },
        { $set: { paymentDismissed: true, updatedAt: new Date() } }
      )
      return respond({ ok: true }, 200, request)
    }

    // ================= WEBHOOK =================
    // POST /api/webhooks/razorpay — Razorpay -> our server
    // Header: x-razorpay-signature = HMAC-SHA256(payload, RAZORPAY_WEBHOOK_SECRET)
    if (route === '/webhooks/razorpay' && method === 'POST') {
      const raw = await request.text() // use raw text for signature verification
      const sig = request.headers.get('x-razorpay-signature') || ''
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET
      if (!secret) {
        console.warn('[webhook] RAZORPAY_WEBHOOK_SECRET not configured; rejecting')
        return respond({ error: 'Webhook not configured' }, 503, request)
      }
      const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex')
      if (!safeEqualHex(expected, sig)) return respond({ error: 'Invalid signature' }, 400, request)

      let evt
      try { evt = JSON.parse(raw) } catch { return respond({ error: 'Bad JSON' }, 400, request) }
      const eventId = evt?.id || `${evt?.event}:${evt?.payload?.payment?.entity?.id || evt?.payload?.refund?.entity?.id || ''}`
      // Idempotency guard
      try {
        await db.collection('webhook_events').insertOne({ eventId, event: evt.event, receivedAt: new Date(), payload: evt })
      } catch (e) {
        // duplicate
        return respond({ ok: true, duplicate: true }, 200, request)
      }

      const payment = evt?.payload?.payment?.entity
      const refund = evt?.payload?.refund?.entity
      const rzOrderId = payment?.order_id || refund?.payment_id // refunds carry payment_id — separate lookup below

      // Refund events look up by payment id, everything else by rz order id
      if (evt.event?.startsWith('refund.')) {
        if (!refund?.payment_id) return respond({ ok: true, ignored: 'no refund payment_id' }, 200, request)
        const order = await db.collection('orders').findOne({ razorpayPaymentId: refund.payment_id })
        if (!order) return respond({ ok: true, ignored: 'unknown order for refund' }, 200, request)
        if (evt.event === 'refund.processed') {
          const upd = await db.collection('orders').updateOne(
            { id: order.id, paymentStatus: { $ne: 'refunded' } },
            { $set: { paymentStatus: 'refunded', status: ORDER_STATES.REFUNDED, refundId: refund.id, refundedAt: new Date(), refundAmount: (Number(refund.amount) || 0) / 100, updatedAt: new Date() } }
          )
          if (upd.modifiedCount) {
            const fresh = await db.collection('orders').findOne({ id: order.id }, { projection: { _id: 0 } })
            sendRefundProcessed(fresh).catch(err => console.error('mail err', err))
          }
        } else if (evt.event === 'refund.failed') {
          await db.collection('orders').updateOne(
            { id: order.id },
            { $set: { refundFailed: true, refundFailedReason: refund?.notes?.reason || 'Refund failed', updatedAt: new Date() } }
          )
        }
        return respond({ ok: true, orderId: order.id, event: evt.event }, 200, request)
      }

      // Disputes
      if (evt.event?.startsWith('payment.dispute.')) {
        if (!payment?.order_id) return respond({ ok: true, ignored: 'no order_id' }, 200, request)
        const order = await db.collection('orders').findOne({ razorpayOrderId: payment.order_id })
        if (order) {
          await db.collection('orders').updateOne(
            { id: order.id },
            { $set: { disputed: true, disputeEvent: evt.event, disputedAt: new Date(), updatedAt: new Date() } }
          )
        }
        return respond({ ok: true, event: evt.event }, 200, request)
      }

      if (!rzOrderId) return respond({ ok: true, ignored: 'no order_id' }, 200, request)
      const order = await db.collection('orders').findOne({ razorpayOrderId: rzOrderId })
      if (!order) return respond({ ok: true, ignored: 'unknown order' }, 200, request)

      if (evt.event === 'payment.captured' || evt.event === 'order.paid') {
        const res = await commitPaidOrder(db, order.id, { razorpayPaymentId: payment?.id || order.razorpayPaymentId })
        const fresh = res.doc || await db.collection('orders').findOne({ id: order.id })
        if (res.confirmed) {
          sendOrderConfirmation(fresh).catch(err => console.error('mail err', err))
        }
        return respond({ ok: true, orderId: order.id, status: fresh?.status }, 200, request)
      }
      if (evt.event === 'payment.authorized') {
        // Payment is authorised but not yet captured. With capture:'automatic' on the order,
        // Razorpay will capture shortly; we mark authorised metadata but do not fulfil yet.
        await db.collection('orders').updateOne(
          { id: order.id, paymentStatus: PAYMENT_STATES.PENDING },
          { $set: { authorizedAt: new Date(), razorpayPaymentId: payment.id, updatedAt: new Date() } }
        )
        return respond({ ok: true, orderId: order.id, status: 'AUTHORIZED' }, 200, request)
      }
      if (evt.event === 'payment.failed') {
        const upd = await db.collection('orders').findOneAndUpdate(
          { id: order.id, paymentStatus: PAYMENT_STATES.PENDING },
          { $set: {
              paymentStatus: PAYMENT_STATES.FAILED,
              status: ORDER_STATES.PAYMENT_FAILED,
              paymentFailedAt: new Date(),
              paymentFailedReason: payment?.error_description || payment?.error_reason || 'Payment failed',
              updatedAt: new Date()
          } },
          { returnDocument: 'after' }
        )
        // Release reserved stock (payment.failed can still be superseded by a later capture on UPI retry,
        // so we only release if not already captured)
        const stale = (upd?.value ?? upd) || order
        await releaseOrderReservation(db, order.id, 'payment failed')
        sendPaymentFailed(stale).catch(err => console.error('mail err', err))
        return respond({ ok: true, orderId: order.id, status: 'PAYMENT_FAILED' }, 200, request)
      }
      return respond({ ok: true, ignored: evt.event }, 200, request)
    }

    // ================= NEWSLETTER / CONTACT =================
    if (route === '/newsletter' && method === 'POST') {
      const rl = rateLimit(`nl:${ipFromRequest(request)}`, { max: 6, windowMs: 60_000 })
      if (!rl.allowed) return respond({ error: 'Too many attempts.' }, 429, request)
      const body = await request.json()
      const email = String(body?.email || '').trim().toLowerCase()
      if (!email || !/.+@.+\..+/.test(email)) return respond({ error: 'valid email required' }, 400, request)
      await db.collection('newsletter').updateOne(
        { email }, { $set: { email, subscribedAt: new Date() } }, { upsert: true }
      )
      return respond({ ok: true }, 200, request)
    }

    if (route === '/contact' && method === 'POST') {
      const rl = rateLimit(`contact:${ipFromRequest(request)}`, { max: 6, windowMs: 60_000 })
      if (!rl.allowed) return respond({ error: 'Too many attempts.' }, 429, request)
      const body = await request.json()
      const email = String(body?.email || '').trim().toLowerCase()
      const message = String(body?.message || '').trim()
      if (!email || !message) return respond({ error: 'email and message required' }, 400, request)
      const msg = { id: uuidv4(), name: (body.name || '').slice(0, 120), email, message: message.slice(0, 4000), createdAt: new Date() }
      await db.collection('contact_messages').insertOne(msg)
      return respond({ ok: true }, 200, request)
    }

    // Legacy status
    if (route === '/status' && method === 'POST') {
      const body = await request.json()
      if (!body.client_name) return respond({ error: "client_name is required" }, 400, request)
      const s = { id: uuidv4(), client_name: body.client_name, timestamp: new Date() }
      await db.collection('status_checks').insertOne(s)
      return respond(s, 200, request)
    }
    if (route === '/status' && method === 'GET') {
      const arr = await db.collection('status_checks').find({}).limit(1000).toArray()
      return respond(arr.map(({ _id, ...r }) => r), 200, request)
    }

    return respond({ error: `Route ${route} not found` }, 404, request)
  } catch (error) {
    console.error('API Error:', error)
    return respond({ error: 'Internal server error' }, 500, request)
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
export const HEAD = handleRoute
