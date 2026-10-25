import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { signToken, checkAdminSession, checkCredentials, adminConfigured, cookieAttrs, COOKIE_NAME, getAdminRecord, setAdminPassword, passwordProblem, createResetToken, consumeResetToken, needsPasswordChange } from '@/lib/admin-auth'
import { ipFromRequest, limitAll, limitClear } from '@/lib/rate-limit'
import { canTransition, ORDER_STATES } from '@/lib/orders'
import { sendOrderShipped, sendOrderDelivered, sendRefundInitiated, sendAdminPasswordReset, sendAdminPasswordChanged, sendMail, emailPreview, EMAIL_TEMPLATES, mailConfigured } from '@/lib/mailer'
import { initUpload, putChunk, completeUpload } from '@/lib/media'
import { releaseOrderReservation, expireStaleReservations, invalidateStoreSettings } from '@/lib/inventory'

const client = new MongoClient(process.env.MONGO_URL)
const db = client.db(process.env.DB_NAME || 'arkadhatri')

const cors = (res) => {
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return res
}

const OK = (data) => cors(NextResponse.json(data))
const ERR = (msg, code = 400) => cors(NextResponse.json({ error: msg }, { status: code }))

// Seed products from static file into DB if empty
let seeded = false
const seedIfEmpty = async () => {
  if (seeded) return
  const count = await db.collection('products').countDocuments()
  if (count === 0) {
    const { PRODUCTS } = await import('@/lib/products')
    if (PRODUCTS?.length) {
      await db.collection('products').insertMany(PRODUCTS.map(p => ({ ...p, id: uuidv4(), status: 'published', stock: 5, createdAt: new Date() })))
    }
  }
  seeded = true
}

