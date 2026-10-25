// Responsive image helpers for the stock/CDN photos used as placeholders (Unsplash / Pexels support ?w=).
const resize = (url, w) => {
  try {
    const u = new URL(url)
    if (!/images\.unsplash\.com|images\.pexels\.com/.test(u.hostname)) return null
    u.searchParams.set('w', String(w))
    if (u.hostname.includes('unsplash')) { u.searchParams.set('auto', 'format'); u.searchParams.set('fit', 'crop'); u.searchParams.set('q', '78') }
    return u.toString()
  } catch { return null }
}

/** Returns { src, srcSet } for <img>; falls back to the original URL for uploaded media. */
export const responsive = (url, widths = [400, 700, 1000, 1400], base = 800) => {
  if (!url) return { src: '' }
  const first = resize(url, base)
  if (!first) return { src: url }
  return { src: first, srcSet: widths.map((w) => `${resize(url, w)} ${w}w`).join(', ') }
}
