'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ShoppingBag, Heart } from 'lucide-react'
import { getCollection, getProductsByCollection, COLLECTIONS } from '@/lib/products'
import { cart, inr } from '@/lib/cart'

const LOGO_URL = 'https://customer-assets-jt897jd0.emergentagent.net/job_timeless-crafted-8/artifacts/xkx14q2d_ARK%20LOGO.jpeg'

const Header = () => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    setCount(cart.count())
    const sync = () => setCount(cart.count())
    window.addEventListener('cart:changed', sync)
    return () => window.removeEventListener('cart:changed', sync)
  }, [])
  return (
    <header className="sticky top-0 z-40 bg-luxury-ivory/95 backdrop-blur-md border-b border-burgundy-ink/10">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 text-burgundy-ink hover:text-gold transition-colors group">
          <ChevronLeft size={16} strokeWidth={1.4} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-cinzel text-[0.6rem] tracking-[0.35em]">BACK TO SHOP</span>
        </Link>
        <Link href="/"><img src={LOGO_URL} alt="ARKADHATRI" className="h-12 md:h-14 object-contain" /></Link>
        <Link href="/cart" className="relative text-burgundy-ink hover:text-gold transition-colors" aria-label="Cart">
          <ShoppingBag size={18} strokeWidth={1.4} />
          <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-gold text-burgundy-ink text-[9px] font-cinzel font-semibold">{count}</span>
        </Link>
      </div>
    </header>
  )
}

const AddToBag = ({ product }) => {
  const [added, setAdded] = useState(false)
  useEffect(() => { if (added) { const t = setTimeout(() => setAdded(false), 2000); return () => clearTimeout(t) } }, [added])
  const click = (e) => { e.preventDefault(); e.stopPropagation(); if (added) return; cart.add(product); setAdded(true) }
  return (
    <motion.button
      onClick={click}
      animate={{ backgroundColor: added ? '#4A0F1C' : '#C8A45A', color: added ? '#F7F3EB' : '#4A0F1C' }}
      transition={{ duration: 0.3 }}
      className="w-full h-11 font-cinzel text-[0.6rem] tracking-[0.3em] uppercase rounded-md font-semibold"
    >
      {added ? '\u2713 Added' : 'Add to Bag'}
    </motion.button>
  )
}

const PlaceholderBadge = () => (
  <span className="absolute top-3 left-3 px-2 py-1 bg-burgundy-ink/80 backdrop-blur-sm border border-gold/40 rounded-sm font-cinzel text-[0.5rem] tracking-[0.25em] text-gold/95 z-10" data-placeholder="true">
    STUDIO PHOTO PENDING
  </span>
)

const CollectionPage = () => {
  const { slug } = useParams()
  const collection = getCollection(slug)
  const products = getProductsByCollection(slug)

  useEffect(() => {
    if (collection) {
      document.title = `${collection.name} \u2014 ARKADHATRI`
    }
  }, [collection])

  if (!collection) return (
    <main className="min-h-screen bg-luxury-ivory">
      <Header />
      <div className="container py-32 text-center">
        <h1 className="font-cormorant text-4xl text-burgundy-ink mb-6">Collection not found.</h1>
        <Link href="/" className="btn-luxury-filled">Return to Shop</Link>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-luxury-ivory">
      {/* Breadcrumb Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
          { '@type': 'ListItem', position: 2, name: 'Collections', item: '/#collections' },
          { '@type': 'ListItem', position: 3, name: collection.name }
        ]
      })}} />
      <Header />

      {/* Collection hero */}
      <section className="relative bg-burgundy-ink overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img src={collection.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-burgundy-ink/60 to-burgundy-ink" />
        </div>
        <div className="relative container py-24 md:py-32 text-center">
          <nav className="text-[0.6rem] tracking-[0.3em] uppercase font-cinzel text-gold/80 mb-6 flex items-center justify-center gap-2">
            <Link href="/" className="hover:text-gold transition-colors">HOME</Link>
            <ChevronRight size={11} strokeWidth={1.3} />
            <span className="text-gold">{collection.name.toUpperCase()}</span>
          </nav>
          <div className="eyebrow mb-4">{collection.tag}</div>
          <h1 className="font-cormorant text-5xl md:text-7xl gold-metallic-text" style={{ fontWeight: 600 }}>{collection.name}</h1>
          <div className="gold-line w-24 mx-auto my-6" />
          <p className="font-cormorant italic text-warm-grey text-lg md:text-xl max-w-2xl mx-auto">{collection.desc}</p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div className="font-cinzel text-[0.6rem] tracking-[0.3em] text-burgundy-ink/70">{products.length} PIECE{products.length === 1 ? '' : 'S'}</div>
            <div className="font-cormorant italic text-burgundy-ink/60 text-sm">Curated by ARKADHATRI</div>
          </div>

          {products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-cormorant italic text-burgundy-ink/70 text-xl">New pieces arriving in this collection soon.</p>
              <Link href="/" className="mt-6 btn-luxury inline-flex">Browse The Boutique</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {products.map((p) => (
                <div key={p.sku} className="group">
                  <Link href={`/product/${p.slug}`} className="block relative aspect-[3/4] overflow-hidden rounded-sm bg-burgundy-ink/5 mb-4">
                    <PlaceholderBadge />
                    <img src={p.images[0]} alt={p.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    {p.isNew && <span className="absolute top-3 right-3 px-2.5 py-1 bg-gold text-burgundy-ink font-cinzel text-[0.5rem] tracking-[0.3em] font-semibold rounded-sm z-10">NEW</span>}
                    <button aria-label="Wishlist" className="absolute bottom-3 right-3 w-9 h-9 bg-luxury-ivory/90 backdrop-blur-sm border border-burgundy-ink/15 flex items-center justify-center hover:bg-gold group/w transition-colors rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.preventDefault()}>
                      <Heart size={13} strokeWidth={1.4} className="text-burgundy-ink group-hover/w:text-burgundy-ink" />
                    </button>
                  </Link>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <Link href={`/product/${p.slug}`} className="font-cormorant text-xl md:text-2xl text-burgundy-ink hover:text-gold transition-colors block">{p.name}</Link>
                      <div className="font-inter font-light text-burgundy-ink/60 text-[12px] mt-0.5">{p.tagline}</div>
                    </div>
                    <div className="font-cinzel text-[0.68rem] tracking-widest text-burgundy-ink whitespace-nowrap mt-1" style={{ fontWeight: 600 }}>{p.currency} {inr(p.price)}</div>
                  </div>
                  <AddToBag product={p} />
                </div>
              ))}
            </div>
          )}

          {/* Other collections */}
          <div className="mt-24 pt-16 border-t border-burgundy-ink/10">
            <div className="text-center mb-10">
              <div className="font-cinzel text-[0.6rem] tracking-[0.3em] text-burgundy-ink/70 mb-2">— EXPLORE MORE</div>
              <h2 className="font-cormorant text-3xl md:text-4xl text-burgundy-ink">Other Collections</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {COLLECTIONS.filter((c) => c.slug !== slug).slice(0, 4).map((c) => (
                <Link key={c.slug} href={`/collections/${c.slug}`} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-3">
                    <img src={c.image} alt={c.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-burgundy-ink/25 group-hover:bg-burgundy-ink/10 transition-colors" />
                    <div className="absolute inset-0 flex items-end justify-center pb-5">
                      <span className="font-cormorant text-xl md:text-2xl text-ivory">{c.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default CollectionPage
