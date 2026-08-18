'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Heart, Plus, Minus, ShoppingBag, Truck, RotateCcw, ShieldCheck, MapPin, Instagram, Youtube, Sparkles, Flower2, Award } from 'lucide-react'
import { getProduct, getRelated } from '@/lib/products'
import { cart, inr } from '@/lib/cart'
import TrustStrip from '@/components/TrustStrip'
import LuxuryVideo from '@/components/LuxuryVideo'
import { trackEvent } from '@/components/Analytics'

import { LOGO_URL } from '@/lib/brand'

/* ---------------- Header (dual-theme aware) ---------------- */
const Header = () => {
  const [count, setCount] = useState(0)
  const [pulse, setPulse] = useState(false)
  useEffect(() => {
    setCount(cart.count())
    const sync = () => { setCount(cart.count()); setPulse(true); setTimeout(() => setPulse(false), 600) }
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
        <Link href="/">
          <img src={LOGO_URL} alt="ARKADHATRI" className="h-12 md:h-14 object-contain" />
        </Link>
        <Link href="/cart" className="relative text-burgundy-ink hover:text-gold transition-colors" aria-label="Bag">
          <motion.div animate={pulse ? { scale: [1, 1.18, 1] } : { scale: 1 }} transition={{ duration: 0.6 }}>
            <ShoppingBag size={18} strokeWidth={1.4} />
          </motion.div>
          <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-gold text-burgundy-ink text-[9px] font-cinzel font-semibold">
            <AnimatePresence mode="popLayout">
              <motion.span key={count} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.3 }}>{count}</motion.span>
            </AnimatePresence>
          </span>
        </Link>
      </div>
    </header>
  )
}

