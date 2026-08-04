'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ArrowRight } from 'lucide-react'
import { cart, inr } from '@/lib/cart'

/**
 * Reusable ProductCard for all product listings.
 * Variant:
 *  - 'ivory' (default): light background pages (collections, related)
 *  - 'burgundy': dark homepage featured section
 */
const ProductCard = ({ p, variant = 'ivory', showPlaceholder = true }) => {
  const [wishlisted, setWishlisted] = useState(false)
  const dark = variant === 'burgundy'

  const badges = []
  if (p.isNew) badges.push({ label: 'NEW', tone: 'gold' })
  if (p.isBestseller) badges.push({ label: 'BESTSELLER', tone: 'burgundy' })
  if (p.isLimited) badges.push({ label: 'LIMITED EDITION', tone: 'gold-outline' })
  if (p.isTrending && !p.isNew && !p.isBestseller) badges.push({ label: 'TRENDING', tone: 'burgundy' })

  const badgeCls = (tone) => {
    if (tone === 'gold') return 'bg-gold text-burgundy-ink'
    if (tone === 'gold-outline') return 'bg-luxury-ivory text-burgundy-ink border border-gold'
    return 'bg-burgundy-ink/90 text-gold border border-gold/40'
  }

  const primaryText = dark ? 'text-ivory' : 'text-burgundy-ink'
  const mutedText   = dark ? 'text-ivory/60' : 'text-burgundy-ink/60'
  const priceText   = dark ? 'text-gold' : 'text-burgundy-ink'
  const heartBg     = dark ? 'bg-burgundy-ink/85 border-gold/40 text-gold' : 'bg-luxury-ivory/95 border-burgundy-ink/15 text-burgundy-ink'

  return (
    <article className="group flex flex-col">
      {/* Image */}
      <Link href={`/product/${p.slug}`} className="relative block aspect-[3/4] overflow-hidden rounded-sm bg-burgundy-ink/5 mb-4">
        {showPlaceholder && (
          <span className="absolute top-3 left-3 z-10 px-2 py-1 bg-burgundy-ink/80 backdrop-blur-sm border border-gold/40 rounded-sm font-cinzel text-[0.5rem] tracking-[0.25em] text-gold/95">
            STUDIO PHOTO PENDING
          </span>
        )}
        {badges.length > 0 && (
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end">
            {badges.map((b) => (
              <span key={b.label} className={`px-2.5 py-1 rounded-sm font-cinzel text-[0.5rem] tracking-[0.3em] font-semibold ${badgeCls(b.tone)}`}>{b.label}</span>
            ))}
          </div>
        )}
        <img
          src={p.images?.[0] || p.image}
          alt={p.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlisted((w) => !w) }}
          aria-label="Add to wishlist"
          className={`absolute bottom-3 right-3 z-10 w-10 h-10 flex items-center justify-center rounded-sm backdrop-blur-sm border transition-colors ${heartBg} hover:bg-gold hover:text-burgundy-ink`}
        >
          <Heart size={14} strokeWidth={1.4} fill={wishlisted ? '#C8A45A' : 'none'} className={wishlisted ? 'text-gold' : ''} />
        </button>
      </Link>

      {/* Meta */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="min-w-0">
          <Link href={`/product/${p.slug}`}>
            <h3 className={`font-cormorant text-xl md:text-2xl leading-tight hover:text-gold transition-colors ${primaryText}`}>{p.name}</h3>
          </Link>
          <div className={`font-cinzel text-[0.55rem] tracking-[0.32em] uppercase mt-1.5 ${mutedText}`}>
            {p.fabricType || p.collectionName}
            {p.colourName && <span className="opacity-70"> · {p.colourName}</span>}
          </div>
        </div>
        <div className={`font-cinzel text-[0.7rem] tracking-widest whitespace-nowrap mt-1 ${priceText}`} style={{ fontWeight: 600 }}>
          {p.currency || '\u20b9'} {inr(p.price)}
        </div>
      </div>

      {/* One-line tagline */}
      <p className={`font-cormorant italic text-sm md:text-base mb-4 leading-snug ${mutedText}`}>
        {p.tagline}
      </p>

      {/* View Product CTA */}
      <Link
        href={`/product/${p.slug}`}
        className={`mt-auto inline-flex items-center justify-center gap-2 h-11 px-4 border rounded-sm font-cinzel text-[0.6rem] tracking-[0.32em] uppercase transition-all ${
          dark
            ? 'border-gold/60 text-gold hover:bg-gold hover:text-burgundy-ink'
            : 'border-burgundy-ink/25 text-burgundy-ink hover:bg-burgundy-ink hover:text-ivory hover:border-burgundy-ink'
        }`}
      >
        View Product
        <ArrowRight size={12} strokeWidth={1.5} />
      </Link>
    </article>
  )
}

export default ProductCard