const handleAdmin = async (request, { params }) => {
  await client.connect()
  await seedIfEmpty()
  const path = params?.path || []
  const route = '/' + path.join('/')
  const method = request.method

  const BUSY = 'Too many attempts. Please wait a few minutes and try again.'
  const acct = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()

  // Public: login (layered persistent limits: client IP + admin account)
  if (route === '/admin/login' && method === 'POST') {
    const ip = ipFromRequest(request)
    const body = await request.json().catch(() => ({}))
    const rl = await limitAll([
      [`admin-login:ip:${ip}`, { max: 8, windowMs: 15 * 60_000 }],
      [`admin-login:acct:${String(body?.email || '').trim().toLowerCase().slice(0, 200)}`, { max: 20, windowMs: 15 * 60_000 }]
    ])
    if (!rl.allowed) return ERR(BUSY, 429)
    if (!adminConfigured()) return ERR('Admin login is not configured on this server.', 503)
    if (!(await checkCredentials(db, body?.email, body?.password))) {
      await new Promise((r) => setTimeout(r, 400)) // slow down guessing
      return ERR('Invalid credentials', 401)
    }
    await limitClear(`admin-login:acct:${acct}`)
    const rec = await getAdminRecord(db)
    const token = signToken({ email: acct, role: 'admin', tv: rec.tokenVersion || 0 })
    const res = OK({ ok: true, email: process.env.ADMIN_EMAIL, needsPasswordChange: needsPasswordChange(rec) })
    res.headers.append('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieAttrs(request)}`)
    return res
  }

  if (route === '/admin/logout' && method === 'POST') {
    const res = OK({ ok: true })
    res.headers.append('Set-Cookie', `${COOKIE_NAME}=; ${cookieAttrs(request, 0)}`)
    return res
  }

  // Public: forgot password -> single-use 15-minute link emailed to the configured admin address.
  // Always the same response, so it never reveals whether an email is the admin's or whether email is set up.
  if (route === '/admin/password/forgot' && method === 'POST') {
    const body = await request.json().catch(() => ({}))
    const generic = OK({ ok: true, message: 'If that email belongs to the admin account, a reset link has been sent. It expires in 15 minutes.' })
    const rl = await limitAll([
      [`admin-forgot:ip:${ipFromRequest(request)}`, { max: 5, windowMs: 15 * 60_000 }],
      [`admin-forgot:acct`, { max: 3, windowMs: 15 * 60_000 }]
    ])
    if (!rl.allowed) return ERR(BUSY, 429)
    if (!adminConfigured() || !mailConfigured()) return generic // fail closed silently
    if (String(body?.email || '').trim().toLowerCase() !== acct) return generic
    const token = await createResetToken(db)
    const base = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin
    const sent = await sendAdminPasswordReset(process.env.ADMIN_EMAIL, `${base}/admin/reset-password?token=${encodeURIComponent(token)}`)
    if (!sent?.ok) await db.collection('admin_reset_tokens').deleteMany({})
    return generic
  }

  // Public: reset password with token (single use; signs out every existing admin session)
  if (route === '/admin/password/reset' && method === 'POST') {
    const rl = await limitAll([[`admin-reset:ip:${ipFromRequest(request)}`, { max: 8, windowMs: 15 * 60_000 }]])
    if (!rl.allowed) return ERR(BUSY, 429)
    const body = await request.json().catch(() => ({}))
    const problem = passwordProblem(body?.newPassword)
    if (problem) return ERR(problem, 400)
    if (!(await consumeResetToken(db, body?.token))) return ERR('This reset link is invalid or has expired. Please request a new one.', 400)
    await setAdminPassword(db, body.newPassword)
    await limitClear(`admin-login:acct:${acct}`)
    sendAdminPasswordChanged(process.env.ADMIN_EMAIL, 'reset').catch(() => {})
    const res = OK({ ok: true })
    res.headers.append('Set-Cookie', `${COOKIE_NAME}=; ${cookieAttrs(request, 0)}`)
    return res
  }

  // All other /admin routes require auth
  if (route.startsWith('/admin')) {
    const admin = await checkAdminSession(db, request)
    if (!admin) return ERR('Unauthorized', 401)

    // Change password (requires current password). Signs out all other sessions.
    if (route === '/admin/password' && method === 'POST') {
      const rl = await limitAll([[`admin-pw:ip:${ipFromRequest(request)}`, { max: 6, windowMs: 15 * 60_000 }], [`admin-pw:acct`, { max: 10, windowMs: 15 * 60_000 }]])
      if (!rl.allowed) return ERR(BUSY, 429)
      const body = await request.json().catch(() => ({}))
      if (!(await checkCredentials(db, process.env.ADMIN_EMAIL, body?.currentPassword))) return ERR('Current password is incorrect.', 400)
      const problem = passwordProblem(body?.newPassword)
      if (problem) return ERR(problem, 400)
      if (body.newPassword === body.currentPassword) return ERR('New password must be different from the current one.', 400)
      const tv = await setAdminPassword(db, body.newPassword)
      sendAdminPasswordChanged(process.env.ADMIN_EMAIL, 'changed').catch(() => {})
      const token = signToken({ email: String(process.env.ADMIN_EMAIL).trim().toLowerCase(), role: 'admin', tv })
      const res = OK({ ok: true })
      res.headers.append('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieAttrs(request)}`)
      return res
    }

    // Email: status, branded previews (no SMTP needed) and a test send
    if (route === '/admin/email/status' && method === 'GET') {
      return OK({ configured: mailConfigured(), from: process.env.SMTP_FROM || '', templates: EMAIL_TEMPLATES })
    }
    if (route.match(/^\/admin\/email\/preview\/[a-z-]+$/) && method === 'GET') {
      const html = emailPreview(route.split('/').pop())
      if (!html) return ERR('Unknown template', 404)
      return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
    }
    if (route === '/admin/email/test' && method === 'POST') {
      if (!mailConfigured()) return ERR('Email is not configured yet (SMTP details missing).', 503)
      const body = await request.json().catch(() => ({}))
      const tpl = EMAIL_TEMPLATES.includes(body?.template) ? body.template : 'order-confirmation'
      const r = await sendMail({ to: process.env.ADMIN_EMAIL, subject: `[TEST] ARKADHATRI email: ${tpl}`, html: emailPreview(tpl) })
      if (!r.ok) return ERR(`Email could not be sent: ${r.error || 'unknown error'}`, 502)
      return OK({ ok: true, to: process.env.ADMIN_EMAIL })
    }

    // Refund a paid order through Razorpay (full or partial). Status -> REFUND_INITIATED;
    // the refund.processed webhook later marks it REFUNDED.
    if (route.match(/^\/admin\/orders\/[^/]+\/refund$/) && method === 'POST') {
      const id = route.split('/')[3]
      const order = await db.collection('orders').findOne({ id })
      if (!order) return ERR('Order not found', 404)
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return ERR('Razorpay is not configured, so refunds cannot be processed yet.', 503)
      if (!order.razorpayPaymentId || order.paymentStatus !== 'paid') return ERR('Only paid Razorpay orders can be refunded.', 400)
      if (order.status === ORDER_STATES.REFUND_INITIATED || order.status === ORDER_STATES.REFUNDED) return ERR('A refund has already been started for this order.', 409)
      const body = await request.json().catch(() => ({}))
      const max = Number(order.total) || 0
      const amount = body?.amount != null && body.amount !== '' ? Number(body.amount) : max
      if (!(amount > 0) || amount > max) return ERR(`Refund amount must be between 1 and ${max}.`, 400)
      const reason = String(body?.reason || '').slice(0, 200)
      const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')
      const rr = await fetch(`https://api.razorpay.com/v1/payments/${order.razorpayPaymentId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
        body: JSON.stringify({ amount: Math.round(amount * 100), speed: 'normal', notes: { orderId: order.id, reason }, receipt: `rf_${order.id}`.slice(0, 40) })
      })
      const rd = await rr.json().catch(() => ({}))
      if (!rr.ok) return ERR(`Razorpay refund failed: ${rd?.error?.description || rr.status}`, 502)
      const now = new Date()
      await db.collection('orders').updateOne({ id }, {
        $set: { status: ORDER_STATES.REFUND_INITIATED, refundId: rd.id, refundAmount: amount, refundReason: reason, refundInitiatedAt: now, updatedAt: now }
      })
      const fresh = await db.collection('orders').findOne({ id }, { projection: { _id: 0 } })
      sendRefundInitiated(fresh).catch(e => console.error('mail err', e))
      return OK({ ok: true, refundId: rd.id, status: rd.status, order: fresh })
    }

    if (route === '/admin/me') return OK({ email: admin.email, needsPasswordChange: needsPasswordChange(await getAdminRecord(db)), emailConfigured: mailConfigured() })

    if (route === '/admin/dashboard') {
      const [products, active, oos, orders, pending, subs, contacts, revAgg] = await Promise.all([
        db.collection('products').countDocuments(),
        db.collection('products').countDocuments({ status: 'published' }),
        db.collection('products').countDocuments({ $or: [{ status: 'out-of-stock' }, { stock: { $lte: 0 } }] }),
        db.collection('orders').countDocuments(),
        db.collection('orders').countDocuments({ status: { $in: ['received', 'pending', 'PAYMENT_PENDING', 'PAID', 'PROCESSING', 'PACKED'] } }),
        db.collection('newsletter').countDocuments(),
        db.collection('contact_messages').countDocuments(),
        db.collection('orders').aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]).toArray()
      ])
      return OK({
        products, active, outOfStock: oos, orders, pending, subscribers: subs, contacts,
        revenue: revAgg[0]?.total || 0
      })
    }

    // Products
    if (route === '/admin/products' && method === 'GET') {
      const list = await db.collection('products').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray()
      return OK({ products: list })
    }
    if (route === '/admin/products' && method === 'POST') {
      const body = await request.json().catch(() => null)
      const v = await validateProduct(db, body)
      if (v.error) return ERR(v.error, v.status || 400)
      const doc = { ...v.data, id: uuidv4(), status: v.data.status || 'draft', createdAt: new Date() }
      await db.collection('products').insertOne(doc)
      const { _id, ...safe } = doc
      return OK({ product: safe })
    }
    if (route.startsWith('/admin/products/') && method === 'GET') {
      const id = route.split('/')[3]
      const p = await db.collection('products').findOne({ id }, { projection: { _id: 0 } })
      if (!p) return ERR('Not found', 404)
      return OK({ product: p })
    }
    if (/^\/admin\/products\/[^/]+$/.test(route) && method === 'PUT') {
      const id = route.split('/')[3]
      const existing = await db.collection('products').findOne({ id }, { projection: { _id: 0, id: 1 } })
      if (!existing) return ERR('Product not found', 404)
      const body = await request.json().catch(() => null)
      const v = await validateProduct(db, body, id)
      if (v.error) return ERR(v.error, v.status || 400)
      await db.collection('products').updateOne({ id }, { $set: { ...v.data, updatedAt: new Date() } })
      return OK({ ok: true })
    }
    if (route.startsWith('/admin/products/') && method === 'DELETE') {
      // Reversible archive (orders keep their item snapshots; nothing is erased)
      const id = route.split('/')[3]
      const p = await db.collection('products').findOne({ id }, { projection: { _id: 0, status: 1 } })
      if (!p) return ERR('Product not found', 404)
      if (p.status !== 'archived') {
        await db.collection('products').updateOne({ id }, { $set: { status: 'archived', archivedFromStatus: p.status || 'draft', archivedAt: new Date(), updatedAt: new Date() } })
      }
      return OK({ ok: true, archived: true })
    }
    if (route.match(/^\/admin\/products\/[^/]+\/restore$/) && method === 'POST') {
      const id = route.split('/')[3]
      const p = await db.collection('products').findOne({ id }, { projection: { _id: 0, status: 1, archivedFromStatus: 1 } })
      if (!p) return ERR('Product not found', 404)
      if (p.status !== 'archived') return OK({ ok: true })
      await db.collection('products').updateOne({ id }, { $set: { status: 'draft', restoredAt: new Date(), updatedAt: new Date() }, $unset: { archivedAt: '' } })
      return OK({ ok: true, status: 'draft' })
    }

    // Media uploads (chunked): init -> PUT chunks -> complete
    if (route === '/admin/uploads' && method === 'POST') {
      try {
        const body = await request.json()
        return OK(await initUpload(db, body || {}))
      } catch (e) { return ERR(e.message, e.status || 400) }
    }
    if (route.match(/^\/admin\/uploads\/[^/]+\/chunks\/\d+$/) && method === 'PUT') {
      try {
        const [, , , uploadId, , index] = route.split('/')
        const buf = Buffer.from(await request.arrayBuffer())
        return OK(await putChunk(db, uploadId, index, buf))
      } catch (e) { return ERR(e.message, e.status || 400) }
    }
    if (route.match(/^\/admin\/uploads\/[^/]+\/complete$/) && method === 'POST') {
      try {
        const uploadId = route.split('/')[3]
        return OK(await completeUpload(db, uploadId))
      } catch (e) { return ERR(e.message, e.status || 400) }
    }

    // Orders
    if (route === '/admin/orders' && method === 'GET') {
      await expireStaleReservations(db).catch((e) => console.error('expiry sweep', e))
      const url = new URL(request.url)
      const q = url.searchParams.get('status')
      const filter = q && q !== 'all' ? { status: q } : {}
      const list = await db.collection('orders').find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(200).toArray()
      return OK({ orders: list })
    }
    if (route.startsWith('/admin/orders/') && method === 'GET') {
      const id = route.split('/')[3]
      const o = await db.collection('orders').findOne({ id }, { projection: { _id: 0 } })
      if (!o) return ERR('Not found', 404)
      return OK({ order: o })
    }
    if (route.startsWith('/admin/orders/') && method === 'PUT') {
      const id = route.split('/')[3]
      const body = await request.json()
      const existing = await db.collection('orders').findOne({ id })
      if (!existing) return ERR('Order not found', 404)

      const update = { updatedAt: new Date() }

      // Status transition (validated)
      if (body.status && body.status !== existing.status) {
        if (!canTransition(existing.status, body.status)) {
          return ERR(`Invalid status transition ${existing.status} -> ${body.status}`, 400)
        }
        update.status = body.status
        // Timestamps for milestones
        if (body.status === ORDER_STATES.SHIPPED)          update.shippedAt   = new Date()
        if (body.status === ORDER_STATES.DELIVERED)        update.deliveredAt = new Date()
        if (body.status === ORDER_STATES.OUT_FOR_DELIVERY) update.outForDeliveryAt = new Date()
        if (body.status === ORDER_STATES.REFUND_INITIATED) update.refundInitiatedAt = new Date()
        if (body.status === ORDER_STATES.REFUNDED) { update.refundedAt = new Date(); update.paymentStatus = 'refunded' }
      }

      // Payment status (manual override). Marking "paid" commits the held stock; it is refused if the
      // reservation was already released (prevents selling stock that went back on sale).
      if (body.paymentStatus && ['pending','paid','failed','refunded'].includes(body.paymentStatus) && body.paymentStatus !== existing.paymentStatus) {
        if (body.paymentStatus === 'paid' && !existing.stockReserved && !existing.stockCommitted) {
          return ERR('This order no longer holds stock (cancelled or expired). It cannot be marked paid.', 409)
        }
        update.paymentStatus = body.paymentStatus
        if (body.paymentStatus === 'paid') update.stockCommitted = true
      }

      // Shipping fields
      const shipFields = ['courier','awb','trackingUrl','shipmentStatus','pickupAddress','shippingNotes']
      for (const f of shipFields) if (f in body) update[f] = typeof body[f] === 'string' ? body[f].slice(0, 500) : body[f]

      // Conditional write: fails if someone else changed the status meanwhile
      const w = await db.collection('orders').updateOne({ id, status: existing.status }, { $set: update })
      if (!w.matchedCount) return ERR('This order was just updated elsewhere. Please reload and try again.', 409)
      // Cancelled / failed unpaid orders give their reserved sarees back to stock (exactly once)
      if ([ORDER_STATES.CANCELLED, ORDER_STATES.PAYMENT_FAILED].includes(update.status) && (update.paymentStatus || existing.paymentStatus) !== 'paid') {
        await releaseOrderReservation(db, id, update.status === ORDER_STATES.CANCELLED ? 'cancelled by admin' : 'payment failed')
      }
      const fresh = await db.collection('orders').findOne({ id }, { projection: { _id: 0 } })

      // Trigger transactional emails on state change
      if (update.status === ORDER_STATES.SHIPPED)   sendOrderShipped(fresh).catch(e => console.error('mail err', e))
      if (update.status === ORDER_STATES.DELIVERED) sendOrderDelivered(fresh).catch(e => console.error('mail err', e))

      return OK({ ok: true, order: fresh })
    }

    // Customers (derived from orders)
    if (route === '/admin/customers' && method === 'GET') {
      const agg = await db.collection('orders').aggregate([
        { $group: { _id: '$customer.email', name: { $first: '$customer.fullName' }, phone: { $first: '$customer.mobile' }, orders: { $sum: 1 }, spend: { $sum: '$total' } } },
        { $sort: { spend: -1 } }, { $limit: 200 }
      ]).toArray()
      return OK({ customers: agg.map(c => ({ email: c._id, name: c.name, phone: c.phone, orders: c.orders, spend: c.spend })) })
    }

    // Newsletter subscribers
    if (route === '/admin/newsletter' && method === 'GET') {
      const list = await db.collection('newsletter').find({}, { projection: { _id: 0 } }).sort({ subscribedAt: -1 }).limit(500).toArray()
      return OK({ subscribers: list })
    }

    // Contact messages
    if (route === '/admin/contacts' && method === 'GET') {
      const list = await db.collection('contact_messages').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(200).toArray()
      return OK({ contacts: list })
    }

    // Settings
    if (route === '/admin/settings' && method === 'GET') {
      const s = await db.collection('settings').findOne({ id: 'main' }, { projection: { _id: 0 } })
      return OK({ settings: s || { id: 'main' } })
    }
    if (route === '/admin/settings' && method === 'PUT') {
      const body = await request.json().catch(() => ({}))
      delete body._id
      for (const k of ['shippingFlat', 'freeShippingThreshold']) {
        if (body[k] !== undefined && body[k] !== '') {
          const n = Number(body[k])
          if (!Number.isFinite(n) || n < 0 || n > 1000000) return ERR(`${k} must be a number between 0 and 1000000`, 400)
          body[k] = n
        }
      }
      for (const k of ['instagram', 'youtube', 'pinterest', 'facebook']) {
        if (body[k] && !/^https?:\/\//i.test(String(body[k]))) return ERR(`${k} must be a full link starting with https://`, 400)
      }
      // Homepage text (plain text only, length-capped) and hero image (https link or uploaded media)
      const caps = { heroHeadline: 120, heroSubtitle: 240, heroCtaLabel: 40, storyTitle: 120, storyText: 1200 }
      for (const [k, max] of Object.entries(caps)) {
        if (body[k] !== undefined) body[k] = String(body[k] || '').replace(/[<>]/g, '').slice(0, max).trim()
      }
      if (body.heroImage && !/^(https:\/\/|\/api\/media\/)[^\s"'<>]+$/i.test(String(body.heroImage))) return ERR('Hero image must be an https:// link or an uploaded photo.', 400)
      // Advertising / analytics IDs: strict formats only (no scripts can be injected)
      const idRules = { ga4Id: /^G-[A-Z0-9]{4,16}$/, googleAdsId: /^AW-\d{6,14}$/, metaPixelId: /^\d{8,20}$/ }
      for (const [k, re] of Object.entries(idRules)) {
        if (body[k] === undefined) continue
        body[k] = String(body[k] || '').trim().toUpperCase()
        if (body[k] && !re.test(body[k])) return ERR(`${k} format is not valid.`, 400)
      }
      if (body.trackingEnabled !== undefined) body.trackingEnabled = body.trackingEnabled === true
      await db.collection('settings').updateOne({ id: 'main' }, { $set: { ...body, id: 'main', updatedAt: new Date() } }, { upsert: true })
      invalidateStoreSettings()
      return OK({ ok: true })
    }

    // Coupons
    if (route === '/admin/coupons' && method === 'GET') {
      const list = await db.collection('coupons').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray()
      return OK({ coupons: list })
    }
    if (route === '/admin/coupons' && method === 'POST') {
      const body = await request.json()
      const doc = { ...body, id: uuidv4(), code: (body.code || '').toUpperCase(), used: 0, active: body.active !== false, createdAt: new Date() }
      await db.collection('coupons').insertOne(doc)
      const { _id, ...safe } = doc
      return OK({ coupon: safe })
    }
    if (route.startsWith('/admin/coupons/') && method === 'DELETE') {
      const id = route.split('/')[3]
      await db.collection('coupons').deleteOne({ id })
      return OK({ ok: true })
    }

    // Inventory: quick stock adjustment
    if (route.match(/^\/admin\/products\/[^/]+\/stock$/) && method === 'PATCH') {
      const id = route.split('/')[3]
      const body = await request.json()
      const stock = Math.max(0, Number(body.stock) || 0)
      const status = stock === 0 ? 'out-of-stock' : (body.status || undefined)
      const update = { stock, updatedAt: new Date() }
      if (status) update.status = status
      await db.collection('products').updateOne({ id }, { $set: update })
      return OK({ ok: true, stock, status })
    }

    // Inventory: low stock list (threshold via query, default 3)
    if (route === '/admin/inventory' && method === 'GET') {
      const url = new URL(request.url)
      const threshold = Math.max(0, Number(url.searchParams.get('threshold') || 3))
      const list = await db.collection('products')
        .find({}, { projection: { _id: 0, id: 1, name: 1, sku: 1, stock: 1, status: 1, price: 1, images: 1, fabricType: 1, colourName: 1, colourFamily: 1 } })
        .toArray()
      const outOfStock = list.filter(p => (p.stock ?? 0) <= 0)
      const lowStock = list.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= threshold)
      const healthy = list.filter(p => (p.stock ?? 0) > threshold)
      // Sort each by stock ascending
      const byStock = (a, b) => (a.stock ?? 0) - (b.stock ?? 0)
      return OK({
        threshold,
        totals: { all: list.length, outOfStock: outOfStock.length, lowStock: lowStock.length, healthy: healthy.length },
        products: [...outOfStock, ...lowStock, ...healthy].sort(byStock)
      })
    }

    return ERR('Unknown admin endpoint', 404)
  }

  return ERR('Not admin route')
}

export { handleAdmin }

// Validates + normalises a product body for create/update. Returns { data } or { error, status }.
async function validateProduct(db, body, selfId = null) {
  if (!body || typeof body !== 'object') return { error: 'Invalid product data', status: 400 }
  const data = { ...body }
  delete data._id; delete data.id; delete data.createdAt; delete data.updatedAt
  data.name = String(data.name || '').trim()
  data.sku = String(data.sku || '').trim().toUpperCase()
  if (!data.name) return { error: 'Product name is required', status: 400 }
  if (!data.sku) return { error: 'SKU is required', status: 400 }
  data.slug = String(data.slug || data.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  if (!data.slug) return { error: 'Slug (URL) is invalid', status: 400 }
  data.price = Number(data.price) || 0
  if (!(data.price > 0)) return { error: 'Price must be greater than 0', status: 400 }
  data.comparePrice = Math.max(0, Number(data.comparePrice) || 0)
  data.stock = Math.max(0, parseInt(data.stock, 10) || 0)
  if (data.images != null && !Array.isArray(data.images)) data.images = []
  if (Array.isArray(data.images)) data.images = data.images.map((x) => String(x || '').trim()).filter(Boolean)
  const notSelf = selfId ? { id: { $ne: selfId } } : {}
  const dupSlug = await db.collection('products').findOne({ slug: data.slug, ...notSelf }, { projection: { _id: 1 } })
  if (dupSlug) return { error: `Another product already uses the URL "${data.slug}". Please change the slug.`, status: 409 }
  const dupSku = await db.collection('products').findOne({ sku: data.sku, ...notSelf }, { projection: { _id: 1 } })
  if (dupSku) return { error: `Another product already uses SKU "${data.sku}".`, status: 409 }
  return { data }
}
