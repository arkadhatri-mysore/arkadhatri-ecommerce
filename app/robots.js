const SITE = process.env.NEXT_PUBLIC_BASE_URL || 'https://arkadhatri.com'

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/checkout', '/order-success/'] }
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE
  }
}
