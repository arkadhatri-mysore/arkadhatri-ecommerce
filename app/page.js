'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion'
import {
  Menu, X, Search, ShoppingBag, Heart, User, ChevronRight, Instagram,
  Youtube, Plus, Minus, ArrowUpRight, MapPin
} from 'lucide-react'

/* ---------------------- IMAGE ASSETS ---------------------- */
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

/* ---------------------- LOGO (AK MONOGRAM) ---------------------- */
const Logo = ({ size = 40, mono = false }) => (
  <div className="flex items-center gap-3 select-none">
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30.5" stroke={mono ? '#F7F3EB' : '#C8A45A'} strokeWidth="1" />
      <circle cx="32" cy="32" r="27" stroke={mono ? '#F7F3EB' : '#C8A45A'} strokeWidth="0.4" opacity="0.6" />
      <path d="M18 46 L28 18 L32 18 L42 46 M22 38 L38 38" stroke={mono ? '#F7F3EB' : '#C8A45A'} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M42 46 L42 18 M42 30 L52 18 M42 30 L52 46" stroke={mono ? '#F7F3EB' : '#C8A45A'} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div className="leading-none">
      <div className="font-cinzel text-[1.05rem] tracking-[0.35em] text-ivory">ARKADHATRI</div>
      <div className="font-cormorant italic text-[0.65rem] tracking-[0.3em] text-gold mt-1">MAISON DE LUXE · EST. 2025</div>
    </div>
  </div>
)

