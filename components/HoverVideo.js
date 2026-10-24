'use client'

import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'

/**
 * Silent looping preview video layered over a product image.
 * - Desktop (hover devices): plays while the pointer is over the card.
 * - Phones/tablets: plays automatically while the card is on screen.
 * The video file only starts downloading when it is about to be shown.
 */
export default function HoverVideo({ src, poster, hoverTarget, showChip = true, chipTone = 'dark' }) {
  const wrap = useRef(null)
  const vid = useRef(null)
  const [active, setActive] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!src) return
    const el = wrap.current
    const host = hoverTarget?.current || el?.parentElement
    const canHover = typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches
    if (canHover && host) {
      const on = () => setActive(true)
      const off = () => setActive(false)
      host.addEventListener('mouseenter', on)
      host.addEventListener('mouseleave', off)
      return () => { host.removeEventListener('mouseenter', on); host.removeEventListener('mouseleave', off) }
    }
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting && e.intersectionRatio >= 0.6), { threshold: [0, 0.6, 1] })
    io.observe(el)
    return () => io.disconnect()
  }, [src, hoverTarget])

  useEffect(() => {
    const v = vid.current
    if (!v) return
    if (active) { v.play().catch(() => {}) } else { v.pause() }
  }, [active])

  if (!src) return null
  return (
    <div ref={wrap} className="absolute inset-0 pointer-events-none">
      {active || ready ? (
        <video
          ref={vid}
          src={src}
          poster={poster || undefined}
          muted
          loop
          playsInline
          autoPlay={active}
          preload="metadata"
          onPlaying={() => setReady(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${active && ready ? 'opacity-100' : 'opacity-0'}`}
        />
      ) : null}
      {showChip && (
        <span className={`absolute top-3 left-3 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-sm font-cinzel text-[0.5rem] tracking-[0.25em] ${chipTone === 'dark' ? 'bg-burgundy-ink/80 text-gold border border-gold/40' : 'bg-luxury-ivory/90 text-burgundy-ink border border-burgundy-ink/20'}`}>
          <Play size={9} strokeWidth={2} fill="currentColor" /> VIDEO
        </span>
      )}
    </div>
  )
}
