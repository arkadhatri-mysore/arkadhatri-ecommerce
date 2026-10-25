// Single source for the public site origin used in canonical URLs, sitemaps and share previews.
// SITE_URL must be the owner's final production domain (e.g. https://www.example.com).
// While it is not set (preview / temporary hosts) every page is marked noindex and robots blocks crawling.
export const SITE_URL = String(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
export const INDEXABLE = /^https:\/\//.test(SITE_URL)
// Origin for absolute links in previews (falls back to the current deployment URL, never an invented domain).
export const ORIGIN = SITE_URL || String(process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '')

/** Safe JSON-LD string: escapes characters that could close the <script> tag. */
export const jsonLd = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')

export const NOINDEX = { index: false, follow: false, googleBot: { index: false, follow: false } }