/* ---------------------- NAV ---------------------- */
const Nav = () => {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = ['Collections', 'Bridal', 'Craftsmanship', 'Journal', 'Boutiques', 'Contact']

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
            <Logo size={scrolled ? 34 : 42} />
          </a>

          <div className="flex items-center gap-5 sm:gap-7">
            <button className="cursor-hover text-ivory hover:text-gold transition-colors duration-500"><Search size={18} strokeWidth={1.2} /></button>
            <button className="cursor-hover text-ivory hover:text-gold transition-colors duration-500 hidden sm:block"><User size={18} strokeWidth={1.2} /></button>
            <button className="cursor-hover text-ivory hover:text-gold transition-colors duration-500"><Heart size={18} strokeWidth={1.2} /></button>
            <button className="cursor-hover text-ivory hover:text-gold transition-colors duration-500 relative">
              <ShoppingBag size={18} strokeWidth={1.2} />
              <span className="absolute -top-1 -right-2 text-[9px] font-cinzel tracking-widest text-gold">0</span>
            </button>
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
              <Logo size={40} />
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
                      key={l}
                      href={`#${l.toLowerCase()}`}
                      onClick={() => setOpen(false)}
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="cursor-hover group flex items-baseline gap-4 border-b border-gold/10 pb-4"
                    >
                      <span className="font-cinzel text-[0.6rem] tracking-widest text-gold/60">0{i + 1}</span>
                      <span className="font-cormorant text-4xl md:text-6xl text-ivory group-hover:text-gold transition-colors duration-500">{l}</span>
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

/* ---------------------- HERO ---------------------- */
const Hero = () => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={ref} id="top" className="relative h-screen w-full overflow-hidden bg-burgundy-ink">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img src={IMG.hero} alt="Arkadhatri Bridal" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-burgundy-ink/70 via-burgundy/40 to-burgundy-ink/90" />
        <div className="absolute inset-0 bg-burgundy/30" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, delay: 0.5 }} className="divider-ornament max-w-xs mx-auto mb-8">
          <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold">EST · MMXXV</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, letterSpacing: '0.6em' }}
          animate={{ opacity: 1, letterSpacing: '0.2em' }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className="font-cinzel text-ivory text-[2.4rem] sm:text-6xl md:text-8xl lg:text-[9rem] tracking-[0.2em] leading-none"
        >
          ARKADHATRI
        </motion.h1>

        <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 1.6, delay: 1.4 }} className="gold-line w-32 md:w-64 my-8" />

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 1.6 }} className="font-cormorant italic text-gold text-xl md:text-3xl tracking-widest">
          Timeless Luxury. <span className="text-ivory/90">Modern Heritage.</span>
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 2 }} className="mt-14 flex flex-col sm:flex-row items-center gap-5">
          <a href="#collections" className="btn-luxury btn-luxury-filled">Explore Collection</a>
          <a href="#contact" className="btn-luxury">Book Private Shopping</a>
        </motion.div>

        {/* scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 2.6 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <span className="font-cinzel text-[0.6rem] tracking-[0.35em] text-gold/80">SCROLL</span>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-[1px] h-16 bg-gradient-to-b from-gold to-transparent" />
        </motion.div>
      </motion.div>

      {/* Vertical side text */}
      <div className="hidden lg:block absolute left-6 top-1/2 -translate-y-1/2 z-10">
        <div className="vertical-text font-cinzel text-[0.6rem] tracking-[0.5em] text-gold/70">MAISON · MMXXV · KOLKATA</div>
      </div>
      <div className="hidden lg:block absolute right-6 top-1/2 -translate-y-1/2 z-10">
        <div className="vertical-text font-cinzel text-[0.6rem] tracking-[0.5em] text-gold/70">HANDCRAFTED · IN · INDIA</div>
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
            A quiet <em className="gold-shimmer not-italic">rebellion</em>
            <br />in silk & story.
          </h2>
          <div className="space-y-5 font-inter font-light text-ivory/70 text-[15px] leading-[1.9] max-w-lg">
            <p>
              ARKADHATRI began with a single loom, a single thread of 24k zari, and
              an unwavering belief — that Indian luxury deserved a house that felt as
              considered as any European maison, yet as ancestral as the ghats of the Ganges.
            </p>
            <p>
              Every drape is composed like an editorial: sketched by our design atelier in
              Kolkata, entrusted to master weavers in Varanasi and Kancheepuram, and finished
              in-house with hand-embellishments that can take up to fourteen months of quiet work.
            </p>
          </div>
          <div className="mt-10 flex items-center gap-6">
            <a href="#craft" className="btn-luxury">Discover the Craft</a>
            <span className="font-cormorant italic text-gold text-lg">— Est. Kolkata</span>
          </div>
        </motion.div>
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
                  <button className="w-10 h-10 bg-burgundy-ink/80 backdrop-blur-sm border border-gold/40 flex items-center justify-center hover:bg-gold hover:border-gold group/i transition-all">
                    <Heart size={14} strokeWidth={1.2} className="text-gold group-hover/i:text-burgundy" />
                  </button>
                  <button className="w-10 h-10 bg-burgundy-ink/80 backdrop-blur-sm border border-gold/40 flex items-center justify-center hover:bg-gold hover:border-gold group/i transition-all">
                    <Search size={14} strokeWidth={1.2} className="text-gold group-hover/i:text-burgundy" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-700">
                  <button className="w-full py-3 bg-gold text-burgundy font-cinzel text-[0.65rem] tracking-[0.35em] hover:bg-ivory transition-colors">QUICK VIEW</button>
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
        <form onSubmit={submit} className="mt-12 flex flex-col sm:flex-row items-stretch gap-0 max-w-xl mx-auto border border-gold">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="Your correspondence address"
            className="flex-1 bg-transparent px-6 py-5 outline-none text-ivory font-cormorant italic text-lg placeholder:text-ivory/40"
          />
          <button type="submit" className="btn-luxury btn-luxury-filled !border-none">{sent ? 'Welcome' : 'Subscribe'}</button>
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
          <Logo size={44} />
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
          { t: 'MAISON', l: ['About', 'Craftsmanship', 'The Atelier', 'Sustainability', 'Press'] },
          { t: 'DISCOVER', l: ['Silk Sarees', 'Wedding', 'Festive', 'Signature', 'Limited Edition'] },
          { t: 'CLIENT SERVICES', l: ['Private Appointments', 'Boutiques', 'Care Guide', 'Shipping', 'Returns'] },
          { t: 'LEGAL', l: ['Privacy', 'Terms', 'Cookies', 'Authenticity', 'Contact'] }
        ].map((col) => (
          <div key={col.t} className="md:col-span-2">
            <div className="font-cinzel text-[0.6rem] tracking-[0.35em] text-gold mb-6">— {col.t}</div>
            <ul className="space-y-3">
              {col.l.map(item => (
                <li key={item}>
                  <a href="#" className="font-cormorant text-ivory/70 hover:text-gold transition-colors text-lg cursor-hover">{item}</a>
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
          <Logo size={80} />
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
      <Collections />
      <BestSellers />
      <Craftsmanship />
      <Why />
      <Testimonials />
      <Insta />
      <Newsletter />
      <Footer />
    </main>
  )
}

export default App
