import { INDEXABLE, SITE_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'

// Crawling is allowed only on the configured production domain (SITE_URL). Preview hosts are blocked.
export default function robots() {
  if (!INDEXABLE) return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin', '/cart', '/checkout', '/order-success/', '/track-order', '/wishlist'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  }
}
