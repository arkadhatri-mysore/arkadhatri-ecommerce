'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion'
import {
  Menu, X, Search, ShoppingBag, Heart, User, ChevronRight, Instagram,
  Youtube, Plus, Minus, ArrowUpRight, MapPin
} from 'lucide-react'

/* ---------------------- IMAGE ASSETS ---------------------- */
const LOGO_URL = 'https://customer-assets-jt897jd0.emergentagent.net/job_timeless-crafted-8/artifacts/xkx14q2d_ARK%20LOGO.jpeg'

// Cinematic silk / weaving footage (Pexels, warm-toned, seamless loops)
const HERO_VIDEOS = [
  'https://videos.pexels.com/video-files/7710243/7710243-hd_1920_1080_25fps.mp4',
  'https://videos.pexels.com/video-files/6069112/6069112-uhd_2560_1440_25fps.mp4',
  'https://videos.pexels.com/video-files/5644067/5644067-uhd_2560_1440_25fps.mp4'
]

const IMG = {
  hero: 'https://images.unsplash.com/photo-1570212773364-e30cd076539e?auto=format&fit=crop&w=2000&q=85',
  story1: 'https://images.unsplash.com/photo-1617694820985-a5476fe22722?auto=format&fit=crop&w=1400&q=85',
  story2: 'https://images.unsplash.com/photo-1598616068517-c75ad397a436?auto=format&fit=crop&w=1400&q=85',
  collections: [
    { title: 'Silk Sarees', tag: 'The Handwoven Edit', img: 'https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?auto=format&fit=crop&w=1200&q=85' },
    { title: 'Wedding Couture', tag: 'The Bridal Atelier', img: 'https://images.unsplash.com/photo-1654764746225-e63f5e90facd?auto=format&fit=crop&w=1200&q=85' },
    { title: 'Festive', tag: 'Occasion Heirlooms', img: 'https://images.unsplash.com/photo-1619516388835-2b60acc4049e?auto=format&fit=crop&w=1200&q=85' },
    { title: 'Signature', tag: 'The House Icons', img: 'https://images.unsplash.com/photo-1610047614256-023d7c028d0b?auto=format&fit=crop&w=1200&q=85' },
    { title: 'Limited Edition', tag: 'Numbered Pieces', img: 'https://images.unsplash.com/photo-1629118477133-b8b1499f2b8a?auto=format&fit=crop&w=1200&q=85' }
  ],
  bestsellers: [
    { name: 'Meherbani', desc: 'Handwoven Banarasi in Deep Ruby', price: '₹ 2,48,000', img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85' },
    { name: 'Zarina', desc: 'Pure Silk with 24k Zari Work', price: '₹ 3,85,000', img: 'https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&w=1200&q=85' },
    { name: 'Rukhsana', desc: 'Kanjivaram Bridal Heirloom', price: '₹ 4,20,000', img: 'https://images.pexels.com/photos/7509916/pexels-photo-7509916.jpeg?auto=compress&cs=tinysrgb&w=1200' },
    { name: 'Naushaba', desc: 'Ivory Chikankari Couture', price: '₹ 1,95,000', img: 'https://images.unsplash.com/flagged/photo-1570055349452-29232699cc63?auto=format&fit=crop&w=1200&q=85' }
  ],
  craft: [
    'https://images.unsplash.com/photo-1564656622440-e6206eb5ee63?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1763400126795-d83e07d3449e?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1779167327071-963220d85043?auto=format&fit=crop&w=1400&q=85'
  ],
  testimonial: 'https://images.unsplash.com/photo-1581784878214-8d5596b98a01?auto=format&fit=crop&w=2000&q=85',
  gallery: [
    'https://images.unsplash.com/photo-1756483560049-e7b2208f99a0?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1774918036481-4b5578b604b3?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1654764746225-e63f5e90facd?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1619516388835-2b60acc4049e?auto=format&fit=crop&w=800&q=85'
  ]
}

/* ---------------------- CUSTOM CURSOR ---------------------- */
const LuxuryCursor = () => {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mx = 0, my = 0, rx = 0, ry = 0

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY
      dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`
    }
    const raf = () => {
      rx += (mx - rx) * 0.15
      ry += (my - ry) * 0.15
      ring.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0)`
      requestAnimationFrame(raf)
    }

    const onOver = (e) => {
      const t = e.target
      if (t.closest('a, button, .cursor-hover')) setHovering(true)
      else setHovering(false)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    raf()
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block" style={{ width: 6, height: 6, background: '#C8A45A', borderRadius: '50%' }} />
      <div ref={ringRef} className="pointer-events-none fixed left-0 top-0 z-[9998] hidden md:block transition-all duration-300" style={{ width: 36, height: 36, border: '1px solid #C8A45A', borderRadius: '50%', opacity: hovering ? 1 : 0.5, transform: 'translate3d(-100px,-100px,0)', mixBlendMode: 'difference', scale: hovering ? '1.6' : '1' }} />
    </>
  )
}

/* ---------------------- LOGO (Official Brand Mark) ---------------------- */
const Logo = ({ size = 64 }) => (
  <div className="flex items-center select-none" style={{ height: size }}>
    <img
      src={LOGO_URL}
      alt="ARKADHATRI \u2014 Timeless Luxury. Modern Heritage."
      style={{ height: size, width: 'auto', mixBlendMode: 'lighten' }}
      className="object-contain"
      draggable={false}
    />
  </div>
)

