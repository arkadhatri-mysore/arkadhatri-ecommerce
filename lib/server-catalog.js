// Server-only catalogue reads for metadata, JSON-LD, sitemap and feeds (published products only).
import { MongoClient } from 'mongodb'
import { PRODUCTS } from '@/lib/products'

const VISIBLE = { status: { $in: ['published', 'out-of-stock'] } }
let clientP = null
const getDb = async () => {
  if (!clientP) clientP = new MongoClient(process.env.MONGO_URL, { serverSelectionTimeoutMS: 4000 }).connect().catch((e) => { clientP = null; throw e })
  return (await clientP).db(process.env.DB_NAME)
}

export async function listPublished() {
  try {
    const db = await getDb()
    const total = await db.collection('products').estimatedDocumentCount()
    if (total === 0) return PRODUCTS
    return await db.collection('products').find(VISIBLE, { projection: { _id: 0 } }).sort({ createdAt: 1, _id: 1 }).toArray()
  } catch { return [] }
}

export async function getPublished(slug) {
  try {
    const db = await getDb()
    const total = await db.collection('products').estimatedDocumentCount()
    if (total === 0) return PRODUCTS.find((p) => p.slug === slug) || null
    return await db.collection('products').findOne({ ...VISIBLE, slug: String(slug) }, { projection: { _id: 0 } })
  } catch { return null }
}

export const inStock = (p) => p.status !== 'out-of-stock' && (p.stock === undefined || Number(p.stock) > 0) && p.inStock !== false
export const plain = (s, max = 160) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, max)
