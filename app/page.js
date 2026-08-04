'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Menu, X, Search, ShoppingBag, Heart, User, ChevronDown,
  Instagram, Youtube, MapPin, Star, ArrowRight
} from 'lucide-react'

/* ---------------------- ASSETS ---------------------- */
const LOGO_URL = 'https://customer-assets-jt897jd0.emergentagent.net/job_timeless-crafted-8/artifacts/xkx14q2d_ARK%20LOGO.jpeg'

const IMG = {
  hero: 'https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?auto=format&fit=crop&w=2200&q=85',
  story: 'https://images.unsplash.com/photo-1669556273167-8d4679c4f082?auto=format&fit=crop&w=1600&q=85',
  collections: [
    { title: 'Silk Sarees', tag: 'The Signature Weave', href: '#featured', img: 'https://images.unsplash.com/photo-1618901185975-d59f7091bcfe?auto=format&fit=crop&w=1200&q=85' },
    { title: 'Wedding Sarees', tag: 'For The Bride', href: '#featured', img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85' },
    { title: 'Festival Sarees', tag: 'Occasion Silks', href: '#featured', img: 'https://images.unsplash.com/photo-1710967074868-2041e4f44c17?auto=format&fit=crop&w=1200&q=85' },
    { title: 'Daily Wear Sarees', tag: 'Everyday Elegance', href: '#featured', img: 'https://images.pexels.com/photos/34155081/pexels-photo-34155081.jpeg?auto=compress&cs=tinysrgb&w=1200' },
    { title: 'New Arrivals', tag: 'Just In', href: '#featured', img: 'https://images.unsplash.com/photo-1710967074923-2b3ebe6171c3?auto=format&fit=crop&w=1200&q=85' }
  ],
  featured: [
    { name: 'Kavya', desc: 'Kanjivaram Silk • Deep Ruby',        price: '₹ 24,500', img: 'https://images.unsplash.com/photo-1618901185975-d59f7091bcfe?auto=format&fit=crop&w=1200&q=85' },
    { name: 'Bhavana', desc: 'Mysore Silk • Royal Purple',        price: '₹ 18,900', img: 'https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?auto=format&fit=crop&w=1200&q=85' },
    { name: 'Meenakshi', desc: 'Temple Border • Bridal Red',      price: '₹ 38,500', img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85' },
    { name: 'Anjali',    desc: 'Festival Silk • Emerald & Gold',   price: '₹ 22,900', img: 'https://images.unsplash.com/flagged/photo-1551854716-8b811be39e7e?auto=format&fit=crop&w=1200&q=85' },
    { name: 'Lakshmi',   desc: 'Kanjivaram Silk • Saffron',        price: '₹ 26,400', img: 'https://images.pexels.com/photos/28943474/pexels-photo-28943474.jpeg?auto=compress&cs=tinysrgb&w=1200' },
    { name: 'Anagha',    desc: 'Mysore Silk • Rose Blush',         price: '₹ 19,500', img: 'https://images.unsplash.com/photo-1710967074868-2041e4f44c17?auto=format&fit=crop&w=1200&q=85' },
    { name: 'Radhika',   desc: 'Pure Silk • Midnight Blue',        price: '₹ 21,900', img: 'https://images.unsplash.com/photo-1710967074923-2b3ebe6171c3?auto=format&fit=crop&w=1200&q=85' },
    { name: 'Rukmini',   desc: 'Bridal Kanjivaram • Crimson Gold', price: '₹ 42,000', img: 'https://images.unsplash.com/photo-1654764746225-e63f5e90facd?auto=format&fit=crop&w=1200&q=85' }
  ],
  gallery: [
    'https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1600685890506-593fdf55949b?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&w=800&q=85',
    'https://images.pexels.com/photos/35069916/pexels-photo-35069916.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/7956629/pexels-photo-7956629.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/32315685/pexels-photo-32315685.jpeg?auto=compress&cs=tinysrgb&w=800'
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
    const onAdd = () => {
      setCount((c) => c + 1)
      setPulse(true)
      setTimeout(() => setPulse(false), 700)
    }
    window.addEventListener('cart:add', onAdd)
    return () => window.removeEventListener('cart:add', onAdd)
  }, [])

  return (
    <button className="relative text-ivory hover:text-gold transition-colors" aria-label="Shopping bag">
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
    </button>
  )
}

/* ---------------------- ADD TO BAG ---------------------- */
const AddToBagButton = ({ productName, size = 'md' }) => {
  const [added, setAdded] = useState(false)
  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 2200)
    return () => clearTimeout(t)
  }, [added])

  const click = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (added) return
    setAdded(true)
    window.dispatchEvent(new CustomEvent('cart:add', { detail: { name: productName } }))
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const collections = [
    { name: 'Silk Sarees', href: '#collections' },
    { name: 'Wedding Sarees', href: '#collections' },
    { name: 'Festival Sarees', href: '#collections' },
    { name: 'Daily Wear Sarees', href: '#collections' },
    { name: 'New Arrivals', href: '#collections' }
  ]

  const links = [
    { name: 'Home', href: '#top' },
    { name: 'Collections', href: '#collections', hasSub: true },
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
              <button className="text-ivory hover:text-gold transition-colors" aria-label="Search"><Search size={18} strokeWidth={1.3} /></button>
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
    </>
  )
}