/* ---------------------- BAG ICON (animated on cart:add) ---------------------- */
const AnimatedBag = () => {
  const [count, setCount] = useState(0)
  const [pulse, setPulse] = useState(false)
  const [sparkleKey, setSparkleKey] = useState(0)

  useEffect(() => {
    const onAdd = () => {
      setCount((c) => c + 1)
      setPulse(true)
      setSparkleKey((k) => k + 1)
      setTimeout(() => setPulse(false), 900)
    }
    window.addEventListener('cart:add', onAdd)
    return () => window.removeEventListener('cart:add', onAdd)
  }, [])

  return (
    <button className="cursor-hover relative text-ivory hover:text-gold transition-colors duration-500" aria-label="Shopping bag">
      <motion.div animate={pulse ? { scale: [1, 1.18, 1] } : { scale: 1 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
        <ShoppingBag size={18} strokeWidth={1.2} />
      </motion.div>

      {/* Sparkle */}
      <AnimatePresence>
        {pulse && (
          <motion.svg
            key={sparkleKey}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], y: -18, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute -top-1 -right-2 pointer-events-none"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
          >
            <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" fill="#C8A45A" />
          </motion.svg>
        )}
      </AnimatePresence>

      {/* Count with smooth number transition */}
      <span className="absolute -top-1 -right-2 text-[9px] font-cinzel tracking-widest text-gold overflow-hidden inline-block h-3 leading-3">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block"
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  )
}

/* ---------------------- ADD TO BAG (morphing button) ---------------------- */
const AddToBagButton = ({ productName }) => {
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 2200)
    return () => clearTimeout(t)
  }, [added])

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (added) return
    setAdded(true)
    window.dispatchEvent(new CustomEvent('cart:add', { detail: { name: productName } }))
  }

  return (
    <div className="w-full">
      <motion.button
        onClick={handleClick}
        animate={{
          backgroundColor: added ? '#C8A45A' : 'rgba(0,0,0,0)',
          color: added ? '#4A0F1C' : '#C8A45A',
          borderColor: added ? '#C8A45A' : 'rgba(200,164,90,0.6)'
        }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="btn-product w-full relative"
        style={{ borderWidth: 1, borderStyle: 'solid' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {added ? (
            <motion.span
              key="added"
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2"
            >
              <motion.svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.path
                  d="M4 12 L10 18 L20 6"
                  stroke="#4A0F1C" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                />
              </motion.svg>
              <span>Added to Bag</span>
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              Add to Bag
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Subtle View Bag link */}
      <AnimatePresence>
        {added && (
          <motion.a
            href="#"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="mt-2 block text-center font-cormorant italic text-gold text-sm tracking-wide hover:text-gold-light transition-colors cursor-hover"
          >
            <span className="border-b border-gold/50 pb-0.5">View Bag</span>
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------------------- LUXURY CONCIERGE ---------------------- */
const LuxuryConcierge = () => {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    const onEsc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const options = [
    { t: 'Style Consultation', d: 'A private session with an ARKADHATRI stylist', href: '/book-private-shopping', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3 L14.09 8.26 L20 9.27 L15.5 13.14 L16.82 19.02 L12 15.77 L7.18 19.02 L8.5 13.14 L4 9.27 L9.91 8.26 Z" stroke="#C8A45A" strokeWidth="1.2" strokeLinejoin="round" fill="none" /></svg>
    ) },
    { t: 'WhatsApp Concierge', d: 'Message our atelier team, discreetly & directly', href: 'https://wa.me/', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 4 A9 9 0 0 0 5.6 15.9 L4 20 L8.2 18.6 A9 9 0 0 0 20 4 Z M9 9 C9 9 10 8 11 9 C11.5 9.5 12 10.5 12 11 C12 12 11 12 11 13 C11 14 12.5 15.5 14 16 C14.5 16 15.5 15 16 15 C16.5 15 17.5 15.5 17.5 16 C17.5 17 16 18 15 18 C13.5 18 10.5 17 8.5 15 C6.5 13 6 10.5 6 9.5 C6 8 7 6.5 8 6.5 C8.5 6.5 9 8 9 9 Z" stroke="#C8A45A" strokeWidth="1.1" fill="none" strokeLinejoin="round" /></svg>
    ) },
    { t: 'Private Shopping Appointment', d: 'Reserve a bespoke boutique or virtual visit', href: '/book-private-shopping', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" stroke="#C8A45A" strokeWidth="1.2" fill="none" /><path d="M3 9 L21 9 M8 3 L8 7 M16 3 L16 7" stroke="#C8A45A" strokeWidth="1.2" /><circle cx="12" cy="14" r="1.4" fill="#C8A45A" /></svg>
    ) }
  ]

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.5, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.06 }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 cursor-hover group"
        aria-label="Luxury Concierge"
      >
        <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-burgundy-ink border border-gold flex items-center justify-center overflow-hidden">
          {/* subtle gold glow */}
          <div className="absolute inset-0 rounded-full" style={{ boxShadow: '0 0 22px 0 rgba(200,164,90,0.35) inset, 0 6px 24px -6px rgba(200,164,90,0.35)' }} />
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.35 }}>
                <X size={20} strokeWidth={1.2} className="text-gold" />
              </motion.div>
            ) : (
              <motion.div key="ic" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.35 }}>
                {/* Minimalist concierge bell */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3 V5 M6 20 H18 M4 20 C4 15 8 12 12 12 C16 12 20 15 20 20" stroke="#C8A45A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <circle cx="12" cy="3" r="1.2" fill="#C8A45A" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Small ambient pulse ring */}
        {!open && (
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.35], opacity: [0.35, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border border-gold/50"
          />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 md:bottom-28 md:right-8 z-40 w-[min(92vw,380px)] origin-bottom-right"
            style={{ transformOrigin: 'bottom right' }}
          >
            <div className="relative bg-burgundy-ink border border-gold/40 rounded-md overflow-hidden" style={{ boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,164,90,0.15)' }}>
              {/* Header */}
              <div className="px-6 pt-6 pb-5 border-b border-gold/15">
                <div className="font-cinzel text-[0.6rem] tracking-[0.4em] text-gold mb-1">&mdash; THE MAISON</div>
                <div className="font-cormorant text-2xl text-ivory leading-tight">Luxury Concierge</div>
                <div className="font-cormorant italic text-warm-grey text-sm mt-1">A private line to our atelier</div>
              </div>

              {/* Options */}
              <div className="p-3">
                {options.map((o, i) => (
                  <motion.a
                    key={o.t}
                    href={o.href}
                    target={o.href.startsWith('http') ? '_blank' : undefined}
                    rel={o.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.12 + i * 0.08 }}
                    className="group flex items-center gap-4 p-4 hover:bg-burgundy transition-colors duration-500 cursor-hover"
                  >
                    <div className="w-10 h-10 border border-gold/40 flex items-center justify-center rounded-sm shrink-0 group-hover:bg-gold group-hover:border-gold transition-all duration-500">
                      <div className="group-hover:hidden">{o.icon}</div>
                      <div className="hidden group-hover:block">
                        {/* Recolor icon on hover: quick trick via cloning */}
                        <span style={{ filter: 'brightness(0) saturate(100%) invert(6%) sepia(58%) saturate(3700%) hue-rotate(325deg) brightness(80%) contrast(96%)' }}>{o.icon}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-cormorant text-lg text-ivory group-hover:text-gold transition-colors">{o.t}</div>
                      <div className="font-inter text-[12px] text-warm-grey font-light leading-snug mt-0.5">{o.d}</div>
                    </div>
                    <ArrowUpRight size={16} strokeWidth={1.2} className="text-gold/60 group-hover:text-gold -translate-x-1 group-hover:translate-x-0 transition-all duration-500" />
                  </motion.a>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gold/15 flex items-center justify-between">
                <span className="font-cinzel text-[0.55rem] tracking-[0.4em] text-gold/80">ATELIER &middot; KOLKATA</span>
                <span className="font-cormorant italic text-warm-grey text-xs">Mon &ndash; Sat &middot; 11 to 7</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ---------------------- NAV ---------------------- */
const Nav = () => {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { t: 'Collections', href: '#collections' },
    { t: 'Bridal', href: '#collections' },
    { t: 'Craftsmanship', href: '/craftsmanship' },
    { t: 'Private Shopping', href: '/book-private-shopping' },
    { t: 'Boutiques', href: '#contact' },
    { t: 'Contact', href: '#contact' }
  ]

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? 'bg-burgundy-ink/90 backdrop-blur-md py-4 border-b border-gold/20' : 'py-7 bg-transparent'}`}
      >
        <div className="container flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="flex items-center gap-3 group cursor-hover">
            <div className="flex flex-col gap-[3px]">
              <span className="h-[1px] w-6 bg-gold group-hover:w-8 transition-all duration-500" />
              <span className="h-[1px] w-4 bg-gold group-hover:w-8 transition-all duration-500" />
              <span className="h-[1px] w-6 bg-gold group-hover:w-8 transition-all duration-500" />
            </div>
            <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-ivory hidden sm:block">MENU</span>
          </button>

          <a href="#top" className="cursor-hover">
            <Logo size={scrolled ? 52 : 68} />
          </a>

          <div className="flex items-center gap-5 sm:gap-7">
            <button className="cursor-hover text-ivory hover:text-gold transition-colors duration-500"><Search size={18} strokeWidth={1.2} /></button>
            <button className="cursor-hover text-ivory hover:text-gold transition-colors duration-500 hidden sm:block"><User size={18} strokeWidth={1.2} /></button>
            <button className="cursor-hover text-ivory hover:text-gold transition-colors duration-500"><Heart size={18} strokeWidth={1.2} /></button>
            <AnimatedBag />
          </div>
        </div>
      </motion.header>

      {/* Mega menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[60] bg-burgundy-ink"
          >
            <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="container pt-8 pb-4 flex items-center justify-between border-b border-gold/20">
              <Logo size={64} />
              <button onClick={() => setOpen(false)} className="cursor-hover text-ivory hover:text-gold transition-colors flex items-center gap-2">
                <span className="font-cinzel text-[0.65rem] tracking-[0.35em]">CLOSE</span>
                <X size={22} strokeWidth={1.2} />
              </button>
            </motion.div>
            <div className="container grid grid-cols-1 md:grid-cols-2 gap-16 pt-20">
              <div>
                <div className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold mb-8">— NAVIGATE</div>
                <nav className="flex flex-col gap-5">
                  {links.map((l, i) => (
                    <motion.a
                      key={l.t}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="cursor-hover group flex items-baseline gap-4 border-b border-gold/10 pb-4"
                    >
                      <span className="font-cinzel text-[0.6rem] tracking-widest text-gold/60">0{i + 1}</span>
                      <span className="font-cormorant text-4xl md:text-6xl text-ivory group-hover:text-gold transition-colors duration-500">{l.t}</span>
                      <ArrowUpRight className="ml-auto text-gold opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500" size={28} strokeWidth={1} />
                    </motion.a>
                  ))}
                </nav>
              </div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.4 }} className="hidden md:block">
                <div className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold mb-8">— ATELIER</div>
                <p className="font-cormorant italic text-2xl text-ivory/80 leading-relaxed">
                  &ldquo;A saree is not a garment. It is inheritance rendered in silk — six yards of memory, ritual, and hand.&rdquo;
                </p>
                <div className="mt-10 gold-line w-24" />
                <div className="mt-6 font-cinzel text-[0.65rem] tracking-[0.35em] text-gold">— THE ARKADHATRI PHILOSOPHY</div>
                <div className="mt-16 aspect-[4/5] max-w-sm luxury-card noise-overlay">
                  <img src={IMG.collections[1].img} alt="" className="w-full h-full object-cover" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ---------------------- SECTION LABEL ---------------------- */
const SectionLabel = ({ number, title }) => (
  <div className="flex items-center gap-4 mb-6">
    <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold">{number}</span>
    <span className="h-[1px] w-12 bg-gold" />
    <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold uppercase">{title}</span>
  </div>
)

/* ---------------------- HERO (Cinematic Video) ---------------------- */
const Hero = () => {
  const ref = useRef(null)
  const videoRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12])
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0])

  const [isMobile, setIsMobile] = useState(false)
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const setMob = () => setIsMobile(mq.matches)
    setMob()
    mq.addEventListener('change', setMob)
    return () => mq.removeEventListener('change', setMob)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v || isMobile) return
    const onCanPlay = () => setVideoReady(true)
    v.addEventListener('canplay', onCanPlay)
    v.play().catch(() => {})
    return () => v.removeEventListener('canplay', onCanPlay)
  }, [isMobile])

  return (
    <section ref={ref} id="top" className="relative h-screen w-full overflow-hidden bg-burgundy-ink">
      {/* Background: video on desktop, image on mobile */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        {/* Poster / mobile image (always present as fallback) */}
        <img
          src={IMG.hero}
          alt="ARKADHATRI Atelier"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ${videoReady && !isMobile ? 'opacity-0' : 'opacity-100'}`}
        />
        {!isMobile && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={IMG.hero}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1800ms] ${videoReady ? 'opacity-100' : 'opacity-0'}`}
            style={{ filter: 'saturate(0.9) contrast(1.05) brightness(0.85)' }}
          >
            {HERO_VIDEOS.map((src) => (<source key={src} src={src} type="video/mp4" />))}
          </video>
        )}
        {/* Layered burgundy overlay for legibility + luxury mood */}
        <div className="absolute inset-0 bg-gradient-to-b from-burgundy-ink/85 via-burgundy/55 to-burgundy-ink/95" />
        <div className="absolute inset-0 bg-[#4A0F1C]/35" />
        {/* Subtle radial vignette */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(74,15,28,0) 0%, rgba(42,8,16,0.55) 75%, rgba(42,8,16,0.9) 100%)' }} />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        {/* Ornament + est */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} className="divider-ornament max-w-xs mx-auto mb-10">
          <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold">EST &middot; MMXXV</span>
        </motion.div>

        {/* AK Monogram fade-in above wordmark */}
        <motion.img
          src={LOGO_URL}
          alt="ARKADHATRI Monogram"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-[130px] md:w-[170px] mb-4 md:mb-6"
          style={{ filter: 'drop-shadow(0 0 24px rgba(200,164,90,0.35))' }}
        />

        {/* Wordmark in metallic gold */}
        <motion.h1
          initial={{ opacity: 0, letterSpacing: '0.55em' }}
          animate={{ opacity: 1, letterSpacing: '0.2em' }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
          className="font-cinzel text-[2rem] sm:text-5xl md:text-7xl lg:text-[7.5rem] tracking-[0.2em] leading-none gold-metallic-text"
          style={{ fontWeight: 600 }}
        >
          ARKADHATRI
        </motion.h1>

        <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 1.6, delay: 1.6 }} className="gold-line w-32 md:w-56 my-8 md:my-10" />

        {/* Tagline in warm ivory / soft grey */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 1.8 }} className="space-y-1">
          <div className="font-cinzel text-[0.85rem] md:text-[1.05rem] tracking-[0.55em] text-warm-grey">
            TIMELESS LUXURY.
          </div>
          <div className="font-cinzel text-[0.85rem] md:text-[1.05rem] tracking-[0.55em] text-warm-grey">
            MODERN HERITAGE.
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 2.1 }} className="mt-14 md:mt-16 flex flex-col sm:flex-row items-center gap-5">
          <a href="#collections" className="btn-luxury-filled">Explore Collection</a>
          <a href="/book-private-shopping" className="btn-luxury">Book Private Shopping</a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 2.6 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <span className="font-cinzel text-[0.6rem] tracking-[0.4em] text-gold/85">SCROLL TO DISCOVER</span>
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-[1px] h-16 bg-gradient-to-b from-gold to-transparent" />
        </motion.div>
      </motion.div>

      {/* Vertical side text */}
      <div className="hidden lg:block absolute left-6 top-1/2 -translate-y-1/2 z-10">
        <div className="vertical-text font-cinzel text-[0.6rem] tracking-[0.5em] text-gold/70">MAISON &middot; MMXXV &middot; KOLKATA</div>
      </div>
      <div className="hidden lg:block absolute right-6 top-1/2 -translate-y-1/2 z-10">
        <div className="vertical-text font-cinzel text-[0.6rem] tracking-[0.5em] text-gold/70">HANDCRAFTED &middot; IN &middot; INDIA</div>
      </div>
    </section>
  )
}

/* ---------------------- MARQUEE ---------------------- */
const Marquee = () => {
  const items = [
    'COMPLIMENTARY WORLDWIDE ATELIER SHIPPING',
    'HANDWOVEN IN VARANASI, KANCHEEPURAM & KOLKATA',
    'NUMBERED HEIRLOOM PIECES',
    'PRIVATE APPOINTMENTS · BY INVITATION',
    '24K PURE ZARI · CERTIFIED'
  ]
  const track = [...items, ...items, ...items]
  return (
    <div className="border-y border-gold/20 bg-burgundy-ink py-5 overflow-hidden">
      <div className="marquee-track gap-16">
        {track.map((t, i) => (
          <div key={i} className="flex items-center gap-16 shrink-0">
            <span className="font-cinzel text-[0.7rem] tracking-[0.35em] text-gold whitespace-nowrap">{t}</span>
            <span className="w-1.5 h-1.5 rotate-45 bg-gold" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------------- STORY ---------------------- */
const Story = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  return (
    <section ref={ref} id="story" className="relative bg-burgundy py-32 md:py-48 overflow-hidden">
      <div className="container grid md:grid-cols-2 gap-16 md:gap-24 items-center">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} className="relative aspect-[4/5] luxury-card noise-overlay">
          <img src={IMG.story1} alt="Craftsmanship" className="w-full h-full object-cover" />
          <div className="absolute -bottom-6 -right-6 bg-burgundy-ink px-8 py-5 border border-gold/40">
            <div className="font-cinzel text-[0.6rem] tracking-[0.35em] text-gold">SINCE MMXXV</div>
            <div className="font-cormorant italic text-2xl text-ivory">The Atelier</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
          <SectionLabel number="01" title="The House of Arkadhatri" />
          <h2 className="font-cormorant text-5xl md:text-7xl leading-[1.05] text-ivory mb-8">
            Timeless heritage,<br />
            <em className="gold-shimmer not-italic">modern luxury.</em>
          </h2>
          <div className="space-y-5 font-inter font-light text-ivory/75 text-[15px] leading-[1.9] max-w-lg">
            <p>
              ARKADHATRI is a luxury fashion house born from a passion for timeless
              Indian craftsmanship and refined contemporary elegance. Every creation is
              designed to celebrate the grace, confidence, and individuality of women
              through exceptional quality, exquisite artistry, and enduring style.
            </p>
            <p>
              We begin our journey with premium sarees, thoughtfully curated to honour
              India&rsquo;s rich weaving heritage while embracing modern sophistication.
              Looking ahead, ARKADHATRI will evolve into a complete luxury lifestyle
              brand &mdash; offering perfumes, handbags, accessories, and carefully crafted
              fashion essentials that embody elegance in every detail.
            </p>
            <p className="font-cormorant italic text-gold text-xl leading-snug pt-2">
              Welcome to ARKADHATRI &mdash; where timeless heritage meets modern luxury.
            </p>
          </div>
          <div className="mt-10 flex items-center gap-6">
            <a href="/craftsmanship" className="btn-luxury">Discover the Heritage</a>
            <span className="font-cormorant italic text-gold text-lg">— Est. Kolkata</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------------- HERITAGE ---------------------- */
const Heritage = () => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const yImg = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} id="heritage" className="relative bg-burgundy-ink py-32 md:py-48 overflow-hidden">
      {/* subtle gold ornament backdrop */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="container">
        {/* Editorial heading block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl mx-auto text-center mb-24 md:mb-32"
        >
          <div className="divider-ornament max-w-md mx-auto mb-8">
            <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold">&mdash; 02 &middot; THE HERITAGE</span>
          </div>
          <h2 className="font-cormorant text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.02] text-ivory">
            Crafted with <em className="gold-shimmer not-italic">Heritage.</em>
            <br />Designed for <em className="gold-shimmer not-italic">Generations.</em>
          </h2>
          <div className="gold-line w-32 mx-auto mt-10" />
        </motion.div>

        {/* Two-column editorial: image + paragraph, then paragraph + image */}
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center mb-24 md:mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-6 relative aspect-[4/5] luxury-card noise-overlay overflow-hidden"
          >
            <motion.img style={{ y: yImg }} src={IMG.craft[0]} alt="India's textile heritage" className="w-full h-[115%] object-cover" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div className="font-cormorant italic text-2xl text-ivory">The Loom</div>
              <div className="font-cinzel text-[0.6rem] tracking-[0.35em] text-gold">&mdash; VARANASI</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-6 md:pl-8"
          >
            <div className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold mb-6">&mdash; TRIBUTE TO TRADITION</div>
            <p className="font-cormorant text-2xl md:text-3xl text-ivory/90 leading-[1.55] font-light">
              Every ARKADHATRI creation is a tribute to India&rsquo;s centuries-old textile
              traditions. From selecting the finest fabrics to intricate weaving techniques
              and refined finishing, every detail is thoughtfully perfected.
            </p>
            <div className="gold-line w-16 my-10" />
            <p className="font-inter font-light text-ivory/70 text-[15px] leading-[1.95]">
              Our artisans combine traditional craftsmanship with contemporary aesthetics
              to create timeless masterpieces that celebrate elegance, culture, and
              enduring beauty.
            </p>
          </motion.div>
        </div>

        {/* Closing editorial statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="w-1.5 h-1.5 bg-gold rotate-45 mx-auto mb-8" />
          <p className="font-cormorant italic text-3xl md:text-5xl text-ivory leading-[1.35]">
            Each creation is made to be <span className="text-gold">admired today</span>
            <br className="hidden md:block" /> and <span className="text-gold">cherished for generations.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------------- PHILOSOPHY (with Vision & Mission) ---------------------- */
const Philosophy = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} id="philosophy" className="relative bg-burgundy-deep py-32 md:py-48 overflow-hidden">
      {/* decorative circle glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gold/[0.04] blur-3xl" />

      <div className="container relative">
        {/* Philosophy manifesto */}
        <div className="max-w-5xl mx-auto text-center mb-28 md:mb-36">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1.2 }}>
            <SectionLabel number="05" title="Our Philosophy" />
            <h2 className="font-cormorant text-5xl md:text-7xl text-ivory leading-[1.05] mt-4">
              Luxury is created through
              <br />
              <em className="gold-shimmer not-italic">patience, precision, and purpose.</em>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-14 max-w-3xl mx-auto space-y-8"
          >
            <p className="font-cormorant italic text-2xl md:text-3xl text-ivory/85 leading-[1.55]">
              We believe exceptional design should never follow trends &mdash; it should
              transcend them. Every collection is thoughtfully curated to reflect
              timeless sophistication while preserving the authenticity of Indian
              craftsmanship.
            </p>
            <div className="gold-line w-24 mx-auto" />
            <p className="font-cinzel text-[0.85rem] md:text-[1rem] tracking-[0.35em] text-gold">
              AT ARKADHATRI, WE CREATE EXPERIENCES &middot; NOT JUST PRODUCTS
            </p>
          </motion.div>
        </div>

        {/* Vision & Mission editorial split */}
        <div className="grid md:grid-cols-2 gap-px bg-gold/15 border border-gold/15 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-burgundy-deep p-10 md:p-16 group"
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold">&mdash; I</span>
              <span className="h-[1px] w-12 bg-gold" />
              <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold">THE VISION</span>
            </div>
            <h3 className="font-cormorant text-4xl md:text-5xl text-ivory leading-[1.15] mb-8 group-hover:text-gold transition-colors duration-700">
              A house that <em className="italic">inspires generations.</em>
            </h3>
            <p className="font-inter font-light text-ivory/75 text-[15px] leading-[1.95]">
              To become one of India&rsquo;s most admired global luxury fashion houses &mdash;
              renowned for timeless craftsmanship, uncompromising quality, and elegant
              lifestyle creations that inspire generations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="bg-burgundy-deep p-10 md:p-16 group"
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold">&mdash; II</span>
              <span className="h-[1px] w-12 bg-gold" />
              <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold">THE MISSION</span>
            </div>
            <h3 className="font-cormorant text-4xl md:text-5xl text-ivory leading-[1.15] mb-8 group-hover:text-gold transition-colors duration-700">
              Heritage rendered <em className="italic">world-class.</em>
            </h3>
            <p className="font-inter font-light text-ivory/75 text-[15px] leading-[1.95]">
              To create extraordinary luxury products that celebrate Indian heritage
              while delivering world-class design, craftsmanship, and unforgettable
              customer experiences.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------- COLLECTIONS ---------------------- */
const Collections = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} id="collections" className="relative bg-burgundy-deep py-32 md:py-48">
      <div className="container">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1 }}>
            <div className="divider-ornament max-w-md mx-auto mb-6">
              <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold">— 02 · THE EDIT</span>
            </div>
            <h2 className="font-cormorant text-5xl md:text-7xl text-ivory">
              Featured <em className="gold-shimmer not-italic">Collections</em>
            </h2>
            <p className="mt-6 font-cormorant italic text-ivory/60 text-xl max-w-2xl mx-auto">
              Five worlds. One philosophy. Each collection is composed as a chapter of the house.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-[280px] md:auto-rows-[380px]">
          {IMG.collections.map((c, i) => {
            // Layout: first two large (3 col each), next three medium (2 col each)
            const span = i < 2 ? 'md:col-span-3' : 'md:col-span-2'
            return (
              <motion.a
                key={c.title}
                href="#"
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1.2, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className={`luxury-card noise-overlay group cursor-hover relative ${span} row-span-1`}
              >
                <img src={c.img} alt={c.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-burgundy-ink via-burgundy-ink/20 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700" />
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <div className="font-cinzel text-[0.6rem] tracking-[0.35em] text-gold mb-2">— {String(i + 1).padStart(2, '0')} · {c.tag.toUpperCase()}</div>
                  <div className="flex items-end justify-between">
                    <h3 className="font-cormorant text-3xl md:text-5xl text-ivory">{c.title}</h3>
                    <div className="w-10 h-10 border border-gold rounded-full flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-700">
                      <ArrowUpRight size={16} className="text-gold" strokeWidth={1.2} />
                    </div>
                  </div>
                  <div className="mt-4 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-1000" />
                </div>
              </motion.a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------------------- BESTSELLERS ---------------------- */
const BestSellers = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} id="bestsellers" className="relative bg-burgundy py-32 md:py-48">
      <div className="container">
        <div className="flex items-end justify-between mb-16 gap-6 flex-wrap">
          <div>
            <SectionLabel number="03" title="House Icons" />
            <h2 className="font-cormorant text-5xl md:text-7xl text-ivory">Best <em className="gold-shimmer not-italic">Sellers</em></h2>
          </div>
          <a href="#" className="btn-luxury">View The Archive</a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {IMG.bestsellers.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.1, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group cursor-hover"
            >
              <div className="relative aspect-[3/4] luxury-card noise-overlay">
                <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="px-3 py-1 bg-burgundy-ink/80 backdrop-blur-sm border border-gold/30 font-cinzel text-[0.55rem] tracking-[0.35em] text-gold">HANDWOVEN</span>
                </div>
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-700">
                  <button className="w-10 h-10 bg-burgundy-ink/85 backdrop-blur-sm border border-gold/40 flex items-center justify-center hover:bg-gold hover:border-gold group/i transition-all rounded-sm" aria-label="Add to Wishlist">
                    <Heart size={14} strokeWidth={1.2} className="text-gold group-hover/i:text-burgundy" />
                  </button>
                  <button className="w-10 h-10 bg-burgundy-ink/85 backdrop-blur-sm border border-gold/40 flex items-center justify-center hover:bg-gold hover:border-gold group/i transition-all rounded-sm" aria-label="Quick View">
                    <Search size={14} strokeWidth={1.2} className="text-gold group-hover/i:text-burgundy" />
                  </button>
                  <button className="w-10 h-10 bg-burgundy-ink/85 backdrop-blur-sm border border-gold/40 flex items-center justify-center hover:bg-gold hover:border-gold group/i transition-all rounded-sm" aria-label="Add to Bag">
                    <ShoppingBag size={14} strokeWidth={1.2} className="text-gold group-hover/i:text-burgundy" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-700">
                  <AddToBagButton productName={p.name} />
                </div>
              </div>
              <div className="pt-5 flex items-start justify-between gap-4">
                <div>
                  <div className="font-cinzel text-[0.6rem] tracking-[0.35em] text-gold mb-1">— N° {String(i + 1).padStart(3, '0')}</div>
                  <h3 className="font-cormorant text-2xl text-ivory">{p.name}</h3>
                  <p className="font-inter text-[13px] text-ivory/60 font-light mt-1">{p.desc}</p>
                </div>
                <div className="font-cinzel text-[0.75rem] tracking-widest text-gold shrink-0 mt-1">{p.price}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------- CRAFTSMANSHIP ---------------------- */
const Craftsmanship = () => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '-15%'])
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const y3 = useTransform(scrollYProgress, [0, 1], ['0%', '-10%'])

  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} id="craft" className="relative bg-burgundy-ink py-32 md:py-48 overflow-hidden">
      <div className="container">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
          <div className="md:col-span-5 md:sticky md:top-32">
            <SectionLabel number="04" title="The Craftsmanship" />
            <h2 className="font-cormorant text-5xl md:text-7xl text-ivory leading-[1.05]">
              Fourteen months.<br />
              <em className="gold-shimmer not-italic">Six yards.</em><br />
              One heirloom.
            </h2>
            <div className="gold-line w-24 my-8" />
            <div className="space-y-5 font-inter font-light text-ivory/70 text-[15px] leading-[1.9] max-w-lg">
              <p>Behind every Arkadhatri saree stands a lineage — weavers whose families have shaped silk for six, sometimes nine generations. We do not rush the loom.</p>
              <p>Pure mulberry silk is dyed in small batches with natural pigments. The zari is drawn from 98% pure silver, gilded in 24k gold. The result is not fashion. It is quiet permanence.</p>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[{n:'98%',l:'PURE SILK'},{n:'24k',l:'GOLD ZARI'},{n:'14',l:'MONTHS'}].map(s => (
                <div key={s.l}>
                  <div className="font-cormorant italic text-4xl text-gold">{s.n}</div>
                  <div className="font-cinzel text-[0.55rem] tracking-[0.35em] text-ivory/60 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 gap-6">
            <motion.div style={{ y: y1 }} className="aspect-[3/4] luxury-card noise-overlay col-span-2">
              <img src={IMG.craft[0]} className="w-full h-full object-cover" alt="Loom" />
            </motion.div>
            <motion.div style={{ y: y2 }} className="aspect-[4/5] luxury-card noise-overlay">
              <img src={IMG.craft[1]} className="w-full h-full object-cover" alt="Zari" />
            </motion.div>
            <motion.div style={{ y: y3 }} className="aspect-[4/5] luxury-card noise-overlay mt-8">
              <img src={IMG.craft[2]} className="w-full h-full object-cover" alt="Artisan" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------- WHY ARKADHATRI ---------------------- */
const Why = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const pillars = [
    { n: '01', t: 'Handcrafted', d: 'Every piece begins on a wooden loom, never a machine — passed down through generations of master weavers.' },
    { n: '02', t: 'Premium Silk', d: '98% pure mulberry silk sourced from the heartlands of Karnataka and Bengal, dyed in small artisanal batches.' },
    { n: '03', t: 'Luxury Packaging', d: 'Presented in bespoke silk-lined heirloom trunks — a ceremony worthy of the piece within.' },
    { n: '04', t: 'Worldwide Shipping', d: 'Complimentary white-glove delivery to over 60 nations, insured and hand-inspected before dispatch.' },
    { n: '05', t: 'Exclusive Designs', d: 'Numbered editions. Once retired, a design never returns to the loom — heritage kept scarce.' },
    { n: '06', t: 'Authenticity Guaranteed', d: 'Each saree carries a hand-signed certificate and a unique heritage passport from the Atelier.' }
  ]
  return (
    <section ref={ref} className="relative bg-burgundy py-32 md:py-48">
      <div className="container">
        <div className="text-center mb-20">
          <SectionLabel number="05" title="Our Codes" />
          <h2 className="font-cormorant text-5xl md:text-7xl text-ivory">
            Why <em className="gold-shimmer not-italic">ARKADHATRI</em>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-gold/15 border border-gold/15">
          {pillars.map((p, i) => (
            <motion.div
              key={p.t}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="bg-burgundy p-10 md:p-12 group hover:bg-burgundy-deep transition-colors duration-700 cursor-hover"
            >
              <div className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold">— {p.n}</div>
              <h3 className="font-cormorant text-3xl md:text-4xl text-ivory mt-6 group-hover:text-gold transition-colors duration-500">{p.t}</h3>
              <div className="gold-line w-12 my-6" />
              <p className="font-inter font-light text-ivory/60 text-[14px] leading-[1.9]">{p.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------- TESTIMONIALS ---------------------- */
const Testimonials = () => {
  const items = [
    { q: 'ARKADHATRI is what happens when an Indian couturier respects both the past and the woman who will wear it. I felt like heritage in motion.', n: 'Anaya Kapoor Mehra', r: 'Bride · Udaipur · The Meherbani' },
    { q: 'A saree so quiet, it silences the room. The tailoring, the weight of the zari — Sabyasachi meets Dior.', n: 'Kavya Rathore', r: 'Editor-at-Large, Vogue Arabia' },
    { q: 'They shipped a heirloom to Monaco in a silk-lined trunk. It arrived like a story. I have never encountered service like this.', n: 'Isha Khanna-Devroy', r: 'Private Client · Monte Carlo' }
  ]
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI(v => (v + 1) % items.length), 7000)
    return () => clearInterval(id)
  }, [])
  return (
    <section className="relative py-32 md:py-48 overflow-hidden">
      <div className="absolute inset-0">
        <img src={IMG.testimonial} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-burgundy-ink/85" />
      </div>
      <div className="relative container text-center">
        <SectionLabel number="06" title="The Voices" />
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 1 }}>
              <div className="font-cormorant italic text-3xl md:text-5xl text-ivory leading-[1.3] mb-10">
                <span className="text-gold text-6xl leading-none align-top mr-2">&ldquo;</span>
                {items[i].q}
                <span className="text-gold text-6xl leading-none align-bottom ml-1">&rdquo;</span>
              </div>
              <div className="gold-line w-16 mx-auto mb-6" />
              <div className="font-cinzel text-[0.75rem] tracking-[0.35em] text-gold">{items[i].n.toUpperCase()}</div>
              <div className="font-cormorant italic text-ivory/60 mt-2">{items[i].r}</div>
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center justify-center gap-3 mt-12">
            {items.map((_, j) => (
              <button key={j} onClick={() => setI(j)} className={`h-[1px] transition-all duration-700 ${j === i ? 'w-16 bg-gold' : 'w-8 bg-gold/30'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------- INSTAGRAM ---------------------- */
const Insta = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <section ref={ref} className="relative bg-burgundy-deep py-32 md:py-48">
      <div className="container">
        <div className="text-center mb-16">
          <SectionLabel number="07" title="Follow The Journey" />
          <h2 className="font-cormorant text-5xl md:text-7xl text-ivory">@<em className="gold-shimmer not-italic">arkadhatri</em></h2>
          <p className="mt-4 font-cormorant italic text-ivory/60 text-xl">A visual archive of the maison</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {IMG.gallery.map((g, i) => (
            <motion.a
              key={i} href="#"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: i * 0.08 }}
              className="luxury-card noise-overlay aspect-square relative group cursor-hover"
            >
              <img src={g} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-burgundy-ink/0 group-hover:bg-burgundy-ink/60 transition-all duration-700 flex items-center justify-center">
                <Instagram size={26} strokeWidth={1.2} className="text-gold opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-700" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------- NEWSLETTER ---------------------- */
const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const submit = (e) => { e.preventDefault(); if (email) setSent(true) }
  return (
    <section className="relative bg-burgundy-ink py-32 md:py-40 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gold/5 blur-3xl" />
      <div className="container relative text-center max-w-3xl">
        <SectionLabel number="08" title="The Insider" />
        <h2 className="font-cormorant text-5xl md:text-7xl text-ivory">Become an <em className="gold-shimmer not-italic">Arkadhatri Insider</em></h2>
        <p className="mt-6 font-cormorant italic text-ivory/60 text-xl max-w-xl mx-auto">
          A private correspondence — first access to numbered pieces, atelier openings, and a rare invitation into the world of the maison.
        </p>
        <form onSubmit={submit} className="mt-12 flex flex-col sm:flex-row items-stretch gap-3 max-w-xl mx-auto">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="Your correspondence address"
            className="flex-1 bg-transparent border-2 border-gold/60 focus:border-gold px-6 py-4 outline-none text-ivory font-cormorant italic text-lg placeholder:text-ivory/40 rounded-md transition-colors"
          />
          <button type="submit" className="btn-luxury-filled">{sent ? 'Welcome' : 'Subscribe'}</button>
        </form>
        {sent && <p className="mt-6 font-cormorant italic text-gold">— Thank you. Your invitation shall arrive shortly.</p>}
      </div>
    </section>
  )
}

/* ---------------------- FOOTER ---------------------- */
const Footer = () => (
  <footer id="contact" className="bg-burgundy-ink border-t border-gold/20 pt-20 pb-8">
    <div className="container">
      <div className="grid md:grid-cols-12 gap-12 pb-16 border-b border-gold/15">
        <div className="md:col-span-4">
          <Logo size={110} />
          <p className="mt-8 font-cormorant italic text-ivory/60 text-lg max-w-sm leading-relaxed">
            The house of ARKADHATRI is a quiet celebration of Indian couture — timeless, considered, and hand-signed by the artisans who make it possible.
          </p>
          <div className="mt-8 flex items-center gap-4">
            {[Instagram, Youtube].map((I, i) => (
              <a key={i} href="#" className="w-11 h-11 border border-gold/40 flex items-center justify-center hover:bg-gold hover:border-gold group transition-all cursor-hover">
                <I size={16} strokeWidth={1.2} className="text-gold group-hover:text-burgundy" />
              </a>
            ))}
            <a href="#" className="h-11 px-4 border border-gold/40 flex items-center gap-2 hover:bg-gold group transition-all cursor-hover">
              <span className="font-cinzel text-[0.6rem] tracking-[0.35em] text-gold group-hover:text-burgundy">PINTEREST</span>
            </a>
          </div>
        </div>

        {[
          { t: 'MAISON', l: [
            { name: 'About', href: '/#story' },
            { name: 'Craftsmanship', href: '/craftsmanship' },
            { name: 'The Atelier', href: '/craftsmanship' },
            { name: 'Philosophy', href: '/#philosophy' },
            { name: 'Press', href: '#' }
          ]},
          { t: 'DISCOVER', l: [
            { name: 'Silk Sarees', href: '/#collections' },
            { name: 'Wedding', href: '/#collections' },
            { name: 'Festive', href: '/#collections' },
            { name: 'Signature', href: '/#collections' },
            { name: 'Limited Edition', href: '/#collections' }
          ]},
          { t: 'CLIENT SERVICES', l: [
            { name: 'Private Appointments', href: '/book-private-shopping' },
            { name: 'Style Consultation', href: '/book-private-shopping' },
            { name: 'Care Guide', href: '#' },
            { name: 'Shipping', href: '#' },
            { name: 'Returns', href: '#' }
          ]},
          { t: 'LEGAL', l: [
            { name: 'Privacy', href: '#' },
            { name: 'Terms', href: '#' },
            { name: 'Cookies', href: '#' },
            { name: 'Authenticity', href: '#' },
            { name: 'Contact', href: '#contact' }
          ]}
        ].map((col) => (
          <div key={col.t} className="md:col-span-2">
            <div className="font-cinzel text-[0.6rem] tracking-[0.35em] text-gold mb-6">— {col.t}</div>
            <ul className="space-y-3">
              {col.l.map(item => (
                <li key={item.name}>
                  <a href={item.href} className="font-cormorant text-ivory/70 hover:text-gold transition-colors text-lg cursor-hover">{item.name}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 font-cinzel text-[0.6rem] tracking-[0.35em] text-ivory/50">
          <MapPin size={12} strokeWidth={1.2} />
          <span>ATELIER · KOLKATA · INDIA</span>
        </div>
        <div className="font-cormorant italic text-ivory/40 text-sm">© MMXXV ARKADHATRI · All heritage reserved.</div>
        <div className="font-cinzel text-[0.6rem] tracking-[0.35em] text-gold">TIMELESS · LUXURY · MODERN · HERITAGE</div>
      </div>
    </div>
  </footer>
)

/* ---------------------- LOADING SCREEN ---------------------- */
const LoadingScreen = ({ done }) => (
  <AnimatePresence>
    {!done && (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }}
        className="fixed inset-0 z-[100] bg-burgundy-ink flex flex-col items-center justify-center"
      >
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
          <Logo size={220} />
        </motion.div>
        <div className="mt-16 w-56 h-[1px] bg-gold/20 overflow-hidden">
          <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }} className="h-full bg-gold" />
        </div>
        <div className="mt-6 font-cinzel text-[0.6rem] tracking-[0.5em] text-gold/70">ENTERING THE MAISON</div>
      </motion.div>
    )}
  </AnimatePresence>
)

/* ---------------------- APP ---------------------- */
const App = () => {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 2200)
    return () => clearTimeout(t)
  }, [])
  return (
    <main className="bg-burgundy min-h-screen text-ivory">
      <LoadingScreen done={loaded} />
      <LuxuryCursor />
      <Nav />
      <Hero />
      <Marquee />
      <Story />
      <Heritage />
      <Collections />
      <BestSellers />
      <Craftsmanship />
      <Philosophy />
      <Why />
      <Testimonials />
      <Insta />
      <Newsletter />
      <Footer />
      <LuxuryConcierge />
    </main>
  )
}

export default App
