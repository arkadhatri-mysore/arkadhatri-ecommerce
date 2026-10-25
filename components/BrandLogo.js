// ARKADHATRI brand mark: scalable silk-drape "A" under a rising sun, with a serif wordmark.
// Pure SVG + text (no raster badge) so it stays crisp at every size.
const PALETTE = {
  dark: { mark: '#35121C', gold: '#A48246', text: '#35121C', sub: '#A48246' },
  light: { mark: '#F7F3EB', gold: '#C9A96A', text: '#F7F3EB', sub: '#C9A96A' }
}

export const BrandEmblem = ({ size = 40, variant = 'dark', title }) => {
  const c = PALETTE[variant] || PALETTE.dark
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} focusable="false" className="shrink-0">
      {title && <title>{title}</title>}
      <circle cx="32" cy="32" r="30" fill="none" stroke={c.gold} strokeWidth="1.2" />
      <g stroke={c.gold} strokeWidth="1.4" strokeLinecap="round">
        <path d="M32 9v4M20.5 12.6l2 3.4M43.5 12.6l-2 3.4M12.4 20.8l3.4 2M51.6 20.8l-3.4 2" />
      </g>
      <path d="M23 27a9 9 0 0 1 18 0" fill={c.gold} opacity="0.9" />
      <path d="M14.5 51C21 40 26.5 28 32 15c5.5 13 11 25 17.5 36" fill="none" stroke={c.mark} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.5 40.5c6-3.6 11.5 3.6 17.5 0 2.2-1.3 3.8-1.4 5.5-.6" fill="none" stroke={c.gold} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

const SIZES = {
  sm: { emblem: 30, text: 'text-[0.95rem] tracking-[0.22em]', sub: 'text-[0.5rem]' },
  md: { emblem: 40, text: 'text-[1.05rem] md:text-[1.25rem] tracking-[0.24em]', sub: 'text-[0.52rem]' },
  lg: { emblem: 64, text: 'text-2xl md:text-3xl tracking-[0.26em]', sub: 'text-[0.6rem]' }
}

/** Emblem + ARKADHATRI wordmark. `stacked` centres the wordmark below the emblem. */
const BrandLogo = ({ variant = 'dark', size = 'md', stacked = false, tagline = false, className = '' }) => {
  const c = PALETTE[variant] || PALETTE.dark
  const s = SIZES[size] || SIZES.md
  return (
    <span className={`inline-flex ${stacked ? 'flex-col' : 'flex-row'} items-center gap-2.5 select-none ${className}`}>
      <BrandEmblem size={s.emblem} variant={variant} />
      <span className={`flex flex-col ${stacked ? 'items-center' : 'items-start'} leading-none`}>
        <span className={`font-cinzel ${s.text} whitespace-nowrap`} style={{ color: c.text, fontWeight: 600 }}>ARKADHATRI</span>
        {tagline && <span className={`font-inter ${s.sub} tracking-[0.32em] uppercase mt-1.5 whitespace-nowrap`} style={{ color: c.sub }}>South Indian Sarees</span>}
      </span>
      <span className="sr-only">ARKADHATRI home</span>
    </span>
  )
}

export default BrandLogo
