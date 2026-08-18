// Parse and enforce allowed CORS origins from env.
// CORS_ORIGINS is a comma-separated list. Use '*' only for local development.

export function getAllowedOrigins() {
  const raw = (process.env.CORS_ORIGINS || '').trim()
  if (!raw) return []
  return raw.split(',').map(s => s.trim()).filter(Boolean)
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
  const allow = list.includes('*') ? '*' : (list.includes(origin) ? origin : (list[0] || ''))
  if (allow) response.headers.set('Access-Control-Allow-Origin', allow)
  response.headers.set('Vary', 'Origin')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}
