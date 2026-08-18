import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { handleAdmin } from '@/lib/admin-api'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // Delegate admin routes to admin API handler
    if (route.startsWith('/admin')) {
      return handleAdmin(request, { params: { path } })
    }

    // Root endpoint - GET /api/root (since /api/ is not accessible with catch-all)
    if (route === '/root' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Hello World" }))
    }
    // Root endpoint - GET /api/root (since /api/ is not accessible with catch-all)
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Hello World" }))
    }

    // Orders - POST /api/orders (create order)
    if (route === '/orders' && method === 'POST') {
      const body = await request.json()
      if (!body?.items?.length || !body?.customer?.email) {
        return handleCORS(NextResponse.json({ error: 'items and customer email are required' }, { status: 400 }))
      }

      // Optional coupon
      let discount = 0
      let couponApplied = null
      if (body.couponCode) {
        const code = String(body.couponCode).toUpperCase()
        const coupon = await db.collection('coupons').findOne({ code })
        if (coupon) {
          const now = new Date()
          const expired = coupon.expiryDate && new Date(coupon.expiryDate) < now
          const overLimit = coupon.usageLimit && coupon.used >= coupon.usageLimit
          const belowMin = coupon.minPurchase && Number(body.subtotal || 0) < Number(coupon.minPurchase)
          if (!expired && !overLimit && !belowMin && coupon.active !== false) {
            discount = coupon.type === 'percentage'
              ? Math.round(Number(body.subtotal || 0) * (Number(coupon.value) / 100))
              : Number(coupon.value) || 0
            couponApplied = { code: coupon.code, type: coupon.type, value: coupon.value, discount }
            await db.collection('coupons').updateOne({ id: coupon.id }, { $inc: { used: 1 } })
          }
        }
      }

      const order = {
        id: uuidv4(),
        items: body.items,
        customer: body.customer,
        subtotal: Number(body.subtotal) || 0,
        shipping: Number(body.shipping) || 0,
        discount,
        couponApplied,
        total: Math.max(0, (Number(body.total) || 0) - discount),
        currency: body.currency || 'INR',
        paymentMethod: body.customer?.paymentMethod || 'razorpay',
        paymentStatus: 'pending',
        status: 'received',
        createdAt: new Date()
      }
      await db.collection('orders').insertOne(order)

      // Decrement product stock (best-effort)
      for (const it of body.items) {
        if (!it?.sku) continue
        try {
          await db.collection('products').updateOne(
            { sku: it.sku },
            { $inc: { stock: -Math.max(1, Number(it.qty) || 1) } }
          )
        } catch (e) {}
      }

      const { _id, ...safe } = order
      return handleCORS(NextResponse.json({ ok: true, order: safe }))
    }

    // Coupons - POST /api/coupons/validate (public)
    if (route === '/coupons/validate' && method === 'POST') {
      const body = await request.json()
      const code = String(body?.code || '').toUpperCase()
      const subtotal = Number(body?.subtotal || 0)
      if (!code) return handleCORS(NextResponse.json({ ok: false, error: 'Coupon code required' }, { status: 400 }))
      const coupon = await db.collection('coupons').findOne({ code })
      if (!coupon) return handleCORS(NextResponse.json({ ok: false, error: 'Invalid coupon code' }, { status: 404 }))
      if (coupon.active === false) return handleCORS(NextResponse.json({ ok: false, error: 'This coupon is inactive' }, { status: 400 }))
      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return handleCORS(NextResponse.json({ ok: false, error: 'This coupon has expired' }, { status: 400 }))
      }
      if (coupon.usageLimit && coupon.used >= coupon.usageLimit) {
        return handleCORS(NextResponse.json({ ok: false, error: 'Coupon usage limit reached' }, { status: 400 }))
      }
      if (coupon.minPurchase && subtotal < Number(coupon.minPurchase)) {
        return handleCORS(NextResponse.json({ ok: false, error: `Minimum order \u20b9 ${coupon.minPurchase} required` }, { status: 400 }))
      }
      const discount = coupon.type === 'percentage'
        ? Math.round(subtotal * (Number(coupon.value) / 100))
        : Number(coupon.value) || 0
      return handleCORS(NextResponse.json({
        ok: true,
        coupon: { code: coupon.code, type: coupon.type, value: coupon.value },
        discount
      }))
    }

    // Payments - POST /api/payments/razorpay/init (SCAFFOLDING)
    // When RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET are provided, this will initialise
    // a real Razorpay order. Until then, returns { mocked: true } so the checkout
    // flow can gracefully record the order as "payment pending".
    if (route === '/payments/razorpay/init' && method === 'POST') {
      const body = await request.json()
      const amount = Math.round(Number(body?.amount || 0) * 100) // paise
      const orderId = body?.orderId
      if (!amount || !orderId) {
        return handleCORS(NextResponse.json({ error: 'amount and orderId required' }, { status: 400 }))
      }

      const keyId = process.env.RAZORPAY_KEY_ID
      const keySecret = process.env.RAZORPAY_KEY_SECRET
      if (!keyId || !keySecret) {
        return handleCORS(NextResponse.json({
          ok: true,
          mocked: true,
          message: 'Razorpay keys not configured. Order recorded as payment_pending.',
          amount,
          orderId
        }))
      }

      // Real Razorpay order creation
      try {
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
        const rzRes = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount,
            currency: body?.currency || 'INR',
            receipt: orderId,
            notes: { orderId }
          })
        })
        const rzData = await rzRes.json()
        if (!rzRes.ok) throw new Error(rzData?.error?.description || 'Razorpay init failed')
        await db.collection('orders').updateOne({ id: orderId }, { $set: { razorpayOrderId: rzData.id, updatedAt: new Date() } })
        return handleCORS(NextResponse.json({ ok: true, mocked: false, keyId, razorpayOrder: rzData }))
      } catch (e) {
        return handleCORS(NextResponse.json({ ok: false, error: e.message }, { status: 500 }))
      }
    }

    // Payments - POST /api/payments/razorpay/verify
    if (route === '/payments/razorpay/verify' && method === 'POST') {
      const body = await request.json()
      const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {}
      const keySecret = process.env.RAZORPAY_KEY_SECRET
      if (!keySecret) {
        // mocked mode: just accept
        await db.collection('orders').updateOne({ id: orderId }, { $set: { paymentStatus: 'pending', updatedAt: new Date() } })
        return handleCORS(NextResponse.json({ ok: true, mocked: true }))
      }
      const crypto = await import('crypto')
      const expected = crypto.createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex')
      if (expected !== razorpay_signature) {
        return handleCORS(NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 400 }))
      }
      await db.collection('orders').updateOne(
        { id: orderId },
        { $set: { paymentStatus: 'paid', razorpayPaymentId: razorpay_payment_id, status: 'confirmed', updatedAt: new Date() } }
      )
      return handleCORS(NextResponse.json({ ok: true }))
    }

    // Orders - GET /api/orders/:id
    if (route.startsWith('/orders/') && method === 'GET') {
      const id = route.split('/')[2]
      const order = await db.collection('orders').findOne({ id })
      if (!order) return handleCORS(NextResponse.json({ error: 'Order not found' }, { status: 404 }))
      const { _id, ...safe } = order
      return handleCORS(NextResponse.json({ order: safe }))
    }

    // Newsletter - POST /api/newsletter
    if (route === '/newsletter' && method === 'POST') {
      const body = await request.json()
      if (!body?.email) return handleCORS(NextResponse.json({ error: 'email required' }, { status: 400 }))
      await db.collection('newsletter').updateOne(
        { email: body.email.toLowerCase() },
        { $set: { email: body.email.toLowerCase(), subscribedAt: new Date() } },
        { upsert: true }
      )
      return handleCORS(NextResponse.json({ ok: true }))
    }

    // Contact - POST /api/contact
    if (route === '/contact' && method === 'POST') {
      const body = await request.json()
      if (!body?.email || !body?.message) return handleCORS(NextResponse.json({ error: 'email and message required' }, { status: 400 }))
      const msg = { id: uuidv4(), name: body.name || '', email: body.email, message: body.message, createdAt: new Date() }
      await db.collection('contact_messages').insertOne(msg)
      return handleCORS(NextResponse.json({ ok: true }))
    }

    // Status endpoints - POST /api/status
    if (route === '/status' && method === 'POST') {
      const body = await request.json()
      
      if (!body.client_name) {
        return handleCORS(NextResponse.json(
          { error: "client_name is required" }, 
          { status: 400 }
        ))
      }

      const statusObj = {
        id: uuidv4(),
        client_name: body.client_name,
        timestamp: new Date()
      }

      await db.collection('status_checks').insertOne(statusObj)
      return handleCORS(NextResponse.json(statusObj))
    }

    // Status endpoints - GET /api/status
    if (route === '/status' && method === 'GET') {
      const statusChecks = await db.collection('status_checks')
        .find({})
        .limit(1000)
        .toArray()

      // Remove MongoDB's _id field from response
      const cleanedStatusChecks = statusChecks.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json(cleanedStatusChecks))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute