'use client'

// Public store configuration from the server (payments on/off, shipping, contact & social links).
import { useEffect, useState } from 'react'

const DEFAULTS = { paymentsEnabled: false, shippingFlat: 250, freeShippingThreshold: 15000, contactEmail: '', contactPhone: '', whatsappNumber: '', whatsappDisplay: '', instagram: '', youtube: '', pinterest: '' }
let cached = null
let inflight = null

export function useStoreConfig() {
  const [cfg, setCfg] = useState(cached)
  useEffect(() => {
    if (cached) return
    inflight = inflight || fetch('/api/store-config', { cache: 'no-store' }).then((r) => r.json()).then((d) => (cached = { ...DEFAULTS, ...d })).catch(() => ({ ...DEFAULTS }))
    inflight.then((d) => setCfg(d))
  }, [])
  return { config: cfg || DEFAULTS, ready: Boolean(cfg) }
}

export const shippingFor = (subtotal, c) => (subtotal <= 0 || subtotal >= c.freeShippingThreshold ? 0 : c.shippingFlat)
export const waLink = (c, text = '') => {
  const n = String(c.whatsappNumber || '').replace(/\D/g, '')
  return n ? `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}` : ''
}
