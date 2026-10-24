import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { signToken, checkAdmin, checkCredentials, adminConfigured, cookieAttrs, COOKIE_NAME } from '@/lib/admin-auth'
import { rateLimit, ipFromRequest } from '@/lib/rate-limit'
import { canTransition, ORDER_STATES } from '@/lib/orders'
import { sendOrderShipped, sendOrderDelivered } from '@/lib/mailer'
import { initUpload, putChunk, completeUpload } from '@/lib/media'

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

  // Public: login
  if (route === '/admin/login' && method === 'POST') {
    const ip = ipFromRequest(request)
    const rl = rateLimit(`admin-login:${ip}`, { max: 8, windowMs: 15 * 60_000 })
    if (!rl.allowed) return ERR('Too many login attempts. Please wait 15 minutes and try again.', 429)
    if (!adminConfigured()) return ERR('Admin login is not configured on this server.', 503)
    const body = await request.json().catch(() => ({}))
    if (!checkCredentials(body?.email, body?.password)) {
      await new Promise((r) => setTimeout(r, 400)) // slow down guessing
      return ERR('Invalid credentials', 401)
    }
    const token = signToken({ email: String(process.env.ADMIN_EMAIL).trim().toLowerCase(), role: 'admin' })
    const res = OK({ ok: true, email: process.env.ADMIN_EMAIL })
    res.headers.append('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieAttrs(request)}`)
    return res
  }

  if (route === '/admin/logout' && method === 'POST') {
    const res = OK({ ok: true })
    res.headers.append('Set-Cookie', `${COOKIE_NAME}=; ${cookieAttrs(request, 0)}`)
    return res
  }

  // All other /admin routes require auth
  if (route.startsWith('/admin')) {
    const admin = checkAdmin(request)
    if (!admin) return ERR('Unauthorized', 401)

    if (route === '/admin/me') return OK({ email: admin.email })

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
      const id = route.split('/')[3]
      await db.collection('products').deleteOne({ id })
      return OK({ ok: true })
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

      // Payment status (admin manual override, e.g. COD paid)
      if (body.paymentStatus && ['pending','paid','failed','refunded'].includes(body.paymentStatus)) {
        update.paymentStatus = body.paymentStatus
      }

      // Shipping fields
      const shipFields = ['courier','awb','trackingUrl','shipmentStatus','pickupAddress','shippingNotes']
      for (const f of shipFields) if (f in body) update[f] = body[f]

      await db.collection('orders').updateOne({ id }, { $set: update })
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
      const body = await request.json()
      await db.collection('settings').updateOne({ id: 'main' }, { $set: { ...body, id: 'main', updatedAt: new Date() } }, { upsert: true })
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
