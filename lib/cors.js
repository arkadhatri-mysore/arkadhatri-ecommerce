// Parse and enforce allowed CORS origins from env.
// CORS_ORIGINS is a comma-separated list. Use '*' only for local development.

// In production a wildcard is ignored: only the site's own origin (NEXT_PUBLIC_BASE_URL)
// and explicitly listed origins may call the API from a browser. Same-origin requests and
// server-to-server calls (e.g. Razorpay webhooks) do not need CORS at all.
const IS_PROD = process.env.NODE_ENV === 'production'
const ownOrigin = () => { try { return new URL(process.env.NEXT_PUBLIC_BASE_URL || '').origin } catch { return '' } }

export function getAllowedOrigins() {
  const raw = (process.env.CORS_ORIGINS || '').trim()
  const list = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : []
  if (IS_PROD) {
    const strict = list.filter(o => o !== '*')
    const own = ownOrigin()
    if (own && !strict.includes(own)) strict.push(own)
    return strict
  }
  return list
}

export function isAllowedOrigin(origin) {
  if (!origin) return true // same-origin server-to-server
  const list = getAllowedOrigins()
  if (list.includes('*')) return true
  return list.includes(origin)
}

export function applyCors(response, request) {
  const origin = request?.headers?.get?.('origin') || ''
  const list = getAllowedOrigins()
  response.headers.set('Vary', 'Origin')
  if (list.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*') // dev only; no credentials with wildcard
  } else if (origin && list.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}
