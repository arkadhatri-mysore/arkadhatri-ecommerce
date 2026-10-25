'use client'

import { useState } from 'react'
import { Share2, Link2, MessageCircle, Check, Play } from 'lucide-react'
import { useStoreConfig, waLink } from '@/lib/store-config'

const productUrl = (slug) => {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '')
  return `${origin}/product/${slug}`
}

/** Native share, copy link and a WhatsApp enquiry that includes the product name, SKU and link. */
const ShareEnquire = ({ product }) => {
  const { config } = useStoreConfig()
  const [copied, setCopied] = useState(false)
  if (!product) return null
  const url = productUrl(product.slug)
  const wa = waLink(config, `Hello ARKADHATRI, I would like to know more about ${product.name} (SKU ${product.sku}): ${url}`)

  const copy = async () => {
    try { await navigator.clipboard.writeText(url) } catch {
      const t = document.createElement('textarea'); t.value = url; document.body.appendChild(t); t.select()
      try { document.execCommand('copy') } catch {} ; t.remove()
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: `${product.name} — ARKADHATRI`, text: product.tagline || product.name, url }) } catch {} }
    else copy()
  }
  const btn = 'inline-flex items-center gap-2 min-h-11 px-3 font-inter text-sm text-burgundy-ink border border-burgundy-ink/20 rounded-sm hover:border-burgundy-ink transition-colors'
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2" data-testid="share-enquire">
      {wa && <a href={wa} target="_blank" rel="noopener noreferrer" data-testid="pdp-whatsapp-enquiry" className={`${btn} bg-[#1F7A4D] border-[#1F7A4D] text-white hover:bg-[#186640]`}><MessageCircle size={16} strokeWidth={1.6} /> Ask on WhatsApp</a>}
      <button type="button" onClick={share} className={btn} data-testid="pdp-share"><Share2 size={16} strokeWidth={1.5} /> Share</button>
      <button type="button" onClick={copy} className={btn} data-testid="pdp-copy-link" aria-live="polite">{copied ? <Check size={16} /> : <Link2 size={16} strokeWidth={1.5} />} {copied ? 'Link copied' : 'Copy link'}</button>
      {/^https:\/\/(www\.)?(instagram\.com|youtube\.com|youtu\.be|facebook\.com)\//i.test(product.reelUrl || '') && (
        <a href={product.reelUrl} target="_blank" rel="noopener noreferrer" className={btn} data-testid="pdp-reel"><Play size={16} strokeWidth={1.5} /> Watch reel</a>
      )}
    </div>
  )
}

export default ShareEnquire
