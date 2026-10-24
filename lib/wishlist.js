'use client'

// Saved sarees (wishlist) stored on this device (localStorage). Emits `wishlist:changed`.
import { useEffect, useState } from 'react'

const KEY = 'ark_wishlist_v1'
const read = () => {
  if (typeof window === 'undefined') return []
  try { const v = JSON.parse(window.localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.filter((s) => typeof s === 'string') : [] } catch { return [] }
}
const write = (list) => {
  try { window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200))) } catch {}
  window.dispatchEvent(new CustomEvent('wishlist:changed', { detail: list }))
}

export const wishlist = {
  get: read,
  has: (slug) => read().includes(slug),
  toggle: (slug) => {
    const list = read()
    const next = list.includes(slug) ? list.filter((s) => s !== slug) : [slug, ...list]
    write(next)
    return next.includes(slug)
  },
  remove: (slug) => write(read().filter((s) => s !== slug))
}

/** React hook: [savedSlugs, ready]. `ready` is false until read on the client (avoids false empty states). */
export function useWishlist() {
  const [list, setList] = useState([])
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const sync = () => setList(read())
    sync(); setReady(true)
    window.addEventListener('wishlist:changed', sync)
    window.addEventListener('storage', sync)
    return () => { window.removeEventListener('wishlist:changed', sync); window.removeEventListener('storage', sync) }
  }, [])
  return [list, ready]
}
