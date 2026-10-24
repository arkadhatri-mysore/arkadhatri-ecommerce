'use client'

import Link from 'next/link'
import { ChevronLeft, Heart } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { useCatalog } from '@/lib/catalog'
import { useWishlist } from '@/lib/wishlist'
import { LOGO_URL } from '@/lib/brand'

export default function WishlistPage() {
  const [saved, ready] = useWishlist()
  const { products, loading } = useCatalog()
  const items = saved.map((slug) => products.find((p) => p.slug === slug)).filter(Boolean)
  const busy = !ready || (saved.length > 0 && loading)

  return (
    <main className="min-h-screen bg-luxury-ivory">
      <header className="sticky top-0 z-40 bg-luxury-ivory/95 backdrop-blur-md border-b border-burgundy-ink/10">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2 text-burgundy-ink hover:text-gold transition-colors group">
            <ChevronLeft size={16} strokeWidth={1.4} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-cinzel text-[0.6rem] tracking-[0.35em]">CONTINUE SHOPPING</span>
          </Link>
          <Link href="/"><img src={LOGO_URL} alt="ARKADHATRI" className="h-12 md:h-14 object-contain" /></Link>
          <Link href="/cart" className="font-cinzel text-[0.6rem] tracking-[0.35em] text-burgundy-ink hover:text-gold">MY BAG</Link>
        </div>
      </header>

      <section className="container py-12 md:py-16">
        <div className="text-center mb-12">
          <div className="font-cinzel text-[0.62rem] tracking-[0.35em] text-gold mb-3">— SAVED SAREES</div>
          <h1 className="font-cormorant text-4xl md:text-5xl text-burgundy-ink">Your Wishlist</h1>
          <p className="font-inter text-burgundy-ink/70 mt-3">Saved on this device. Tap the heart on any saree to add or remove it.</p>
        </div>

        {busy ? (
          <div data-testid="wishlist-loading" className="py-16 text-center font-inter text-burgundy-ink/70">Loading your saved sarees…</div>
        ) : items.length === 0 ? (
          <div data-testid="wishlist-empty" className="py-16 text-center max-w-md mx-auto">
            <Heart size={40} strokeWidth={1.2} className="text-burgundy-ink/40 mx-auto mb-6" />
            <p className="font-inter text-lg text-burgundy-ink/80 mb-8">You have not saved any sarees yet.</p>
            <Link href="/collections/silk-sarees" className="btn-luxury-filled inline-flex">Explore Sarees</Link>
          </div>
        ) : (
          <div data-testid="wishlist-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10">
            {items.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        )}
      </section>
    </main>
  )
}
