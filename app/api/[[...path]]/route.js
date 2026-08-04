import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

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
      const order = {
        id: uuidv4(),
        items: body.items,
        customer: body.customer,
        subtotal: Number(body.subtotal) || 0,
        shipping: Number(body.shipping) || 0,
        total: Number(body.total) || 0,
        currency: body.currency || 'INR',
        paymentMethod: body.customer?.paymentMethod || 'razorpay',
        paymentStatus: 'pending',
        status: 'received',
        createdAt: new Date()
      }
      await db.collection('orders').insertOne(order)
      const { _id, ...safe } = order
      return handleCORS(NextResponse.json({ ok: true, order: safe }))
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