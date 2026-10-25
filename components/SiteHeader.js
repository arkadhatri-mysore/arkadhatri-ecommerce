'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, Heart, ShoppingBag } from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'
import SearchOverlay from '@/components/SearchOverlay'
import { cart } from '@/lib/cart'
import { useStoreConfig, waLink } from '@/lib/store-config'

export const COLLECTION_LINKS = [
  { name: 'Silk Sarees', href: '/collections/silk-sarees' },
  { name: 'Wedding Sarees', href: '/collections/wedding-sarees' },
  { name: 'Festival Sarees', href: '/collections/festival-sarees' },
  { name: 'Everyday Elegance', href: '/collections/everyday-elegance' },
  { name: 'New Arrivals', href: '/collections/new-arrivals' }
]
const MAIN_LINKS = [
  { name: 'Shop Sarees', href: '/collections/silk-sarees' },
  { name: 'Wedding', href: '/collections/wedding-sarees' },
  { name: 'Our Story', href: '/#story' },
  { name: 'Contact', href: '/contact' }
]

const BagLink = () => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    setCount(cart.count())
    const sync = () => setCount(cart.count())
    window.addEventListener('cart:changed', sync)
    window.addEventListener('storage', sync)
    return () => { window.removeEventListener('cart:changed', sync); window.removeEventListener('storage', sync) }
  }, [])
  return (
    <Link href="/cart" data-testid="nav-bag" className="relative w-11 h-11 flex items-center justify-center text-burgundy-ink hover:text-gold-dark transition-colors" aria-label={`Shopping bag, ${count} item${count === 1 ? '' : 's'}`}>
      <ShoppingBag size={20} strokeWidth={1.4} />
      {count > 0 && <span className="absolute top-1 right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-burgundy-ink text-ivory text-[10px] font-inter font-semibold">{count}</span>}
    </Link>
  )
}

/** Shared storefront header: mobile-first, keyboard accessible, no overlapping logo. */
const SiteHeader = () => {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { config, ready } = useStoreConfig()
  const wa = waLink(config, 'Hello ARKADHATRI, I would like to enquire about a saree.')
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[90] bg-ivory text-burgundy-ink px-4 py-2 rounded">Skip to content</a>
      {ready && !config.paymentsEnabled && (
        <div data-testid="enquiry-mode-bar" className="bg-burgundy-ink text-ivory text-center font-inter text-[13px] px-4 py-2">
          Online payment is opening soon. To order, {wa ? <a href={wa} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-gold">enquire on WhatsApp</a> : 'contact us'} — no payment is taken on this website yet.
        </div>
      )}
      <header className="on-light sticky top-0 z-50 bg-luxury-ivory/95 backdrop-blur-md border-b border-burgundy-ink/10">
        <div className="container grid grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center h-16 md:h-20 gap-2">
          <div className="flex items-center">
            <button onClick={() => setOpen(true)} className="lg:hidden w-11 h-11 -ml-2 flex items-center justify-center text-burgundy-ink" aria-label="Open menu" aria-expanded={open} data-testid="nav-menu-btn">
              <Menu size={22} strokeWidth={1.4} />
            </button>
            <nav aria-label="Main" className="hidden lg:flex items-center gap-7 lg:gap-9">
              {MAIN_LINKS.map((l) => (
                <Link key={l.name} href={l.href} className="font-inter text-[0.8rem] tracking-[0.14em] uppercase text-burgundy-ink hover:text-gold-dark transition-colors py-2">{l.name}</Link>
              ))}
            </nav>
          </div>
          <Link href="/" className="justify-self-center lg:justify-self-center min-w-0" aria-label="ARKADHATRI home" data-testid="brand-logo">
            <BrandLogo size="md" />
          </Link>
          <div className="flex items-center justify-end gap-0.5">
            <button onClick={() => setSearchOpen(true)} className="hidden sm:flex w-11 h-11 items-center justify-center text-burgundy-ink hover:text-gold-dark transition-colors" aria-label="Search sarees"><Search size={19} strokeWidth={1.4} /></button>
            <Link href="/wishlist" data-testid="nav-wishlist" className="w-11 h-11 flex items-center justify-center text-burgundy-ink hover:text-gold-dark transition-colors" aria-label="Saved sarees"><Heart size={19} strokeWidth={1.4} /></Link>
            <BagLink />
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-burgundy-ink/40" onClick={() => setOpen(false)} />
          <div className="on-light absolute inset-y-0 left-0 w-[86%] max-w-sm bg-luxury-ivory overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 h-16 border-b border-burgundy-ink/10">
              <BrandLogo size="sm" />
              <button ref={closeRef} onClick={() => setOpen(false)} className="w-11 h-11 flex items-center justify-center text-burgundy-ink" aria-label="Close menu"><X size={22} strokeWidth={1.4} /></button>
            </div>
            <nav aria-label="Mobile" className="px-5 py-6">
              <button onClick={() => { setOpen(false); setSearchOpen(true) }} className="w-full flex items-center gap-3 py-3 font-inter text-base text-burgundy-ink border-b border-burgundy-ink/10"><Search size={18} strokeWidth={1.4} /> Search sarees</button>
              {MAIN_LINKS.map((l) => (
                <Link key={l.name} href={l.href} onClick={() => setOpen(false)} className="block py-3.5 font-cormorant text-2xl text-burgundy-ink border-b border-burgundy-ink/10">{l.name}</Link>
              ))}
              <div className="eyebrow mt-8 mb-3">Collections</div>
              {COLLECTION_LINKS.map((c) => (
                <Link key={c.name} href={c.href} onClick={() => setOpen(false)} className="block py-2.5 font-inter text-[15px] text-burgundy-ink/85">{c.name}</Link>
              ))}
              <div className="eyebrow mt-8 mb-3">Help</div>
              {[{ n: 'Track Order', h: '/track-order' }, { n: 'Saved Sarees', h: '/wishlist' }, { n: 'Shipping Policy', h: '/shipping-policy' }, { n: 'FAQ', h: '/faq' }].map((x) => (
                <Link key={x.n} href={x.h} onClick={() => setOpen(false)} className="block py-2.5 font-inter text-[15px] text-burgundy-ink/85">{x.n}</Link>
              ))}
            </nav>
          </div>
        </div>
      )}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

export default SiteHeader
