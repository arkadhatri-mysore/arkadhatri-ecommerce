'use client'

// Live storefront catalogue.
// Products are read from the database (edited in /admin), so new photos,
// prices, videos and stock show on the shop as soon as they are saved.
// Falls back to the built-in catalogue only if the API cannot be reached.

import { useEffect, useState } from 'react'
import { PRODUCTS } from '@/lib/products'

let cache = null          // last successful product list
let inflight = null       // shared promise so many components = one request
const listeners = new Set()
const EMPTY = Object.freeze([])   // stable reference while loading (prevents render loops)

const load = () => {
  if (inflight) return inflight
  inflight = fetch('/api/catalog', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('catalog ' + r.status))))
    .then((d) => (Array.isArray(d?.products) ? d.products : PRODUCTS))
    .catch(() => cache || PRODUCTS)
    .then((list) => {
      cache = list
      inflight = null
      listeners.forEach((fn) => fn(list))
      return list
    })
  return inflight
}

/** React hook: { products, loading }. Always refreshes once per page view. */
export const useCatalog = () => {
  const [products, setProducts] = useState(cache)
  useEffect(() => {
    const fn = (list) => setProducts(list)
    listeners.add(fn)
    load()
    return () => listeners.delete(fn)
  }, [])
  return { products: products || EMPTY, loading: products === null }
}
