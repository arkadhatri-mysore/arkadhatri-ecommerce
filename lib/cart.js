// Persistent cart utility (localStorage-backed) shared across pages.
// Emits a `cart:changed` window event whenever the cart changes.

const KEY = 'ark_cart_v1'

const safeGet = () => {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(window.localStorage.getItem(KEY) || '[]') } catch { return [] }
}

const save = (items) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent('cart:changed', { detail: items }))
}

export const cart = {
  get: () => safeGet(),
  add: (p, qty = 1) => {
    const items = safeGet()
    const idx = items.findIndex((i) => i.sku === p.sku)
    if (idx >= 0) items[idx].qty += qty
    else items.push({
      sku: p.sku,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline || '',
      price: p.price,
      currency: p.currency || '\u20b9',
      image: (p.images && p.images[0]) || p.image,
      qty
    })
    save(items)
  },
  setQty: (sku, qty) => {
    let items = safeGet()
    if (qty <= 0) items = items.filter((i) => i.sku !== sku)
    else items = items.map((i) => (i.sku === sku ? { ...i, qty } : i))
    save(items)
  },
  remove: (sku) => save(safeGet().filter((i) => i.sku !== sku)),
  clear: () => save([]),
  count: () => safeGet().reduce((n, i) => n + i.qty, 0),
  total: () => safeGet().reduce((s, i) => s + i.price * i.qty, 0)
}

export const inr = (n) => new Intl.NumberFormat('en-IN').format(n)
