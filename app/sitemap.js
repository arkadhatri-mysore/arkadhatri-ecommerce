import { PRODUCTS, COLLECTIONS } from '@/lib/products'
import { legalSlugs } from '@/lib/legal'
import { MongoClient } from 'mongodb'

export const dynamic = 'force-dynamic'

// Live product slugs from the database (falls back to the built-in catalogue).
async function productSlugs() {
  let client
  try {
    client = new MongoClient(process.env.MONGO_URL, { serverSelectionTimeoutMS: 3000 })
    await client.connect()
    const list = await client.db(process.env.DB_NAME).collection('products')
      .find({ status: { $in: ['published', 'out-of-stock'] } }, { projection: { _id: 0, slug: 1 } }).toArray()
    if (list.length) return list.map((p) => p.slug).filter(Boolean)
  } catch {} finally { await client?.close().catch(() => {}) }
  return PRODUCTS.map((p) => p.slug)
}

const SITE = process.env.NEXT_PUBLIC_BASE_URL || 'https://arkadhatri.com'

export default async function sitemap() {
  const now = new Date()
  const slugs = await productSlugs()
  return [
    { url: SITE + '/',        lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    ...COLLECTIONS.map((c) => ({ url: `${SITE}/collections/${c.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 })),
    ...slugs.map((slug)     => ({ url: `${SITE}/product/${slug}`,     lastModified: now, changeFrequency: 'weekly', priority: 0.9 })),
    ...legalSlugs().map((s) => ({ url: `${SITE}/${s}`,                  lastModified: now, changeFrequency: 'yearly',  priority: 0.4 }))
  ]
}
