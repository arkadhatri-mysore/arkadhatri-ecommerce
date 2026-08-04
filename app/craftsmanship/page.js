'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Plus, ArrowUpRight } from 'lucide-react'

const LOGO_URL = 'https://customer-assets-jt897jd0.emergentagent.net/job_timeless-crafted-8/artifacts/xkx14q2d_ARK%20LOGO.jpeg'

const HERO_VIDEOS = [
  'https://videos.pexels.com/video-files/7710243/7710243-hd_1920_1080_25fps.mp4',
  'https://videos.pexels.com/video-files/6069112/6069112-uhd_2560_1440_25fps.mp4'
]

const IMG = {
  hero: 'https://images.unsplash.com/photo-1564656622440-e6206eb5ee63?auto=format&fit=crop&w=2200&q=85',
  artisan: 'https://images.unsplash.com/photo-1617694820985-a5476fe22722?auto=format&fit=crop&w=1600&q=85',
  stages: [
    'https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1763400126795-d83e07d3449e?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1629118477133-b8b1499f2b8a?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1564656622440-e6206eb5ee63?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1779167327071-963220d85043?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1598616068517-c75ad397a436?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?auto=format&fit=crop&w=1400&q=85'
  ],
  macro: [
    'https://images.unsplash.com/photo-1610047614256-023d7c028d0b?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1654764746225-e63f5e90facd?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1619516388835-2b60acc4049e?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1774918036481-4b5578b604b3?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1756483560049-e7b2208f99a0?auto=format&fit=crop&w=1400&q=85'
  ]
}

const STAGES = [
  { n: '01', t: 'Selecting Premium Silk Yarn', d: 'Only the finest mulberry silk fibres are hand-inspected and drawn from Karnataka and Bengal, prized for their translucent lustre and quiet strength.' },
  { n: '02', t: 'Traditional Dyeing', d: 'Each hue is composed in small artisanal batches. Natural pigments and time-honoured mordants coax silk into rich, saturated colours that age gracefully.' },
  { n: '03', t: 'Design Preparation', d: 'Motifs are drafted by our design atelier in Kolkata, then translated onto graph and jala &mdash; the ancient template that guides every thread.' },
  { n: '04', t: 'Handloom Weaving', d: 'Two artisans, one loom, six months of quiet patience. Every pick of the shuttle is set by hand, never a machine.' },
  { n: '05', t: 'Intricate Zari Work', d: '98% pure silver zari, gilded in 24k gold, is inlaid thread by thread &mdash; borders and pallus catch the light like water.' },
  { n: '06', t: 'Hand Finishing', d: 'Fringes are hand-knotted, edges hand-rolled, and every imperfect thread reset by artisans whose eyes never leave the fabric.' },
  { n: '07', t: 'Quality Inspection', d: 'Each saree is examined under natural light against a black cloth. Only pieces judged worthy of the maison earn the Arkadhatri seal.' },
  { n: '08', t: 'Luxury Packaging', d: 'Presented in a silk-lined heirloom trunk, hand-signed by the artisan, and sealed with a numbered heritage passport.' }
]

const FABRICS = [
  { t: 'Mulberry Silk', d: 'The queen of silks. Soft, luminous, and exceptionally long-lived. Woven with 98% pure fibre and dyed in small batches.' },
  { t: 'Organza', d: 'Feather-light and translucent, with a discreet stiffness that holds its drape. Ideal for daylight silhouettes and summer weddings.' },
  { t: 'Banarasi', d: 'The heirloom weave of Varanasi. Brocaded in real zari across silk grounds, a Banarasi is worn once, then passed down for a lifetime.' },
  { t: 'Kanjivaram', d: 'The temple silk of Kancheepuram. Contrasting borders are woven separately and interlocked by hand &mdash; a technique unchanged for centuries.' },
  { t: 'Cotton Silk', d: 'A quiet, breathable weave where cotton and silk meet. Reserved for daywear and understated evening pieces.' },
  { t: 'Linen', d: 'European mill linen, hand-finished at our atelier and lightly embroidered with silk thread. Effortless, considered, modern.' }
]

