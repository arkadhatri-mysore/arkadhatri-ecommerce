import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { signToken, checkAdmin, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/admin-auth'

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
    const { email, password } = await request.json()
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return ERR('Invalid credentials', 401)
    }
    const token = signToken({ email, role: 'admin' })
    const res = OK({ ok: true, email })
    res.headers.append('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`)
    return res
  }

  if (route === '/admin/logout' && method === 'POST') {
    const res = OK({ ok: true })
    res.headers.append('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`)
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
        db.collection('orders').countDocuments({ status: { $in: ['received', 'pending'] } }),
        db.collection('newsletter').countDocuments(),
        db.collection('contact_messages').countDocuments(),
        db.collection('orders').aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]).toArray()
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
      const body = await request.json()
      const doc = { ...body, id: uuidv4(), status: body.status || 'draft', stock: Number(body.stock) || 0, price: Number(body.price) || 0, comparePrice: Number(body.comparePrice) || 0, createdAt: new Date() }
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
    if (route.startsWith('/admin/products/') && method === 'PUT') {
      const id = route.split('/')[3]
      const body = await request.json()
      delete body._id
      body.price = Number(body.price) || 0
      body.comparePrice = Number(body.comparePrice) || 0
      body.stock = Number(body.stock) || 0
      body.updatedAt = new Date()
      await db.collection('products').updateOne({ id }, { $set: body })
      return OK({ ok: true })
    }
    if (route.startsWith('/admin/products/') && method === 'DELETE') {
      const id = route.split('/')[3]
      await db.collection('products').deleteOne({ id })
      return OK({ ok: true })
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
      await db.collection('orders').updateOne({ id }, { $set: { status: body.status, paymentStatus: body.paymentStatus, updatedAt: new Date() } })
      return OK({ ok: true })
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
