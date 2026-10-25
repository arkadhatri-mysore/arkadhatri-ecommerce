'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import ProductCard from '@/components/ProductCard'
import { useCatalog } from '@/lib/catalog'
import { useStoreConfig } from '@/lib/store-config'
import { responsive } from '@/lib/img'

// Placeholder photography (existing images). Owner can replace the hero photo in Admin → Settings → Homepage.
const IMG = {
  hero: 'https://images.unsplash.com/photo-1619516388835-2b60acc4049e?auto=format&fit=crop&w=1400&q=80',
  story: 'https://images.unsplash.com/photo-1783864424950-ccca6d6d52aa?auto=format&fit=crop&w=1400&q=80'
}
const COLLECTIONS = [
  { title: 'Silk Sarees', tag: 'The signature weave', href: '/collections/silk-sarees', img: 'https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?auto=format&fit=crop&w=1200&q=80', pos: 'object-[50%_30%]' },
  { title: 'Wedding Sarees', tag: 'For the bride', href: '/collections/wedding-sarees', img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80', pos: 'object-[50%_25%]' },
  { title: 'Festival Sarees', tag: 'Occasion silks', href: '/collections/festival-sarees', img: 'https://images.unsplash.com/flagged/photo-1551854716-8b811be39e7e?auto=format&fit=crop&w=1200&q=80', pos: 'object-[50%_35%]' },
  { title: 'Everyday Elegance', tag: 'Easy to wear', href: '/collections/everyday-elegance', img: 'https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?auto=format&fit=crop&w=1200&q=80', pos: 'object-[50%_30%]' },
  { title: 'New Arrivals', tag: 'Just in', href: '/collections/new-arrivals', img: 'https://images.unsplash.com/photo-1742287721821-ddf522b3f37b?auto=format&fit=crop&w=1200&q=80', pos: 'object-[50%_25%]' }
]

const DEFAULTS = {
  heroHeadline: 'South Indian silk sarees, chosen with care.',
  heroSubtitle: 'Kanjivaram, Mysore and festive silks from Karnataka — curated for weddings, celebrations and the quiet days in between.',
  heroCtaLabel: 'Shop Sarees',
  storyTitle: 'A small boutique with a considered eye.',
  storyText: 'ARKADHATRI began in Karnataka with a simple idea: offer a short, carefully chosen edit of South Indian sarees instead of an endless catalogue. Every piece is selected and checked by us before it is dispatched, and we are always a message away on WhatsApp if you would like more photos, draping advice or help choosing.'
}

const Hero = ({ cfg }) => {
  const headline = cfg.heroHeadline || DEFAULTS.heroHeadline
  const subtitle = cfg.heroSubtitle || DEFAULTS.heroSubtitle
  const cta = cfg.heroCtaLabel || DEFAULTS.heroCtaLabel
  const img = responsive(cfg.heroImage || IMG.hero, [600, 900, 1200, 1600], 1200)
  return (
    <section id="top" className="on-light bg-luxury-ivory">
      <div className="container grid md:grid-cols-[1.05fr_1fr] gap-8 md:gap-12 lg:gap-20 items-center py-8 md:py-14 lg:py-20">
        <div className="order-1 max-w-xl">
          <p className="eyebrow mb-4 md:mb-6">South Indian Sarees · Karnataka</p>
          <h1 data-testid="hero-headline" className="font-cormorant text-[2.6rem] leading-[1.04] sm:text-6xl lg:text-7xl text-burgundy-ink" style={{ fontWeight: 500 }}>{headline}</h1>
          <p data-testid="hero-subtitle" className="mt-5 md:mt-7 font-inter text-base md:text-lg leading-relaxed text-burgundy-ink/80 max-w-lg">{subtitle}</p>
          <div className="mt-7 md:mt-9 flex flex-wrap items-center gap-3">
            <Link href="/collections/silk-sarees" data-testid="hero-cta" className="inline-flex items-center justify-center gap-2 min-h-12 px-7 bg-burgundy-ink text-ivory font-inter text-sm tracking-[0.14em] uppercase rounded-sm hover:bg-burgundy transition-colors">
              {cta} <ArrowRight size={16} strokeWidth={1.6} />
            </Link>
            <Link href="/collections/new-arrivals" className="inline-flex items-center min-h-12 px-4 font-inter text-sm tracking-[0.14em] uppercase text-burgundy-ink underline underline-offset-[6px] decoration-gold hover:text-gold-dark">New arrivals</Link>
          </div>
        </div>
        <div className="order-2 relative isolate">
          <div className="relative z-10 aspect-[4/5] md:aspect-[4/5] max-h-[78vh] w-full overflow-hidden rounded-sm bg-burgundy-ink/5">
            <img src={img.src} srcSet={img.srcSet} sizes="(min-width:768px) 48vw, 100vw" alt="A woman wearing a deep red South Indian silk saree with gold zari border"
              width="1200" height="1500" fetchPriority="high" loading="eager" decoding="async" className="absolute inset-0 w-full h-full object-cover object-[50%_20%]" />
          </div>
          <div aria-hidden="true" className="hidden md:block absolute -bottom-5 -left-5 w-28 h-28 border border-gold/60 rounded-sm -z-0" />
        </div>
      </div>
    </section>
  )
}

const Collections = () => (
  <section id="collections" className="on-light bg-white/60 py-16 md:py-24 border-y border-burgundy-ink/10">
    <div className="container">
      <div className="flex items-end justify-between gap-4 mb-8 md:mb-12">
        <div>
          <p className="eyebrow mb-3">Collections</p>
          <h2 className="font-cormorant text-4xl md:text-5xl text-burgundy-ink">Shop by occasion</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-5">
        {COLLECTIONS.map((c, i) => {
          const img = responsive(c.img, [360, 600, 900, 1200], 700)
          const wide = i < 2
          return (
            <Link key={c.title} href={c.href} className={`group relative overflow-hidden rounded-sm bg-burgundy-ink/10 ${wide ? 'col-span-2 md:col-span-3 aspect-[16/10]' : 'col-span-1 md:col-span-2 aspect-[3/4]'} ${i === 4 ? 'col-span-2 md:col-span-2 aspect-[16/10] md:aspect-[3/4]' : ''}`}>
              <img src={img.src} srcSet={img.srcSet} sizes={wide ? '(min-width:768px) 50vw, 100vw' : '(min-width:768px) 33vw, 50vw'} alt={`${c.title} collection`} loading="lazy" decoding="async" width="900" height="1200"
                className={`absolute inset-0 w-full h-full object-cover ${c.pos} transition-transform duration-700 group-hover:scale-[1.04]`} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2A0D14]/80 via-[#2A0D14]/15 to-transparent" />
              <div className="absolute left-4 right-4 bottom-4 md:left-6 md:bottom-6">
                <p className="font-inter text-[0.7rem] tracking-[0.2em] uppercase text-[#E8D9B8]">{c.tag}</p>
                <h3 className="mt-1 font-cormorant text-2xl md:text-3xl text-ivory">{c.title}</h3>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  </section>
)

const Featured = () => {
  const { products, loading } = useCatalog()
  const list = products.slice(0, 8)
  return (
    <section id="featured" className="on-light bg-luxury-ivory py-16 md:py-24">
      <div className="container">
        <div className="flex items-end justify-between gap-4 mb-8 md:mb-12">
          <div>
            <p className="eyebrow mb-3">The current edit</p>
            <h2 className="font-cormorant text-4xl md:text-5xl text-burgundy-ink">Signature sarees</h2>
          </div>
          <Link href="/collections/silk-sarees" className="hidden sm:inline-flex items-center gap-2 min-h-11 font-inter text-sm tracking-[0.12em] uppercase text-burgundy-ink hover:text-gold-dark">View all <ArrowRight size={15} /></Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
          {loading && [0, 1, 2, 3].map((i) => <div key={i} className="aspect-[3/4] bg-burgundy-ink/5 rounded-sm animate-pulse" />)}
          {list.map((p, i) => <ProductCard key={p.slug} p={p} priority={i < 2} />)}
        </div>
        <div className="mt-12 text-center sm:hidden">
          <Link href="/collections/silk-sarees" className="inline-flex items-center gap-2 min-h-12 px-6 border border-burgundy-ink text-burgundy-ink font-inter text-sm tracking-[0.12em] uppercase rounded-sm">View all sarees</Link>
        </div>
      </div>
    </section>
  )
}

const Story = ({ cfg }) => {
  const img = responsive(IMG.story, [500, 800, 1100], 900)
  return (
    <section id="story" className="bg-burgundy-ink text-ivory py-16 md:py-24">
      <div className="container grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="relative aspect-[4/5] max-w-md w-full mx-auto md:mx-0 overflow-hidden rounded-sm bg-ivory/5">
          <img src={img.src} srcSet={img.srcSet} sizes="(min-width:768px) 40vw, 100vw" alt="Detail of South Indian temple jewellery worn with a silk saree" loading="lazy" decoding="async" width="900" height="1125" className="absolute inset-0 w-full h-full object-cover object-[50%_40%]" />
        </div>
        <div className="max-w-xl">
          <p className="font-inter text-[0.75rem] tracking-[0.24em] uppercase text-gold mb-4">Our story</p>
          <h2 data-testid="story-title" className="font-cormorant text-4xl md:text-5xl leading-tight">{cfg.storyTitle || DEFAULTS.storyTitle}</h2>
          <p data-testid="story-text" className="mt-6 font-inter text-base md:text-[17px] leading-[1.8] text-ivory/80 whitespace-pre-line">{cfg.storyText || DEFAULTS.storyText}</p>
          <Link href="/contact" className="mt-8 inline-flex items-center gap-2 min-h-12 px-6 border border-gold text-ivory font-inter text-sm tracking-[0.12em] uppercase rounded-sm hover:bg-gold hover:text-burgundy-ink transition-colors">Talk to us <ArrowRight size={15} /></Link>
        </div>
      </div>
    </section>
  )
}

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    if (!email) return
    try { await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }) } catch {}
    setSent(true)
  }
  return (
    <section className="on-light bg-luxury-ivory py-16 md:py-20">
      <div className="container max-w-2xl text-center">
        <h2 className="font-cormorant text-3xl md:text-4xl text-burgundy-ink">Hear about new arrivals first</h2>
        <p className="mt-3 font-inter text-[15px] text-burgundy-ink/75">An occasional email when new sarees arrive. Unsubscribe any time.</p>
        <form onSubmit={submit} className="mt-7 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <label htmlFor="nl-email" className="sr-only">Email address</label>
          <input id="nl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
            className="flex-1 min-h-12 bg-white border border-burgundy-ink/25 focus:border-burgundy-ink px-4 outline-none text-burgundy-ink font-inter rounded-sm" />
          <button type="submit" className="min-h-12 px-7 bg-burgundy-ink text-ivory font-inter text-sm tracking-[0.12em] uppercase rounded-sm hover:bg-burgundy">{sent ? 'Subscribed' : 'Subscribe'}</button>
        </form>
        {sent && <p className="mt-3 font-inter text-sm text-burgundy-ink/80" role="status">Thank you — you are on the list.</p>}
      </div>
    </section>
  )
}

const App = () => {
  const { config } = useStoreConfig()
  return (
    <div className="bg-luxury-ivory min-h-screen">
      <SiteHeader />
      <main id="main">
        <Hero cfg={config} />
        <Collections />
        <Featured />
        <Story cfg={config} />
        <Newsletter />
      </main>
      <SiteFooter />
    </div>
  )
}

export default App
