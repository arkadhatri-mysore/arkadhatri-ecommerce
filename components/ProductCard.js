'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import PriceTag from '@/components/PriceTag'
import { wishlist, useWishlist } from '@/lib/wishlist'
import { responsive } from '@/lib/img'

/** Clean ivory product card shared by the homepage and listings. */
const ProductCard = ({ p, priority = false }) => {
  const [saved] = useWishlist()
  const isSaved = saved.includes(p.slug)
  const img = responsive(p.images?.[0], [320, 480, 640, 900], 640)
  return (
    <article className="group relative" data-testid="product-card">
      <Link href={`/product/${p.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-burgundy-ink/5">
          {img.src && (
            <img src={img.src} srcSet={img.srcSet} sizes="(min-width:1024px) 25vw, 50vw" alt={`${p.name} — ${p.tagline || 'saree'}`}
              width="640" height="853" loading={priority ? 'eager' : 'lazy'} decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-[50%_25%] transition-transform duration-700 group-hover:scale-[1.03]" />
          )}
          {p.isNew && <span className="absolute top-3 left-3 px-2 py-1 bg-luxury-ivory/95 font-inter text-[0.68rem] tracking-[0.16em] uppercase text-burgundy-ink">New</span>}
          {p.inStock === false && <span className="absolute bottom-3 left-3 px-2 py-1 bg-burgundy-ink/90 font-inter text-[0.68rem] tracking-[0.16em] uppercase text-ivory">Sold out</span>}
        </div>
        <div className="pt-3.5 pr-10">
          <h3 className="font-cormorant text-xl md:text-[1.4rem] leading-tight text-burgundy-ink">{p.name}</h3>
          {p.tagline && <p className="mt-0.5 font-inter text-[13px] text-burgundy-ink/70 line-clamp-1">{p.tagline}</p>}
          <div className="mt-1.5 font-inter text-[15px] font-medium text-burgundy-ink"><PriceTag price={p.price} compareAt={p.comparePrice} /></div>
        </div>
      </Link>
      <button type="button" onClick={() => wishlist.toggle(p.slug)} aria-pressed={isSaved} aria-label={isSaved ? `Remove ${p.name} from saved sarees` : `Save ${p.name}`}
        className="absolute right-0 top-[calc(100%-4.6rem)] md:top-auto md:bottom-[3.9rem] w-11 h-11 flex items-center justify-center text-burgundy-ink hover:text-gold-dark">
        <Heart size={18} strokeWidth={1.5} fill={isSaved ? 'currentColor' : 'none'} />
      </button>
    </article>
  )
}

export default ProductCard
