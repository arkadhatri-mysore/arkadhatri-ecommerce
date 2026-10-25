'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { useStoreConfig } from '@/lib/store-config'

// Consent-controlled analytics/ads adapter (GA4, Google Ads, Meta Pixel).
// - Nothing loads unless the owner enabled tracking in Admin -> Settings, set an ID, AND the visitor accepted.
// - IDs are format-validated on the server and client (no arbitrary script injection).
// - No personal data and no private order URLs are ever sent.
const CONSENT_KEY = 'ark_consent_v1'
const RE = { ga4: /^G-[A-Z0-9]{4,16}$/, ads: /^AW-\d{6,14}$/, pixel: /^\d{8,20}$/ }
const PRIVATE = /^\/(admin|order-success|track-order|checkout|cart)(\/|$)/

export const getConsent = () => { try { return localStorage.getItem(CONSENT_KEY) } catch { return null } }
const setConsentValue = (v) => { try { localStorage.setItem(CONSENT_KEY, v) } catch {} ; window.dispatchEvent(new Event('consent:changed')) }
const safePath = (p) => (PRIVATE.test(p || '') ? (p.split('/').slice(0, 2).join('/') || '/') : p)

let active = false // true only after consent + scripts configured

export default function Analytics() {
  const path = usePathname() || '/'
  const { config, ready } = useStoreConfig()
  const [consent, setConsent] = useState(null)
  useEffect(() => {
    setConsent(getConsent())
    const s = () => setConsent(getConsent())
    window.addEventListener('consent:changed', s)
    return () => window.removeEventListener('consent:changed', s)
  }, [])

  const GA = RE.ga4.test(config.ga4Id || '') ? config.ga4Id : ''
  const ADS = RE.ads.test(config.googleAdsId || '') ? config.googleAdsId : ''
  const PIXEL = RE.pixel.test(config.metaPixelId || '') ? config.metaPixelId : ''
  const configured = ready && config.trackingEnabled && Boolean(GA || ADS || PIXEL)
  const isAdmin = path.startsWith('/admin')
  const allowed = configured && consent === 'granted' && !isAdmin
  active = allowed

  useEffect(() => {
    if (!allowed) return
    const page_path = safePath(path)
    if (typeof window.gtag === 'function') window.gtag('event', 'page_view', { page_path, page_location: window.location.origin + page_path })
    if (typeof window.fbq === 'function') window.fbq('track', 'PageView')
  }, [path, allowed])

  if (!configured || isAdmin) return null
  const gtagId = GA || ADS
  return (
    <>
      {consent == null && (
        <div role="dialog" aria-label="Cookie consent" data-testid="consent-banner" className="fixed bottom-3 left-3 right-3 md:left-auto md:right-6 md:max-w-md z-[85] bg-white border border-burgundy-ink/15 shadow-xl rounded-sm p-4 font-inter text-sm text-burgundy-ink">
          <p>We would like to use analytics and advertising cookies to understand visits and measure our ads. No order details are shared. You can change this choice any time from the footer.</p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => setConsentValue('granted')} data-testid="consent-accept" className="min-h-11 px-4 bg-burgundy-ink text-ivory rounded-sm">Accept</button>
            <button onClick={() => setConsentValue('denied')} data-testid="consent-decline" className="min-h-11 px-4 border border-burgundy-ink/30 rounded-sm">Decline</button>
          </div>
        </div>
      )}
      {allowed && gtagId && (
        <>
          <Script id="gtag-src" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());${GA ? `gtag('config','${GA}',{send_page_view:false,allow_google_signals:false});` : ''}${ADS ? `gtag('config','${ADS}');` : ''}`}
          </Script>
        </>
      )}
      {allowed && PIXEL && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');`}
        </Script>
      )}
    </>
  )
}

/** Footer link to reopen the consent choice. Renders only when tracking is configured. */
export function ConsentLink({ className = '' }) {
  const { config } = useStoreConfig()
  if (!config.trackingEnabled || !(config.ga4Id || config.googleAdsId || config.metaPixelId)) return null
  return <button type="button" onClick={() => { try { localStorage.removeItem(CONSENT_KEY) } catch {} ; window.dispatchEvent(new Event('consent:changed')) }} className={className}>Cookie preferences</button>
}

// Event dispatcher used by pages. No-op unless consent + tags are active. Only product/cart data, never PII.
export function trackEvent(name, params = {}) {
  try {
    if (typeof window === 'undefined' || !active) return
    if (typeof window.gtag === 'function') window.gtag('event', name, params)
    if (typeof window.fbq === 'function') {
      const ids = (p) => p.items?.map((i) => i.item_id)
      const map = {
        view_item: ['ViewContent', (p) => ({ content_ids: ids(p), content_type: 'product', value: p.value, currency: p.currency || 'INR' })],
        add_to_cart: ['AddToCart', (p) => ({ content_ids: ids(p), content_type: 'product', value: p.value, currency: p.currency || 'INR' })],
        begin_checkout: ['InitiateCheckout', (p) => ({ value: p.value, currency: p.currency || 'INR', num_items: p.items?.length })],
        purchase: ['Purchase', (p) => ({ value: p.value, currency: p.currency || 'INR', content_ids: ids(p) })]
      }
      const m = map[name]
      if (m) window.fbq('track', m[0], m[1](params), name === 'purchase' && params.transaction_id ? { eventID: params.transaction_id } : undefined)
    }
  } catch { /* ignore */ }
}

// Purchase: call ONLY for a backend-verified paid order. Fires once per order (dedup by order number).
export function firePurchaseOnce(order, tries = 0) {
  if (typeof window === 'undefined' || !order?.id || order.paymentStatus !== 'paid') return
  const txn = String(order.number || order.id.slice(0, 8)).toUpperCase() // never the private order id/URL
  const key = `ark_purchase_${txn}`
  try { if (localStorage.getItem(key)) return } catch {}
  if (!active) return
  if (typeof window.gtag !== 'function' && typeof window.fbq !== 'function') { if (tries < 4) setTimeout(() => firePurchaseOnce(order, tries + 1), 2500); return }
  trackEvent('purchase', {
    transaction_id: txn, value: order.total, currency: order.currency || 'INR', shipping: order.shipping || 0,
    items: (order.items || []).map((i) => ({ item_id: i.sku, item_name: i.name, price: i.price, quantity: i.qty }))
  })
  try { localStorage.setItem(key, '1') } catch {}
}
