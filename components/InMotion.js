'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Volume2, VolumeX } from 'lucide-react'
import { useCatalog } from '@/lib/catalog'
import { inr } from '@/lib/cart'

/* Single vertical reel: autoplays silently while on screen, pauses when scrolled away */
const Reel = ({ p, i }) => {
  const ref = useRef(null)
  const vid = useRef(null)
  const [show, setShow] = useState(false)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setShow(true); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setShow(true)
      const v = vid.current
      if (!v) return
      if (e.intersectionRatio >= 0.55) v.play().catch(() => {})
      else v.pause()
    }, { threshold: [0, 0.55, 1], rootMargin: '100px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: (i % 4) * 0.07 }}
      className="snap-start shrink-0 w-[68vw] sm:w-[42vw] md:w-[30vw] lg:w-[22vw] max-w-[320px]"
    >
      <div className="relative aspect-[9/16] rounded-sm overflow-hidden border border-gold/20 bg-burgundy-ink group">
        {p.videoPoster && <img src={p.videoPoster} alt={p.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />}
        {show && (
          <video
            ref={vid}
            src={p.videoUrl}
            poster={p.videoPoster || undefined}
            muted={muted}
            loop
            playsInline
            autoPlay
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-burgundy-ink/90 via-transparent to-transparent pointer-events-none" />
        <button
          onClick={() => { setMuted((m) => !m); const v = vid.current; if (v) { v.muted = !v.muted; v.play().catch(() => {}) } }}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-burgundy-ink/70 border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-burgundy-ink transition-colors"
        >
          {muted ? <VolumeX size={14} strokeWidth={1.6} /> : <Volume2 size={14} strokeWidth={1.6} />}
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="font-cormorant text-2xl text-ivory leading-tight">{p.name}</h3>
          <div className="font-cinzel text-[0.6rem] tracking-[0.25em] text-gold mt-1">{p.currency || '\u20b9'} {inr(p.price)}</div>
          <Link href={`/product/${p.slug}`} className="mt-3 inline-flex items-center gap-2 h-10 px-4 bg-gold text-burgundy-ink rounded-sm font-cinzel text-[0.58rem] tracking-[0.28em] uppercase font-semibold hover:bg-ivory transition-colors">
            Shop this saree <ArrowRight size={12} strokeWidth={1.6} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

/** Homepage strip of short product videos. Renders nothing until at least one saree has a video. */
export default function InMotion() {
  const { products } = useCatalog()
  const reels = products.filter((p) => p.videoUrl)
  if (!reels.length) return null
  return (
    <section id="in-motion" data-testid="in-motion" className="bg-burgundy-ink py-20 md:py-28 overflow-hidden">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="eyebrow mb-3">— IN MOTION</div>
            <h2 className="font-cormorant text-4xl md:text-6xl text-ivory">See every drape come alive</h2>
          </div>
          <p className="font-cormorant text-ivory/70 text-lg max-w-sm">Short films of each saree: the fall of the pallu, the shimmer of the zari, the weight of real silk.</p>
        </div>
        <div className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-2 px-2 [scrollbar-width:thin]">
          {reels.map((p, i) => <Reel key={p.slug} p={p} i={i} />)}
        </div>
      </div>
    </section>
  )
}
