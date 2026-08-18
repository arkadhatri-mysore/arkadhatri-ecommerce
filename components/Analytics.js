'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

// GA4 + Meta Pixel loader. No-op if env vars missing.
// Fires page_view on client-side route changes.
export default function Analytics() {
  const path = usePathname()
  const GA = process.env.NEXT_PUBLIC_GA4_ID
  const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID

  useEffect(() => {
    if (!path) return
    // GA4 page_view
    if (GA && typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', { page_path: path, page_location: window.location.href })
    }
    // Meta Pixel page_view
    if (PIXEL && typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView')
    }
  }, [path, GA, PIXEL])

  return (
    <>
      {GA && (
        <>
          <Script
            id="ga4-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA}`}
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA}', { send_page_view: false });
            `}
          </Script>
        </>
      )}
      {PIXEL && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
            n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
            s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
            (window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL}');
          `}
        </Script>
      )}
    </>
  )
}

// Helper: safe event dispatcher used by pages/components.
export function trackEvent(name, params = {}) {
  try {
    if (typeof window === 'undefined') return
    if (typeof window.gtag === 'function') window.gtag('event', name, params)
    // Map to Meta Pixel where applicable
    if (typeof window.fbq === 'function') {
      const map = {
        view_item:      { fb: 'ViewContent',     xf: (p) => ({ content_ids: p.items?.map(i=>i.item_id), content_type: 'product', value: p.value, currency: p.currency || 'INR' }) },
        add_to_cart:    { fb: 'AddToCart',       xf: (p) => ({ content_ids: p.items?.map(i=>i.item_id), content_type: 'product', value: p.value, currency: p.currency || 'INR' }) },
        begin_checkout: { fb: 'InitiateCheckout',xf: (p) => ({ value: p.value, currency: p.currency || 'INR', num_items: p.items?.length }) },
        purchase:       { fb: 'Purchase',        xf: (p) => ({ value: p.value, currency: p.currency || 'INR', content_ids: p.items?.map(i=>i.item_id) }) }
      }
      const m = map[name]
      if (m) window.fbq('track', m.fb, m.xf(params))
    }
  } catch (e) { /* ignore */ }
}

// Purchase deduplication: only fire once per orderId across refresh/back.
export function firePurchaseOnce(order) {
  if (typeof window === 'undefined' || !order?.id) return
  const key = `ark_purchase_${order.id}`
  try { if (sessionStorage.getItem(key)) return } catch {}
  const items = (order.items || []).map(i => ({
    item_id: i.sku, item_name: i.name, price: i.price, quantity: i.qty
  }))
  trackEvent('purchase', {
    transaction_id: order.id,
    value: order.total,
    currency: order.currency || 'INR',
    tax: 0, shipping: order.shipping || 0,
    coupon: order.couponApplied?.code || '',
    items
  })
  try { sessionStorage.setItem(key, '1') } catch {}
}