/* ---------------- Gallery ---------------- */
const Gallery = ({ images, name }) => {
  const [active, setActive] = useState(0)
  return (
    <div className="grid md:grid-cols-[100px_1fr] gap-4 md:gap-6">
      {/* Thumbnails (vertical on md+, horizontal on mobile — flipped order for mobile) */}
      <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`shrink-0 w-20 md:w-full aspect-[4/5] overflow-hidden rounded-sm border transition-all ${i === active ? 'border-gold ring-1 ring-gold/40' : 'border-burgundy-ink/15 hover:border-burgundy-ink/40'}`}
            aria-label={`Image ${i + 1}`}
          >
            <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
      {/* Main image */}
      <div className="order-1 md:order-2 relative aspect-[4/5] overflow-hidden rounded-sm bg-burgundy-ink/5">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---------------- Add to Bag & Buy Now ---------------- */
const AddToBag = ({ product, variant = 'primary' }) => {
  const router = useRouter()
  const [added, setAdded] = useState(false)
  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 2200)
    return () => clearTimeout(t)
  }, [added])
  const click = (e) => {
    e.preventDefault()
    const evt = {
      value: product.price,
      currency: 'INR',
      items: [{ item_id: product.sku, item_name: product.name, price: product.price, quantity: 1 }]
    }
    if (variant === 'secondary') {
      // Buy Now — add and go to checkout
      cart.add(product)
      trackEvent('add_to_cart', evt)
      router.push('/checkout')
      return
    }
    if (added) return
    cart.add(product)
    trackEvent('add_to_cart', evt)
    setAdded(true)
  }
  const base = 'flex-1 h-14 inline-flex items-center justify-center font-cinzel text-[0.68rem] tracking-[0.28em] uppercase rounded-md transition-all duration-300'
  if (variant === 'primary') {
    return (
      <motion.button
        onClick={click}
        animate={{ backgroundColor: added ? '#4A0F1C' : '#C8A45A', color: '#F7F3EB', borderColor: added ? '#4A0F1C' : '#C8A45A' }}
        transition={{ duration: 0.35 }}
        className={`${base} border-2 font-semibold`}
        style={{ boxShadow: '0 6px 20px -10px rgba(200,164,90,0.4)' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {added ? (
            <motion.span key="a" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12 L10 18 L20 6" stroke="#F7F3EB" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Added to Bag
            </motion.span>
          ) : (
            <motion.span key="b" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.3 }}>
              Add to Bag
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    )
  }
  return (
    <button
      onClick={click}
      className={`${base} border-2 border-burgundy-ink bg-burgundy-ink text-ivory hover:bg-burgundy hover:border-burgundy font-semibold`}
    >
      Buy Now
    </button>
  )
}

/* ---------------- Accordion ---------------- */
const Accordion = ({ items }) => {
  const [open, setOpen] = useState(0)
  return (
    <div className="border-t border-burgundy-ink/15">
      {items.map(([label, body], i) => {
        const isOpen = i === open
        return (
          <div key={label} className="border-b border-burgundy-ink/15">
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="w-full flex items-center justify-between py-5 text-left group"
            >
              <span className="font-cinzel text-[0.65rem] tracking-[0.35em] uppercase text-burgundy-ink group-hover:text-gold transition-colors">{label}</span>
              <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3 }}>
                <Plus size={16} strokeWidth={1.4} className="text-gold" />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 pr-8 font-cormorant text-lg text-burgundy-ink/80 leading-[1.65]">
                    {body}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

/* ---------------- Craft Strip (compact, product-level) ---------------- */
const CraftStrip = ({ product }) => {
  const details = product.details || {}
  const region = product.collection === 'wedding-sarees' || product.fabricType?.includes('Kanjivaram') ? 'Kancheepuram · Tamil Nadu' : 'Mysuru · Karnataka'
  const chips = [
    { i: MapPin,   t: 'REGION',   v: region },
    { i: Flower2,  t: 'FABRIC',   v: product.fabricType || details.Fabric?.split(',')[0] || 'Pure Silk' },
    { i: Sparkles, t: 'DETAIL',   v: (details.Colour?.split(' with ')[1] || 'Antique-gold zari').replace(/\.$/, '') },
    { i: Award,    t: 'OCCASION', v: (product.occasion?.[0] || 'Festive') }
  ]
  return (
    <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
      {chips.map((c) => (
        <div key={c.t} className="border border-burgundy-ink/10 rounded-sm p-4 bg-white/50 hover:border-gold/50 transition-colors">
          <div className="flex items-center gap-2">
            <c.i size={14} strokeWidth={1.4} className="text-gold" />
            <div className="font-cinzel text-[0.5rem] tracking-[0.3em] uppercase text-burgundy-ink/70">{c.t}</div>
          </div>
          <div className="mt-2 font-cormorant text-base leading-snug text-burgundy-ink">{c.v}</div>
        </div>
      ))}
    </div>
  )
}

/* ---------------- Product Video Slot ---------------- */
const ProductVideoSlot = ({ product }) => {
  const src = product.videoUrl
  const poster = product.videoPoster || product.images?.[0]
  // Render only when either a video or a dedicated craft poster is present
  if (!src && !product.videoPoster) return null
  return (
    <section className="mt-14">
      <div className="text-center mb-6">
        <div className="eyebrow mb-3" style={{color:'#C8A45A'}}>— SEE THE SAREE IN MOTION</div>
        <h2 className="font-cormorant text-3xl md:text-4xl text-burgundy-ink">The drape, up close.</h2>
      </div>
      <div className="rounded-sm overflow-hidden border border-burgundy-ink/10 shadow-[0_20px_60px_-30px_rgba(74,15,28,0.4)] max-w-4xl mx-auto">
        <LuxuryVideo src={src} poster={poster} alt={`${product.name} — saree in motion`} ratio="16/9" />
      </div>
    </section>
  )
}

/* ---------------- Related Products (dark burgundy strip) ---------------- */
const Related = ({ items }) => (
  <section className="bg-burgundy py-20 md:py-24 mt-16">
    <div className="container">
      <div className="text-center mb-10">
        <div className="eyebrow mb-3">— YOU MAY ALSO LIKE</div>
        <h2 className="font-cormorant text-3xl md:text-5xl text-ivory">From the same wardrobe</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {items.map((p) => (
          <Link href={`/product/${p.slug}`} key={p.slug} className="group">
            <div className="luxury-card relative aspect-[3/4] mb-3 rounded-sm overflow-hidden">
              <img src={p.images[0]} alt={p.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-cormorant text-xl text-ivory">{p.name}</h3>
                <p className="font-inter font-light text-ivory/60 text-[12px] mt-0.5">{p.tagline}</p>
              </div>
              <div className="font-cinzel text-[0.65rem] tracking-widest text-gold whitespace-nowrap mt-1">{p.currency} {inr(p.price)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
)

/* ---------------- Footer (compact, dark) ---------------- */
const Footer = () => (
  <footer className="bg-burgundy-ink border-t border-gold/15 pt-12 pb-8">
    <div className="container">
      <div className="grid md:grid-cols-4 gap-10 pb-10 border-b border-gold/10">
        <div>
          <img src={LOGO_URL} alt="ARKADHATRI" className="h-16 object-contain" />
          <p className="mt-4 font-cormorant italic text-ivory/60 text-base leading-relaxed max-w-sm">
            A premium South Indian saree boutique.
          </p>
          <div className="mt-4 flex items-center gap-2">
            {[Instagram, Youtube].map((I, i) => (
              <a key={i} href="#" className="w-9 h-9 border border-gold/40 flex items-center justify-center hover:bg-gold group transition-colors rounded-sm">
                <I size={13} strokeWidth={1.3} className="text-gold group-hover:text-burgundy" />
              </a>
            ))}
          </div>
        </div>
        {[
          { t: 'SHOP', l: [
            { name: 'Silk Sarees', href: '/#collections' },
            { name: 'Wedding Sarees', href: '/#collections' },
            { name: 'Festival Sarees', href: '/#collections' },
            { name: 'Daily Wear', href: '/#collections' },
            { name: 'New Arrivals', href: '/#collections' }
          ]},
          { t: 'SUPPORT', l: [
            { name: 'Shipping', href: '#' }, { name: 'Returns', href: '#' },
            { name: 'Wash Care', href: '#' }, { name: 'Track Order', href: '#' }
          ]},
          { t: 'BOUTIQUE', l: [
            { name: 'About', href: '/#story' }, { name: 'Contact', href: '/#contact' }
          ]}
        ].map((col) => (
          <div key={col.t}>
            <div className="eyebrow mb-4">— {col.t}</div>
            <ul className="space-y-2">
              {col.l.map((it) => (
                <li key={it.name}><a href={it.href} className="font-cormorant text-ivory/70 hover:text-gold transition-colors text-base">{it.name}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 eyebrow"><MapPin size={11} strokeWidth={1.3} /><span>KARNATAKA · INDIA</span></div>
        <div className="font-cormorant italic text-ivory/40 text-sm">© MMXXV ARKADHATRI · All rights reserved.</div>
      </div>
    </div>
  </footer>
)

/* ---------------- Trust strip ---------------- */
const Trust = () => (
  <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t border-burgundy-ink/15">
    {[
      { i: Truck,       t: 'Free Karnataka Delivery' },
      { i: RotateCcw,   t: 'Easy 7-Day Returns' },
      { i: ShieldCheck, t: 'Authenticity Assured' }
    ].map((x) => (
      <div key={x.t} className="flex flex-col items-center text-center gap-2">
        <x.i size={20} strokeWidth={1.3} className="text-gold" />
        <div className="font-cinzel text-[0.55rem] tracking-[0.3em] uppercase text-burgundy-ink/80 leading-tight">{x.t}</div>
      </div>
    ))}
  </div>
)

/* ---------------- Page ---------------- */
const ProductPage = () => {
  const params = useParams()
  const slug = params?.slug
  const product = getProduct(slug)
  const related = getRelated(slug, 4)

  useEffect(() => {
    if (product) {
      document.title = product.seoTitle || `${product.name} — ARKADHATRI`
      // Analytics: view_item
      trackEvent('view_item', {
        currency: 'INR',
        value: product.price,
        items: [{ item_id: product.sku, item_name: product.name, price: product.price, item_category: product.collectionName, quantity: 1 }]
      })
    }
  }, [product])

  if (!product) {
    return (
      <main className="min-h-screen bg-luxury-ivory">
        <Header />
        <div className="container py-32 text-center">
          <div className="eyebrow mb-4">— NOT FOUND</div>
          <h1 className="font-cormorant text-4xl text-burgundy-ink mb-6">This saree is no longer in the atelier.</h1>
          <Link href="/" className="btn-luxury-filled inline-flex">Return to Shop</Link>
        </div>
      </main>
    )
  }

  const site = process.env.NEXT_PUBLIC_BASE_URL || 'https://arkadhatri.com'
  const productSchema = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: product.name, sku: product.sku,
    description: product.seoDescription || product.description,
    image: product.images,
    brand: { '@type': 'Brand', name: 'ARKADHATRI' },
    offers: {
      '@type': 'Offer', priceCurrency: 'INR', price: product.price,
      availability: 'https://schema.org/InStock',
      url: `${site}/product/${product.slug}`
    }
  }
  const crumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site + '/' },
      { '@type': 'ListItem', position: 2, name: product.collectionName, item: `${site}/collections/${product.collection}` },
      { '@type': 'ListItem', position: 3, name: product.name }
    ]
  }

  return (
    <main className="min-h-screen bg-luxury-ivory">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <Header />

      <div className="container py-8 md:py-14">
        {/* Breadcrumb */}
        <nav className="text-[0.62rem] tracking-[0.3em] uppercase font-cinzel text-burgundy-ink/60 mb-8 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-gold transition-colors">HOME</Link>
          <ChevronRight size={11} strokeWidth={1.3} />
          <Link href="/#collections" className="hover:text-gold transition-colors">{product.collection.toUpperCase()}</Link>
          <ChevronRight size={11} strokeWidth={1.3} />
          <span className="text-gold">{product.name.toUpperCase()}</span>
        </nav>

        {/* Main product grid */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 lg:gap-20 items-start">
          {/* Left: gallery */}
          <div>
            <Gallery images={product.images} name={product.name} />
          </div>

          {/* Right: details */}
          <div className="md:sticky md:top-24">
            <div className="eyebrow mb-3">— {product.collection.toUpperCase()}</div>
            <h1 className="font-cormorant text-4xl md:text-5xl lg:text-6xl text-burgundy-ink leading-[1.02]">
              {product.name}
            </h1>
            <p className="mt-3 font-cormorant italic text-xl text-burgundy-ink/70">{product.tagline}</p>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-cinzel text-2xl md:text-3xl text-burgundy-ink" style={{ fontWeight: 600 }}>
                {product.currency} {inr(product.price)}
              </span>
              <span className="font-cormorant italic text-burgundy-ink/50 text-sm">inclusive of all taxes</span>
            </div>

            <div className="gold-line w-16 my-8" />

            <p className="font-cormorant text-lg md:text-xl text-burgundy-ink/80 leading-[1.6] max-w-lg">
              {product.description}
            </p>

            {/* Actions */}
            <div className="mt-10 flex items-stretch gap-3">
              <AddToBag product={product} variant="primary" />
              <AddToBag product={product} variant="secondary" />
            </div>
            <button className="mt-4 flex items-center gap-2 font-cinzel text-[0.6rem] tracking-[0.35em] uppercase text-burgundy-ink/70 hover:text-gold transition-colors">
              <Heart size={14} strokeWidth={1.4} />
              Add to Wishlist
            </button>

            <Trust />

            {/* Craft strip: region · fabric · detail · occasion */}
            <CraftStrip product={product} />

            {/* Accordion */}
            <div className="mt-12">
              <Accordion items={Object.entries(product.details)} />
            </div>
          </div>
        </div>

        {/* Product video slot (renders only if a video URL or dedicated poster is set) */}
        <ProductVideoSlot product={product} />
      </div>

      <Related items={related} />
      <TrustStrip variant="ivory" />
      <Footer />
    </main>
  )
}

export default ProductPage
