import { COLLECTIONS } from '@/lib/products'
import { legalSlugs } from '@/lib/legal'
import { listPublished } from '@/lib/server-catalog'
import { ORIGIN } from '@/lib/site'

export const dynamic = 'force-dynamic'

// Published products + collections + policy pages on the configured site origin.
export default async function sitemap() {
  const now = new Date()
  const products = await listPublished()
  return [
    { url: `${ORIGIN}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    ...COLLECTIONS.map((c) => ({ url: `${ORIGIN}/collections/${c.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 })),
    ...products.filter((p) => p.slug).map((p) => ({ url: `${ORIGIN}/product/${p.slug}`, lastModified: p.updatedAt || p.createdAt || now, changeFrequency: 'weekly', priority: 0.8 })),
    ...legalSlugs().map((s) => ({ url: `${ORIGIN}/${s}`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 }))
  ]
}
