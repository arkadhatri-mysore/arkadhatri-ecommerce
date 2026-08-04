import { PRODUCTS, COLLECTIONS } from '@/lib/products'
import { legalSlugs } from '@/lib/legal'

const SITE = process.env.NEXT_PUBLIC_BASE_URL || 'https://arkadhatri.com'

export default function sitemap() {
  const now = new Date()
  return [
    { url: SITE + '/',        lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    ...COLLECTIONS.map((c) => ({ url: `${SITE}/collections/${c.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 })),
    ...PRODUCTS.map((p)     => ({ url: `${SITE}/product/${p.slug}`,     lastModified: now, changeFrequency: 'weekly', priority: 0.9 })),
    ...legalSlugs().map((s) => ({ url: `${SITE}/${s}`,                  lastModified: now, changeFrequency: 'yearly',  priority: 0.4 }))
  ]
}
