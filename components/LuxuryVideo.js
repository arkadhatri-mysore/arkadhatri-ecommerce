'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

/**
 * LuxuryVideo
 * A reusable, mobile-friendly video slot for ARKADHATRI storytelling.
 *
 * Props:
 *   src            (optional) MP4/WebM URL or hosted video URL. If absent, renders poster only.
 *   poster         (recommended) fallback / cover image URL.
 *   alt            accessible label / alt for poster.
 *   ratio          '4/5' (default) | '16/9' | '3/4' | '1/1' | '21/9'
 *   autoplay       boolean, default true. Autoplay requires muted.
 *   muted          boolean, default true.
 *   loop           boolean, default true.
 *   controls       'minimal' (default) | 'none' | 'native'
 *   objectPosition css object-position, default 'center'
 *   className      extra classes for the outer wrapper.
 *   overlay        boolean, adds subtle burgundy gradient overlay for text.
 *
 * Behaviour:
 *   • Lazy loads via IntersectionObserver — the <video> element is only rendered
 *     once the slot enters the viewport.
 *   • If autoplay fails (e.g. iOS with data saver), gracefully shows a play button.
 *   • If no `src` is provided, only the poster is rendered — zero placeholder UI.
 */
export default function LuxuryVideo({
  src,
  poster,
  alt = '',
  ratio = '4/5',
  autoplay = true,
  muted = true,
  loop = true,
  controls = 'minimal',
  objectPosition = 'center',
  className = '',
  overlay = false,
  children
}) {
  const wrapRef = useRef(null)
  const videoRef = useRef(null)
  const [inView, setInView] = useState(false)
  const [playing, setPlaying] = useState(autoplay)
  const [isMuted, setIsMuted] = useState(muted)
  const [failed, setFailed] = useState(false)

  // Lazy mount video only when the slot enters the viewport.
  useEffect(() => {
    if (!src) return
    const el = wrapRef.current
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { setInView(true); io.disconnect() } })
      },
      { rootMargin: '150px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [src])

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play().then(() => setPlaying(true)).catch(() => setFailed(true)) }
    else { v.pause(); setPlaying(false) }
  }
  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setIsMuted(v.muted)
  }

  const ratioClass = {
    '4/5':  'aspect-[4/5]',
    '3/4':  'aspect-[3/4]',
    '1/1':  'aspect-square',
    '16/9': 'aspect-video',
    '21/9': 'aspect-[21/9]'
  }[ratio] || 'aspect-[4/5]'

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden ${ratioClass} ${className}`}
      role={src ? 'group' : 'img'}
      aria-label={alt}
    >
      {/* Poster (always renders — acts as graceful fallback + lazy placeholder) */}
      {poster && (
        <img
          src={poster}
          alt={alt}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${src && inView && playing && !failed ? 'opacity-0' : 'opacity-100'}`}
          style={{ objectPosition }}
        />
      )}

      {/* Video (mounted lazily) */}
      {src && inView && !failed && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition }}
          poster={poster}
          src={src}
          playsInline
          autoPlay={autoplay}
          muted={isMuted}
          loop={loop}
          preload="metadata"
          controls={controls === 'native'}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
        />
      )}

      {/* Optional burgundy gradient overlay for text over video */}
      {overlay && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#4A0F1C]/40 via-transparent to-[#4A0F1C]/70" />
      )}

      {/* Foreground children (captions, CTAs) */}
      {children && <div className="relative z-10 w-full h-full">{children}</div>}

      {/* Minimal controls */}
      {src && controls === 'minimal' && !failed && (
        <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 hover:opacity-100 focus-within:opacity-100 group-hover:opacity-100 transition-opacity duration-500" style={{opacity: 1}}>
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pause video' : 'Play video'}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#111111]/70 backdrop-blur text-[#C8A45A] hover:text-[#F7F3EB] transition-colors"
          >
            {playing ? <Pause size={14} strokeWidth={1.6} /> : <Play size={14} strokeWidth={1.6} className="translate-x-[1px]" />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#111111]/70 backdrop-blur text-[#C8A45A] hover:text-[#F7F3EB] transition-colors"
          >
            {isMuted ? <VolumeX size={14} strokeWidth={1.6} /> : <Volume2 size={14} strokeWidth={1.6} />}
          </button>
        </div>
      )}
    </div>
  )
}
