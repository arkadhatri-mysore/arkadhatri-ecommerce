'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Menu, X, Search, ShoppingBag, Heart, User, ChevronDown,
  Instagram, Youtube, MapPin, Star, ArrowRight, ShieldCheck, Truck, Sparkles, Award, MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import { cart, inr } from '@/lib/cart'
import { PRODUCTS } from '@/lib/products'
import SearchOverlay from '@/components/SearchOverlay'
import CraftJourney from '@/components/CraftJourney'
import LuxuryVideo from '@/components/LuxuryVideo'

/* ---------------------- ASSETS ---------------------- */
const LOGO_URL = 'https://customer-assets-jt897jd0.emergentagent.net/job_timeless-crafted-8/artifacts/xkx14q2d_ARK%20LOGO.jpeg'

const IMG = {
  // Hero: Kanjivaram bridal with jasmine + kaasu maalai — authentic South Indian
  hero: 'https://images.unsplash.com/photo-1619516388835-2b60acc4049e?auto=format&fit=crop&w=2200&q=85',

  // Story: classical South Indian styling / temple jewellery detail
  story: 'https://images.unsplash.com/photo-1783864424950-ccca6d6d52aa?auto=format&fit=crop&w=1600&q=85',

  collections: [
    { title: 'Silk Sarees',       tag: 'The Signature Weave', href: '/collections/silk-sarees',       img: 'https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?auto=format&fit=crop&w=1200&q=85' },
    { title: 'Wedding Sarees',    tag: 'For The Bride',       href: '/collections/wedding-sarees',    img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85' },
    { title: 'Festival Sarees',   tag: 'Occasion Silks',      href: '/collections/festival-sarees',   img: 'https://images.unsplash.com/flagged/photo-1551854716-8b811be39e7e?auto=format&fit=crop&w=1200&q=85' },
    { title: 'Daily Wear Sarees', tag: 'Everyday Elegance',   href: '/collections/everyday-elegance', img: 'https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?auto=format&fit=crop&w=1200&q=85' },
    { title: 'New Arrivals',      tag: 'Just In',             href: '/collections/new-arrivals',      img: 'https://images.unsplash.com/photo-1742287721821-ddf522b3f37b?auto=format&fit=crop&w=1200&q=85' }
  ],

  featured: [
    { name: 'Kavya',    sku: 'ARK-KV-001', slug: 'kavya',    price: 24500, desc: 'Kanjivaram Silk • Deep Ruby',         img: 'https://images.unsplash.com/photo-1619516388835-2b60acc4049e?auto=format&fit=crop&w=1200&q=85' },
    { name: 'Bhavana',  sku: 'ARK-BH-002', slug: 'bhavana',  price: 18900, desc: 'Mysore Silk • Royal Purple',          img: 'https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?auto=format&fit=crop&w=1200&q=85' },
    { name: 'Meenakshi',sku: 'ARK-MK-003', slug: 'meenakshi',price: 38500, desc: 'Temple Border • Bridal Red',          img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85' },
    { name: 'Anjali',   sku: 'ARK-AJ-004', slug: 'anjali',   price: 22900, desc: 'Festival Silk • Emerald & Gold',      img: 'https://images.unsplash.com/photo-1758120221788-d576fa58f520?auto=format&fit=crop&w=1200&q=85' },
    { name: 'Lakshmi',  sku: 'ARK-LK-005', slug: 'lakshmi',  price: 26400, desc: 'Kanjivaram Silk • Bridal Gold',       img: 'https://images.unsplash.com/photo-1774437775332-eb986805d0e7?auto=format&fit=crop&w=1200&q=85' },
    { name: 'Anagha',   sku: 'ARK-AN-006', slug: 'anagha',   price: 19500, desc: 'Zari Border • Antique Gold',          img: 'https://images.unsplash.com/photo-1742287721821-ddf522b3f37b?auto=format&fit=crop&w=1200&q=85' },
    { name: 'Radhika',  sku: 'ARK-RD-007', slug: 'radhika',  price: 21900, desc: 'Handwoven Silk • Traditional Weave',  img: 'https://images.unsplash.com/photo-1742287724816-4a8a1cc7ad5c?auto=format&fit=crop&w=1200&q=85' },
    { name: 'Rukmini',  sku: 'ARK-RK-008', slug: 'rukmini',  price: 42000, desc: 'Heritage Silk • Zari Detail',         img: 'https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?auto=format&fit=crop&w=1200&q=85' }
  ],

  // Instagram: fabric texture, temple border, pallu, zari, jasmine still-life
  gallery: [
    'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=800&q=85',
    'https://images.pexels.com/photos/6487380/pexels-photo-6487380.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.unsplash.com/photo-1623171404570-1d196759fe20?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1612380635121-411eda9ecbb9?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1630663124437-382b3831e7d8?auto=format&fit=crop&w=800&q=85',
    'https://images.pexels.com/photos/34155081/pexels-photo-34155081.jpeg?auto=compress&cs=tinysrgb&w=800'
  ]
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
}

/* ---------------------- LOGO ---------------------- */
const Logo = ({ size = 56 }) => (
  <img src={LOGO_URL} alt="ARKADHATRI" style={{ height: size, width: 'auto' }} className="object-contain select-none" draggable={false} />
)

/* ---------------------- ANIMATED BAG ---------------------- */
const AnimatedBag = () => {
  const [count, setCount] = useState(0)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    setCount(cart.count())
    const sync = () => {
      setCount(cart.count())
      setPulse(true)
      setTimeout(() => setPulse(false), 700)
    }
    window.addEventListener('cart:changed', sync)
    return () => window.removeEventListener('cart:changed', sync)
  }, [])

  return (
    <Link href="/cart" className="relative text-ivory hover:text-gold transition-colors" aria-label="Shopping bag">
      <motion.div animate={pulse ? { scale: [1, 1.18, 1] } : { scale: 1 }} transition={{ duration: 0.6 }}>
        <ShoppingBag size={19} strokeWidth={1.3} />
      </motion.div>
      <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-gold text-burgundy text-[9px] font-cinzel font-semibold">
        <AnimatePresence mode="popLayout">
          <motion.span key={count} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.3 }}>
            {count}
          </motion.span>
        </AnimatePresence>
      </span>
    </Link>
  )
}