const PROMISES = [
  { t: 'Handcrafted', d: 'Every piece begins on a wooden loom, never a machine.' },
  { t: 'Authentic', d: 'Numbered heritage passport with every saree.' },
  { t: 'Premium Packaging', d: 'Silk-lined heirloom trunk. Ceremony worthy of the piece.' },
  { t: 'Worldwide Delivery', d: 'White-glove, insured shipping to 60+ nations.' },
  { t: 'Quality Assurance', d: 'Inspected under natural light, against a black cloth.' }
]

/* ---------- HERO ---------- */
const CraftHero = () => {
  const videoRef = useRef(null)
  const [videoReady, setVideoReady] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const setMob = () => setIsMobile(mq.matches)
    setMob(); mq.addEventListener('change', setMob)
    return () => mq.removeEventListener('change', setMob)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v || isMobile) return
    const onCP = () => setVideoReady(true)
    v.addEventListener('canplay', onCP); v.play().catch(() => {})
    return () => v.removeEventListener('canplay', onCP)
  }, [isMobile])

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden bg-burgundy-ink">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img src={IMG.hero} alt="" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoReady && !isMobile ? 'opacity-0' : 'opacity-100'}`} />
        {!isMobile && (
          <video ref={videoRef} autoPlay muted loop playsInline preload="auto" poster={IMG.hero}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
            style={{ filter: 'saturate(0.9) contrast(1.05) brightness(0.8)' }}>
            {HERO_VIDEOS.map(s => <source key={s} src={s} type="video/mp4" />)}
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-burgundy-ink/85 via-burgundy/60 to-burgundy-ink/95" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(74,15,28,0) 0%, rgba(42,8,16,0.6) 80%)' }} />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.3 }} className="divider-ornament max-w-md mx-auto mb-8">
          <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold">A HERITAGE FILM · EST MMXXV</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, letterSpacing: '0.5em' }} animate={{ opacity: 1, letterSpacing: '0.18em' }} transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }} className="font-cinzel text-3xl sm:text-5xl md:text-7xl lg:text-[6rem] gold-metallic-text" style={{ fontWeight: 600 }}>
          THE ART OF CRAFTSMANSHIP
        </motion.h1>
        <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 1.6, delay: 1.4 }} className="gold-line w-32 md:w-56 my-10" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 1.7 }} className="font-cormorant italic text-warm-grey text-xl md:text-3xl max-w-3xl leading-[1.5]">
          Every thread tells a story.<br /><span className="text-gold">Every weave preserves a legacy.</span>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 2.4 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <span className="font-cinzel text-[0.6rem] tracking-[0.4em] text-gold/85">ENTER THE ATELIER</span>
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-[1px] h-16 bg-gradient-to-b from-gold to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ---------- VIRTUAL LOOM (Section 2) ---------- */
const VirtualLoom = () => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const progressBarH = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section ref={ref} className="relative bg-burgundy py-32 md:py-48 overflow-hidden">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <div className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold mb-4">— II · THE VIRTUAL LOOM</div>
          <h2 className="font-cormorant text-5xl md:text-7xl text-ivory leading-[1.05]">
            Eight <em className="gold-shimmer not-italic">stages.</em>
            <br />One quiet <em className="gold-shimmer not-italic">masterpiece.</em>
          </h2>
          <p className="font-cormorant italic text-warm-grey text-lg mt-6">Scroll slowly. The weave will unfold before you.</p>
        </div>

        <div className="grid md:grid-cols-[80px_1fr] gap-8 md:gap-14">
          {/* Progress rail (sticky) */}
          <div className="hidden md:block relative">
            <div className="sticky top-32">
              <div className="relative w-[1px] h-[70vh] bg-gold/15 mx-auto">
                <motion.div style={{ height: progressBarH }} className="absolute top-0 left-0 w-full bg-gold origin-top" />
                {STAGES.map((s, i) => (
                  <div key={s.n} className="absolute w-3 h-3 rounded-full border border-gold bg-burgundy left-1/2 -translate-x-1/2" style={{ top: `${(i / (STAGES.length - 1)) * 100}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Stages */}
          <div className="space-y-24 md:space-y-32">
            {STAGES.map((s, i) => (
              <Stage key={s.n} s={s} i={i} img={IMG.stages[i]} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const Stage = ({ s, i, img }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-150px' })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  const reverse = i % 2 === 1
  return (
    <div ref={ref} className={`grid md:grid-cols-12 gap-8 md:gap-14 items-center ${reverse ? 'md:[direction:rtl]' : ''}`}>
      <motion.div
        initial={{ opacity: 0, x: reverse ? 40 : -40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="md:col-span-6 [direction:ltr]"
      >
        <div className="relative aspect-[4/5] luxury-card noise-overlay overflow-hidden">
          <motion.img style={{ y }} src={img} alt={s.t} className="w-full h-[115%] object-cover" />
          <div className="absolute top-6 left-6 font-cinzel text-[6rem] leading-none text-gold/25" style={{ fontWeight: 600 }}>{s.n}</div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: reverse ? -40 : 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="md:col-span-6 [direction:ltr]"
      >
        <div className="font-cinzel text-[0.65rem] tracking-[0.4em] text-gold mb-4">— STAGE {s.n}</div>
        <h3 className="font-cormorant text-4xl md:text-5xl text-ivory leading-[1.1]" dangerouslySetInnerHTML={{__html: s.t}} />
        <div className="gold-line w-16 my-6" />
        <p className="font-inter font-light text-ivory/70 text-[15px] leading-[1.9] max-w-lg" dangerouslySetInnerHTML={{__html: s.d}} />
      </motion.div>
    </div>
  )
}

/* ---------- MEET THE ARTISAN ---------- */
const MeetArtisan = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  return (
    <section ref={ref} className="relative bg-burgundy-ink py-32 md:py-48 overflow-hidden">
      <div className="container grid md:grid-cols-12 gap-14 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 1.4 }} className="md:col-span-6">
          <div className="relative aspect-[3/4] luxury-card noise-overlay">
            <img src={IMG.artisan} alt="Master Artisan" className="w-full h-full object-cover" />
            <div className="absolute -bottom-6 -right-6 bg-burgundy-ink px-8 py-6 border border-gold/40">
              <div className="font-cinzel text-[0.55rem] tracking-[0.35em] text-gold">— THE HAND</div>
              <div className="font-cormorant italic text-3xl text-ivory">Ustad Ramesh</div>
              <div className="font-cormorant italic text-warm-grey text-sm">Master Weaver · Varanasi · 6th Generation</div>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 1.4, delay: 0.2 }} className="md:col-span-6">
          <div className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold mb-4">— III · MEET THE ARTISAN</div>
          <h2 className="font-cormorant text-5xl md:text-6xl text-ivory leading-[1.05]">
            Six generations<br />at a single <em className="gold-shimmer not-italic">loom.</em>
          </h2>
          <div className="gold-line w-24 my-8" />
          <p className="font-cormorant italic text-2xl text-ivory/85 leading-[1.5]">
            &ldquo;My grandfather taught my father. My father taught me. And when the loom hums,
            I hear all of them at once.&rdquo;
          </p>
          <p className="mt-8 font-inter font-light text-ivory/60 text-[15px] leading-[1.9] max-w-lg">
            Ustad Ramesh has spent forty-two years shaping silk. He arrives at 5:30, drinks
            tea, and only then begins the day&rsquo;s pick. He can name every thread in the loom
            by touch. He is one of eleven master weavers who work exclusively for the maison.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
            {[{n:'42',l:'YEARS AT LOOM'},{n:'11',l:'MASTER WEAVERS'},{n:'6',l:'GENERATIONS'}].map(s => (
              <div key={s.l}>
                <div className="font-cormorant italic text-4xl text-gold">{s.n}</div>
                <div className="font-cinzel text-[0.55rem] tracking-[0.35em] text-warm-grey mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- MAKING TIMELINE ---------- */
const MakingTimeline = () => {
  const inView = useRef(null)
  const items = [
    { m: '01', t: 'Design Consultation', d: 'The bride, the stylist, the atelier meet.' },
    { m: '02', t: 'Yarn Selection', d: 'Mulberry silk from Karnataka & Bengal.' },
    { m: '03', t: 'Natural Dyeing', d: 'Small-batch pigments, hand-mordanted.' },
    { m: '05', t: 'Loom Set-up', d: 'Jala template drawn thread by thread.' },
    { m: '08', t: 'Weaving Begins', d: 'Two artisans. One loom. Quiet patience.' },
    { m: '11', t: 'Zari Inlay', d: '24k gold, drawn silver, hand-inlaid.' },
    { m: '13', t: 'Finishing', d: 'Hand-knotted fringe, rolled edges.' },
    { m: '14', t: 'Trunk & Passport', d: 'Signed. Sealed. Sent to you.' }
  ]
  return (
    <section className="relative bg-burgundy py-32 md:py-48">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold mb-4">— IV · THE MAKING</div>
          <h2 className="font-cormorant text-5xl md:text-7xl text-ivory">The Making of an <em className="gold-shimmer not-italic">Arkadhatri</em></h2>
          <p className="font-cormorant italic text-warm-grey text-lg mt-4">Fourteen months, told in eight quiet moments.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gold/15 border border-gold/15">
          {items.map((it, i) => (
            <motion.div
              key={it.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, delay: i * 0.06 }}
              className="bg-burgundy p-8 md:p-10 group hover:bg-burgundy-deep transition-colors duration-700"
            >
              <div className="font-cinzel text-[0.55rem] tracking-[0.4em] text-gold mb-3">MONTH {it.m}</div>
              {/* Simple line icon */}
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="mb-4">
                <circle cx="12" cy="12" r="10" stroke="#C8A45A" strokeWidth="0.8" fill="none" />
                <circle cx="12" cy="12" r="3" fill="#C8A45A" opacity="0.85" />
                <path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12" stroke="#C8A45A" strokeWidth="0.8" />
              </svg>
              <div className="font-cormorant text-2xl text-ivory mb-2 group-hover:text-gold transition-colors">{it.t}</div>
              <div className="font-inter font-light text-ivory/60 text-[13px] leading-[1.7]">{it.d}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- FABRIC LIBRARY ---------- */
const FabricLibrary = () => {
  const [open, setOpen] = useState(0)
  return (
    <section className="relative bg-burgundy-ink py-32 md:py-48">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold mb-4">— V · THE FABRIC LIBRARY</div>
          <h2 className="font-cormorant text-5xl md:text-7xl text-ivory">The Weaves We <em className="gold-shimmer not-italic">Live By.</em></h2>
        </div>
        <div className="max-w-4xl mx-auto">
          {FABRICS.map((f, i) => {
            const isOpen = open === i
            return (
              <motion.button
                key={f.t}
                onClick={() => setOpen(isOpen ? -1 : i)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: i * 0.06 }}
                className="w-full text-left border-b border-gold/20 group cursor-hover"
              >
                <div className="flex items-baseline justify-between py-8">
                  <div className="flex items-baseline gap-6">
                    <span className="font-cinzel text-[0.6rem] tracking-[0.4em] text-gold">0{i + 1}</span>
                    <h3 className="font-cormorant text-3xl md:text-5xl text-ivory group-hover:text-gold transition-colors">{f.t}</h3>
                  </div>
                  <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.4 }}>
                    <Plus size={24} strokeWidth={1.2} className="text-gold" />
                  </motion.div>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="font-cormorant italic text-xl text-warm-grey leading-[1.7] pb-8 pr-14 max-w-2xl">
                        {f.d}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------- LUXURY DETAILS (macro) ---------- */
const LuxuryDetails = () => {
  const labels = ['ZARI', 'BORDERS', 'PALLU', 'TEXTURE', 'EMBROIDERY']
  return (
    <section className="relative bg-burgundy py-32 md:py-48">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold mb-4">— VI · LUXURY DETAILS</div>
          <h2 className="font-cormorant text-5xl md:text-7xl text-ivory">Composed in the <em className="gold-shimmer not-italic">Small Places.</em></h2>
          <p className="font-cormorant italic text-warm-grey text-lg mt-4">Macro photography, hand-lit at the atelier.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:auto-rows-[220px]">
          {IMG.macro.map((src, i) => {
            const spans = [
              'col-span-2 md:col-span-3 md:row-span-2',
              'col-span-2 md:col-span-3',
              'col-span-1 md:col-span-2',
              'col-span-1 md:col-span-2',
              'col-span-2 md:col-span-2'
            ]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 1, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={`luxury-card noise-overlay relative group cursor-hover ${spans[i]}`}
              >
                <img src={src} alt={labels[i]} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-burgundy-ink via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <span className="font-cinzel text-[0.55rem] tracking-[0.4em] text-gold">— 0{i + 1}</span>
                  <span className="font-cinzel text-[0.65rem] tracking-[0.4em] text-ivory">{labels[i]}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------- LUXURY PROMISE ---------- */
const LuxuryPromise = () => (
  <section className="relative bg-burgundy-ink py-32 md:py-48">
    <div className="container">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold mb-4">— VII · THE LUXURY PROMISE</div>
        <h2 className="font-cormorant text-5xl md:text-6xl text-ivory">A promise, hand-signed by the <em className="gold-shimmer not-italic">maison.</em></h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-gold/15 border border-gold/15 max-w-6xl mx-auto">
        {PROMISES.map((p, i) => (
          <motion.div
            key={p.t}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1, delay: i * 0.08 }}
            className="bg-burgundy-ink p-8 text-center group hover:bg-burgundy-deep transition-colors"
          >
            <div className="font-cinzel text-[0.55rem] tracking-[0.4em] text-gold mb-3">0{i + 1}</div>
            <div className="font-cormorant text-2xl text-ivory group-hover:text-gold transition-colors">{p.t}</div>
            <div className="gold-line w-8 mx-auto my-4" />
            <div className="font-inter font-light text-warm-grey text-[12.5px] leading-[1.8]">{p.d}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

/* ---------- CTA ---------- */
const FinalCTA = () => (
  <section className="relative bg-burgundy py-32 md:py-40 text-center overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-gold/[0.04] blur-3xl" />
    </div>
    <div className="container relative">
      <div className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold mb-6">— VIII</div>
      <h2 className="font-cormorant text-5xl md:text-7xl text-ivory leading-[1.05]">
        Experience <em className="gold-shimmer not-italic">Craftsmanship.</em>
      </h2>
      <div className="gold-line w-24 mx-auto my-10" />
      <p className="font-cormorant italic text-warm-grey text-xl md:text-2xl max-w-2xl mx-auto">
        Every piece begins with fibre and finishes as an heirloom. Discover the current collection.
      </p>
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
        <Link href="/#collections" className="btn-luxury-filled">Explore Collection</Link>
        <Link href="/book-private-shopping" className="btn-luxury">Book Private Shopping</Link>
      </div>
    </div>
  </section>
)

/* ---------- SMALL FOOTER ---------- */
const SmallFooter = () => (
  <footer className="bg-burgundy-ink border-t border-gold/15 py-10">
    <div className="container flex flex-col md:flex-row items-center justify-between gap-3">
      <Link href="/" className="flex items-center gap-2 text-ivory hover:text-gold transition-colors group">
        <ChevronLeft size={14} strokeWidth={1.4} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-cinzel text-[0.6rem] tracking-[0.35em]">RETURN TO MAISON</span>
      </Link>
      <div className="font-cinzel text-[0.55rem] tracking-[0.4em] text-gold">HANDCRAFTED · IN · INDIA</div>
    </div>
  </footer>
)

/* ---------- PAGE HEADER MINI ---------- */
const PageHeader = () => (
  <div className="absolute top-0 left-0 right-0 z-30 py-6">
    <div className="container flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 text-ivory hover:text-gold transition-colors group">
        <ChevronLeft size={16} strokeWidth={1.4} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-cinzel text-[0.6rem] tracking-[0.35em]">MAISON</span>
      </Link>
      <Link href="/">
        <img src={LOGO_URL} alt="ARKADHATRI" className="h-14 md:h-16 object-contain" />
      </Link>
      <Link href="/book-private-shopping" className="hidden md:inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors">
        <span className="font-cinzel text-[0.55rem] tracking-[0.4em]">PRIVATE SHOPPING</span>
        <ArrowUpRight size={14} strokeWidth={1.4} />
      </Link>
    </div>
  </div>
)

const CraftsmanshipPage = () => (
  <main className="bg-burgundy min-h-screen text-ivory">
    <PageHeader />
    <CraftHero />
    <VirtualLoom />
    <MeetArtisan />
    <MakingTimeline />
    <FabricLibrary />
    <LuxuryDetails />
    <LuxuryPromise />
    <FinalCTA />
    <SmallFooter />
  </main>
)

export default CraftsmanshipPage