/* ---------------------- HERO ---------------------- */
const Hero = () => (
  <section id="top" className="relative min-h-[100svh] w-full overflow-hidden bg-burgundy-ink">
    <div className="absolute inset-0">
      <img src={IMG.hero} alt="ARKADHATRI South Indian Silk Saree" className="w-full h-full object-cover" />
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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.95 }} className="mt-10">
        <a href="#collections" className="btn-luxury-filled">Shop Collection</a>
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
            <div className="luxury-card relative aspect-[3/4] mb-4">
              <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              {i === 4 && <span className="absolute top-3 left-3 px-2.5 py-1 bg-burgundy-ink/85 border border-gold/40 font-cinzel text-[0.5rem] tracking-[0.3em] text-gold">NEW</span>}
              {/* hover actions */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                <button aria-label="Wishlist" className="w-9 h-9 bg-burgundy-ink/85 border border-gold/40 flex items-center justify-center hover:bg-gold group/i transition-colors rounded-sm">
                  <Heart size={13} strokeWidth={1.3} className="text-gold group-hover/i:text-burgundy" />
                </button>
              </div>
              <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                <AddToBagButton productName={p.name} size="sm" />
              </div>
            </div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-cormorant text-xl md:text-2xl text-ivory">{p.name}</h3>
                <p className="font-inter font-light text-ivory/60 text-[12px] md:text-[13px] mt-0.5">{p.desc}</p>
              </div>
              <div className="font-cinzel text-[0.7rem] tracking-widest text-gold whitespace-nowrap mt-1">{p.price}</div>
            </div>
            <a href="#" className="mt-3 inline-flex items-center gap-1 font-cinzel text-[0.55rem] tracking-[0.35em] text-gold hover:text-ivory transition-colors">
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
  return (
    <section className="bg-burgundy-ink py-24 md:py-28">
      <div className="container max-w-3xl text-center">
        <div className="eyebrow mb-4">— THE INSIDER’S LIST</div>
        <h2 className="font-cormorant text-4xl md:text-5xl text-ivory">Be the first to see new arrivals.</h2>
        <p className="mt-4 font-cormorant italic text-warm-grey text-lg">
          Sign up for private previews and curated saree stories.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); if (email) setSent(true) }} className="mt-10 flex flex-col sm:flex-row items-stretch gap-3 max-w-xl mx-auto">
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
            { name: 'Silk Sarees', href: '#collections' },
            { name: 'Wedding Sarees', href: '#collections' },
            { name: 'Festival Sarees', href: '#collections' },
            { name: 'Daily Wear Sarees', href: '#collections' },
            { name: 'New Arrivals', href: '#collections' }
          ]},
          { t: 'BOUTIQUE', l: [
            { name: 'About', href: '#story' },
            { name: 'Contact', href: '#contact' }
          ]},
          { t: 'SUPPORT', l: [
            { name: 'Shipping', href: '#' },
            { name: 'Returns', href: '#' },
            { name: 'Wash Care', href: '#' },
            { name: 'Track Order', href: '#' }
          ]},
          { t: 'LEGAL', l: [
            { name: 'Privacy', href: '#' },
            { name: 'Terms', href: '#' }
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
    <Reviews />
    <InstaGrid />
    <Newsletter />
    <Footer />
  </main>
)

export default App