/* ---------------------- ADD TO BAG ---------------------- */
const AddToBagButton = ({ product, size = 'md' }) => {
  const [added, setAdded] = useState(false)
  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 2200)
    return () => clearTimeout(t)
  }, [added])

  const click = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (added) return
    cart.add(product)
    setAdded(true)
  }

  return (
    <motion.button
      onClick={click}
      animate={{ backgroundColor: added ? '#C8A45A' : 'rgba(0,0,0,0)', color: added ? '#4A0F1C' : '#C8A45A' }}
      transition={{ duration: 0.35 }}
      className={`btn-product w-full ${size === 'sm' ? 'h-9 text-[0.55rem]' : ''}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {added ? (
          <motion.span key="a" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12 L10 18 L20 6" stroke="#4A0F1C" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Added to Bag
          </motion.span>
        ) : (
          <motion.span key="b" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.3 }}>
            Add to Bag
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

/* ---------------------- NAV ---------------------- */
const Nav = () => {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [collectionsOpen, setCollectionsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const collections = [
    { name: 'Silk Sarees',       href: '/collections/silk-sarees' },
    { name: 'Wedding Sarees',    href: '/collections/wedding-sarees' },
    { name: 'Festival Sarees',   href: '/collections/festival-sarees' },
    { name: 'Daily Wear Sarees', href: '/collections/everyday-elegance' },
    { name: 'New Arrivals',      href: '/collections/new-arrivals' }
  ]

  const links = [
    { name: 'Home', href: '#top' },
    { name: 'Collections', href: '#collections', hasSub: true },
    { name: 'Craft', href: '#craft' },
    { name: 'About', href: '#story' },
    { name: 'Contact', href: '#contact' }
  ]

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-burgundy-ink/95 backdrop-blur-md py-3 border-b border-gold/15' : 'py-5 bg-transparent'}`}>
        <div className="container flex items-center justify-between">
          {/* Mobile menu btn */}
          <button onClick={() => setOpen(true)} className="md:hidden text-ivory hover:text-gold transition-colors" aria-label="Open menu">
            <Menu size={22} strokeWidth={1.3} />
          </button>

          {/* Desktop links (left) */}
          <nav className="hidden md:flex items-center gap-8">
            {links.slice(0, 2).map((l) => (
              <div key={l.name} className="relative" onMouseEnter={() => l.hasSub && setCollectionsOpen(true)} onMouseLeave={() => l.hasSub && setCollectionsOpen(false)}>
                <a href={l.href} className="font-cinzel text-[0.65rem] tracking-[0.35em] text-ivory hover:text-gold transition-colors flex items-center gap-1">
                  {l.name.toUpperCase()}
                  {l.hasSub && <ChevronDown size={12} strokeWidth={1.3} className={`transition-transform ${collectionsOpen ? 'rotate-180' : ''}`} />}
                </a>
                {l.hasSub && (
                  <AnimatePresence>
                    {collectionsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.25 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-burgundy-ink border border-gold/25 rounded-md py-3 min-w-[220px]"
                        style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)' }}
                      >
                        {collections.map((c) => (
                          <a key={c.name} href={c.href} className="block px-6 py-2.5 font-cormorant text-ivory hover:text-gold hover:bg-burgundy transition-colors text-base">
                            {c.name}
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Center logo */}
          <a href="#top" className="absolute left-1/2 -translate-x-1/2">
            <Logo size={scrolled ? 46 : 58} />
          </a>

          {/* Desktop right links + icons */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8">
              {links.slice(2).map((l) => (
                <a key={l.name} href={l.href} className="font-cinzel text-[0.65rem] tracking-[0.35em] text-ivory hover:text-gold transition-colors">
                  {l.name.toUpperCase()}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-4 sm:gap-5">
              <button onClick={() => setSearchOpen(true)} className="text-ivory hover:text-gold transition-colors" aria-label="Search"><Search size={18} strokeWidth={1.3} /></button>
              <button className="text-ivory hover:text-gold transition-colors hidden sm:block" aria-label="Account"><User size={18} strokeWidth={1.3} /></button>
              <button className="text-ivory hover:text-gold transition-colors" aria-label="Wishlist"><Heart size={18} strokeWidth={1.3} /></button>
              <AnimatedBag />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[70] bg-burgundy-ink md:hidden overflow-y-auto">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gold/15">
              <Logo size={44} />
              <button onClick={() => setOpen(false)} className="text-ivory" aria-label="Close"><X size={22} strokeWidth={1.3} /></button>
            </div>
            <nav className="px-6 py-8 flex flex-col">
              {links.map((l) => (
                <a key={l.name} href={l.href} onClick={() => setOpen(false)} className="font-cormorant text-3xl text-ivory hover:text-gold py-4 border-b border-gold/10 transition-colors">
                  {l.name}
                </a>
              ))}
              <div className="mt-8">
                <div className="eyebrow mb-4">— Shop Collections</div>
                {collections.map((c) => (
                  <a key={c.name} href={c.href} onClick={() => setOpen(false)} className="block font-cormorant text-xl text-ivory/80 hover:text-gold py-2.5 transition-colors">
                    {c.name}
                  </a>
                ))}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

/* ---------------- HERO ---------------- */
const HERO_VIDEO = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || ''
const Hero = () => (
  <section id="top" className="relative min-h-[100svh] w-full overflow-hidden bg-burgundy-ink">
    <div className="absolute inset-0">
      {HERO_VIDEO ? (
        <LuxuryVideo
          src={HERO_VIDEO}
          poster={IMG.hero}
          alt="ARKADHATRI South Indian Silk Saree"
          ratio="16/9"
          className="!aspect-auto w-full h-full"
          controls="none"
        />
      ) : (
        <img src={IMG.hero} alt="ARKADHATRI South Indian Silk Saree" className="w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-burgundy-ink/70 via-burgundy/45 to-burgundy-ink/90" />
      <div className="absolute inset-0 bg-burgundy/25" />
    </div>

    <div className="relative z-10 min-h-[100svh] flex flex-col items-center justify-center px-6 text-center pt-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="eyebrow mb-6">
        — SOUTH INDIAN SAREE BOUTIQUE
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="font-cinzel text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.2em] gold-metallic-text" style={{ fontWeight: 600 }}>
        ARKADHATRI
      </motion.h1>
      <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 1, delay: 0.5 }} className="gold-line w-32 md:w-56 my-6" />
      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.6 }}
        className="font-cormorant italic text-warm-grey text-xl md:text-2xl max-w-2xl">
        Timeless South Indian Elegance
      </motion.p>
      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.75 }}
        className="mt-2 font-cormorant text-lg md:text-xl text-ivory/80 max-w-2xl">
        Curated Sarees Inspired by Tradition
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.95 }} className="mt-10 flex flex-col sm:flex-row items-center gap-4">
        <a href="#collections" className="btn-luxury-filled">Explore the Collection</a>
        <a href="#craft" className="btn-luxury">Discover the Craft</a>
      </motion.div>
    </div>
  </section>
)

/* ---------------------- SHOP BY COLLECTION ---------------------- */
const Collections = () => (
  <section id="collections" className="bg-burgundy py-24 md:py-32">
    <div className="container">
      <motion.div {...fadeUp} className="text-center mb-14 md:mb-20">
        <div className="eyebrow mb-4">— SHOP BY COLLECTION</div>
        <h2 className="font-cormorant text-4xl md:text-6xl text-ivory">A Curated Wardrobe of Silks</h2>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-5">
        {IMG.collections.map((c, i) => {
          // First two large (3 cols), remaining three (2 cols)
          const span = i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'
          return (
            <motion.a
              key={c.title}
              href={c.href}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.08 }}
              className={`luxury-card group relative aspect-[4/5] ${span}`}
            >
              <img src={c.img} alt={c.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-burgundy-ink via-burgundy-ink/25 to-transparent opacity-90" />
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <div className="eyebrow mb-2">{c.tag}</div>
                <div className="flex items-end justify-between">
                  <h3 className="font-cormorant text-3xl md:text-4xl text-ivory">{c.title}</h3>
                  <ArrowRight size={22} strokeWidth={1.2} className="text-gold -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500" />
                </div>
              </div>
            </motion.a>
          )
        })}
      </div>
    </div>
  </section>
)

/* ---------------------- FEATURED COLLECTION ---------------------- */
const Featured = () => (
  <section id="featured" className="bg-burgundy-deep py-24 md:py-32">
    <div className="container">
      <motion.div {...fadeUp} className="text-center mb-14 md:mb-20">
        <div className="eyebrow mb-4">— FEATURED COLLECTION</div>
        <h2 className="font-cormorant text-4xl md:text-6xl text-ivory">Eight Signature Sarees</h2>
        <p className="mt-4 font-cormorant italic text-warm-grey text-lg">Handpicked from our current curation.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {IMG.featured.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: (i % 4) * 0.06 }}
            className="group"
          >
            <a href={`/product/${p.slug}`} className="block luxury-card relative aspect-[3/4] mb-4">
              <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              {i === 4 && <span className="absolute top-3 left-3 px-2.5 py-1 bg-burgundy-ink/85 border border-gold/40 font-cinzel text-[0.5rem] tracking-[0.3em] text-gold">NEW</span>}
              {/* hover actions */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                <button aria-label="Wishlist" className="w-9 h-9 bg-burgundy-ink/85 border border-gold/40 flex items-center justify-center hover:bg-gold group/i transition-colors rounded-sm">
                  <Heart size={13} strokeWidth={1.3} className="text-gold group-hover/i:text-burgundy" />
                </button>
              </div>
              <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                <AddToBagButton product={{ ...p, images: [p.img], sku: p.sku, currency: '\u20b9' }} size="sm" />
              </div>
            </a>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-cormorant text-xl md:text-2xl text-ivory">{p.name}</h3>
                <p className="font-inter font-light text-ivory/60 text-[12px] md:text-[13px] mt-0.5">{p.desc}</p>
              </div>
              <div className="font-cinzel text-[0.7rem] tracking-widest text-gold whitespace-nowrap mt-1">₹ {inr(p.price)}</div>
            </div>
            <a href={`/product/${p.slug}`} className="mt-3 inline-flex items-center gap-1 font-cinzel text-[0.55rem] tracking-[0.35em] text-gold hover:text-ivory transition-colors">
              VIEW PRODUCT <ArrowRight size={12} strokeWidth={1.4} />
            </a>
          </motion.div>
        ))}
      </div>

      <motion.div {...fadeUp} className="text-center mt-16">
        <a href="#collections" className="btn-luxury">View All Sarees</a>
      </motion.div>
    </div>
  </section>
)

/* ---------------------- WHY CHOOSE ARKADHATRI ---------------------- */
const Why = () => {
  const items = [
    { t: 'Premium South Indian Collection', d: 'Sarees curated from the finest weaves of Karnataka, Mysore, and Kancheepuram.' },
    { t: 'Handpicked Designs',              d: 'Every piece is personally selected by our founders for quality and character.' },
    { t: 'Quality Fabrics',                 d: 'Pure silk, temple-border zari, and time-honoured South Indian weaves.' },
    { t: 'Secure Shopping',                 d: 'Encrypted checkout and safe payments across UPI, cards, and wallets.' },
    { t: 'Fast Delivery',                   d: 'Careful, insured shipping across Karnataka and India.' },
    { t: 'Trusted Customer Support',        d: 'Speak to a real person for styling advice, sizing and post-purchase care.' }
  ]
  return (
    <section className="bg-burgundy py-24 md:py-32">
      <div className="container">
        <motion.div {...fadeUp} className="text-center mb-14 md:mb-20 max-w-3xl mx-auto">
          <div className="eyebrow mb-4">— THE ARKADHATRI PROMISE</div>
          <h2 className="font-cormorant text-4xl md:text-6xl text-ivory">Why Choose ARKADHATRI</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gold/15 border border-gold/15">
          {items.map((it, i) => (
            <motion.div
              key={it.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="bg-burgundy p-8 md:p-10 hover:bg-burgundy-deep transition-colors group"
            >
              <div className="eyebrow mb-4">— 0{i + 1}</div>
              <h3 className="font-cormorant text-2xl md:text-3xl text-ivory group-hover:text-gold transition-colors">{it.t}</h3>
              <div className="gold-line w-10 my-4" />
              <p className="font-inter font-light text-ivory/65 text-[14px] leading-[1.8]">{it.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------- OUR STORY (short) ---------------------- */
const Story = () => (
  <section id="story" className="bg-burgundy-ink py-24 md:py-32">
    <div className="container grid md:grid-cols-2 gap-12 md:gap-16 items-center">
      <motion.div {...fadeUp} className="luxury-card aspect-[4/5]">
        <img src={IMG.story} alt="South Indian silk heritage" className="w-full h-full object-cover" loading="lazy" />
      </motion.div>
      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
        <div className="eyebrow mb-4">— OUR STORY</div>
        <h2 className="font-cormorant text-4xl md:text-6xl text-ivory leading-[1.05]">
          South Indian tradition,<br />quietly <em className="italic text-gold">reimagined.</em>
        </h2>
        <div className="gold-line w-20 my-8" />
        <p className="font-cormorant text-xl md:text-2xl text-ivory/85 leading-[1.55] max-w-lg">
          Inspired by the elegance of South Indian traditions, ARKADHATRI brings together
          carefully curated sarees that celebrate timeless craftsmanship, quality, and
          everyday elegance.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          <span className="eyebrow">KARNATAKA</span>
          <span className="w-1 h-1 rotate-45 bg-gold" />
          <span className="eyebrow">MYSORE SILK</span>
          <span className="w-1 h-1 rotate-45 bg-gold" />
          <span className="eyebrow">KANJIVARAM</span>
          <span className="w-1 h-1 rotate-45 bg-gold" />
          <span className="eyebrow">TEMPLE TRADITIONS</span>
        </div>
      </motion.div>
    </div>
  </section>
)

/* ---------------------- REVIEWS ---------------------- */
const Reviews = () => {
  const items = [
    { q: 'The Mysore silk I received is truly exceptional. Elegant, well-finished, and beautifully packaged.', n: 'Divya S.', c: 'Bengaluru' },
    { q: 'Ordered a Kanjivaram for my sister’s wedding. The quality feels like a family heirloom.',            n: 'Anitha R.', c: 'Mysuru' },
    { q: 'A refined boutique experience — not a marketplace. My go-to for festive sarees.',                    n: 'Sindhu K.', c: 'Mangaluru' }
  ]
  return (
    <section className="bg-burgundy py-24 md:py-32">
      <div className="container">
        <motion.div {...fadeUp} className="text-center mb-14 md:mb-20">
          <div className="eyebrow mb-4">— CUSTOMER REVIEWS</div>
          <h2 className="font-cormorant text-4xl md:text-6xl text-ivory">Kind words, kindly kept.</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((r, i) => (
            <motion.div
              key={r.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="bg-burgundy-deep border border-gold/15 p-8 md:p-10 rounded-sm"
            >
              <div className="flex items-center gap-1 mb-5">
                {[...Array(5)].map((_, j) => <Star key={j} size={13} className="fill-gold text-gold" strokeWidth={0} />)}
              </div>
              <p className="font-cormorant text-xl md:text-2xl text-ivory/90 leading-[1.55]">&ldquo;{r.q}&rdquo;</p>
              <div className="gold-line w-12 my-6" />
              <div className="eyebrow">{r.n.toUpperCase()} · {r.c.toUpperCase()}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------- INSTAGRAM ---------------------- */
const InstaGrid = () => (
  <section className="bg-burgundy-deep py-24 md:py-32">
    <div className="container">
      <motion.div {...fadeUp} className="text-center mb-12">
        <div className="eyebrow mb-4">— FOLLOW THE BOUTIQUE</div>
        <h2 className="font-cormorant text-4xl md:text-6xl text-ivory">@arkadhatri</h2>
      </motion.div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {IMG.gallery.map((g, i) => (
          <motion.a
            key={i}
            href="#"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="luxury-card aspect-square relative group"
          >
            <img src={g} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-burgundy-ink/0 group-hover:bg-burgundy-ink/55 transition-colors flex items-center justify-center">
              <Instagram size={22} strokeWidth={1.3} className="text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  </section>
)

/* ---------------------- NEWSLETTER ---------------------- */
const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    if (!email) return
    try {
      await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    } catch {}
    setSent(true)
  }
  return (
    <section className="bg-burgundy-ink py-24 md:py-28">
      <div className="container max-w-3xl text-center">
        <div className="eyebrow mb-4">— THE INSIDER’S LIST</div>
        <h2 className="font-cormorant text-4xl md:text-5xl text-ivory">Be the first to see new arrivals.</h2>
        <p className="mt-4 font-cormorant italic text-warm-grey text-lg">
          Sign up for private previews and curated saree stories.
        </p>
        <form onSubmit={submit} className="mt-10 flex flex-col sm:flex-row items-stretch gap-3 max-w-xl mx-auto">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 bg-transparent border border-gold/40 focus:border-gold px-6 py-3.5 outline-none text-ivory font-cormorant text-lg placeholder:text-ivory/40 rounded-md transition-colors"
          />
          <button type="submit" className="btn-luxury-filled">{sent ? 'Welcome' : 'Subscribe'}</button>
        </form>
        {sent && <p className="mt-4 font-cormorant italic text-gold">— Thank you. You’re on the list.</p>}
      </div>
    </section>
  )
}

/* ---------------------- FOOTER ---------------------- */
const Footer = () => (
  <footer id="contact" className="bg-burgundy-ink border-t border-gold/15 pt-16 pb-8">
    <div className="container">
      <div className="grid md:grid-cols-12 gap-10 pb-12 border-b border-gold/10">
        <div className="md:col-span-4">
          <Logo size={80} />
          <p className="mt-6 font-cormorant italic text-ivory/60 text-lg leading-relaxed max-w-sm">
            A premium South Indian saree boutique. Timeless silks, curated for the woman who values quiet elegance.
          </p>
          <div className="mt-6 flex items-center gap-3">
            {[Instagram, Youtube].map((I, i) => (
              <a key={i} href="#" className="w-10 h-10 border border-gold/40 flex items-center justify-center hover:bg-gold group transition-colors rounded-sm">
                <I size={14} strokeWidth={1.3} className="text-gold group-hover:text-burgundy" />
              </a>
            ))}
          </div>
        </div>

        {[
          { t: 'SHOP', l: [
            { name: 'Silk Sarees',       href: '/collections/silk-sarees' },
            { name: 'Wedding Sarees',    href: '/collections/wedding-sarees' },
            { name: 'Festival Sarees',   href: '/collections/festival-sarees' },
            { name: 'Everyday Elegance', href: '/collections/everyday-elegance' },
            { name: 'New Arrivals',      href: '/collections/new-arrivals' }
          ]},
          { t: 'BOUTIQUE', l: [
            { name: 'About',    href: '/#story' },
            { name: 'Contact',  href: '/contact' },
            { name: 'FAQ',      href: '/faq' }
          ]},
          { t: 'SUPPORT', l: [
            { name: 'Shipping Policy',    href: '/shipping-policy' },
            { name: 'Return & Refund',    href: '/returns' },
            { name: 'Wash Care',          href: '/faq' },
            { name: 'Track Order',        href: '/contact' }
          ]},
          { t: 'LEGAL', l: [
            { name: 'Privacy Policy',     href: '/privacy-policy' },
            { name: 'Terms & Conditions', href: '/terms' }
          ]}
        ].map((col) => (
          <div key={col.t} className="md:col-span-2">
            <div className="eyebrow mb-5">— {col.t}</div>
            <ul className="space-y-2.5">
              {col.l.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="font-cormorant text-ivory/70 hover:text-gold transition-colors text-base">{item.name}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 eyebrow"><MapPin size={11} strokeWidth={1.3} /><span>KARNATAKA · INDIA</span></div>
        <div className="font-cormorant italic text-ivory/40 text-sm">© MMXXV ARKADHATRI · All rights reserved.</div>
        <div className="eyebrow">TIMELESS · SOUTH · INDIAN · ELEGANCE</div>
      </div>
    </div>
  </footer>
)

/* ---------------------- APP ---------------------- */
const App = () => (
  <main className="bg-burgundy min-h-screen text-ivory">
    <Nav />
    <Hero />
    <Collections />
    <Featured />
    <Why />
    <Story />
    <div id="craft"><CraftJourney variant="dark" videoUrl={process.env.NEXT_PUBLIC_CRAFT_VIDEO_URL || ''} posterUrl="https://images.unsplash.com/photo-1623171404570-1d196759fe20?auto=format&fit=crop&w=2000&q=85" /></div>
    <Reviews />
    <InstaGrid />
    <Newsletter />
    <Footer />
  </main>
)

export default App
