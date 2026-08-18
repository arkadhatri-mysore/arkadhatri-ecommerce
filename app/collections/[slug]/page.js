'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ShoppingBag, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { getCollection, getProductsByCollection, getFilterOptions, COLLECTIONS } from '@/lib/products'
import { cart } from '@/lib/cart'
import ProductCard from '@/components/ProductCard'
import TrustStrip from '@/components/TrustStrip'

import { LOGO_URL } from '@/lib/brand'

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

const SORT_OPTIONS = [
  { key: 'featured',    label: 'Featured' },
  { key: 'newest',      label: 'Newest' },
  { key: 'price-asc',   label: 'Price: Low to High' },
  { key: 'price-desc',  label: 'Price: High to Low' },
  { key: 'bestselling', label: 'Best Selling' }
]

const Chip = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-3 py-1.5 rounded-full font-cinzel text-[0.55rem] tracking-[0.28em] uppercase transition-all border ${active ? 'bg-burgundy-ink text-ivory border-burgundy-ink' : 'bg-transparent text-burgundy-ink border-burgundy-ink/25 hover:border-burgundy-ink'}`}>
    {children}
  </button>
)

const FilterGroup = ({ title, options, active, onToggle }) => {
  if (!options?.length) return null
  return (
    <div>
      <div className="font-cinzel text-[0.55rem] tracking-[0.32em] text-burgundy-ink/80 mb-3">{title}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o} active={active.includes(o)} onClick={() => onToggle(o)}>{o}</Chip>
        ))}
      </div>
    </div>
  )
}

const PriceGroup = ({ range, setRange }) => {
  const bands = [
    { label: 'Under ₹ 20,000',        min: 0,     max: 20000  },
    { label: '₹ 20,000 – ₹ 30,000',  min: 20000, max: 30000  },
    { label: '₹ 30,000 – ₹ 45,000',  min: 30000, max: 45000  },
    { label: 'Above ₹ 45,000',        min: 45000, max: 999999 }
  ]
  return (
    <div>
      <div className="font-cinzel text-[0.55rem] tracking-[0.32em] text-burgundy-ink/80 mb-3">PRICE</div>
      <div className="flex flex-wrap gap-2">
        {bands.map((b) => {
          const active = range?.min === b.min && range?.max === b.max
          return <Chip key={b.label} active={active} onClick={() => setRange(active ? null : b)}>{b.label}</Chip>
        })}
      </div>
    </div>
  )
}

const CollectionPage = () => {
  const { slug } = useParams()
  const collection = getCollection(slug)
  const base = getProductsByCollection(slug)

  useEffect(() => { if (collection) document.title = `${collection.name} \u2014 ARKADHATRI` }, [collection])

  // Filter & sort state
  const [fabrics,   setFabrics]   = useState([])
  const [colours,   setColours]   = useState([])
  const [occasions, setOccasions] = useState([])
  const [availability, setAvailability] = useState([])
  const [priceRange, setPriceRange] = useState(null)
  const [sort, setSort] = useState('featured')
  const [showFilters, setShowFilters] = useState(false)

  const opts = useMemo(() => getFilterOptions(base), [base])
  const toggle = (list, setList, v) => setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  const clearAll = () => { setFabrics([]); setColours([]); setOccasions([]); setAvailability([]); setPriceRange(null); setSort('featured') }
  const activeFilterCount = fabrics.length + colours.length + occasions.length + availability.length + (priceRange ? 1 : 0)

  const filtered = useMemo(() => {
    let r = [...base]
    if (fabrics.length)   r = r.filter((p) => fabrics.includes(p.fabricType))
    if (colours.length)   r = r.filter((p) => colours.includes(p.colourFamily))
    if (occasions.length) r = r.filter((p) => p.occasion?.some((o) => occasions.includes(o)))
    if (availability.includes('In Stock'))      r = r.filter((p) => p.inStock)
    if (availability.includes('New Arrivals'))  r = r.filter((p) => p.isNew)
    if (availability.includes('Bestsellers'))   r = r.filter((p) => p.isBestseller)
    if (priceRange) r = r.filter((p) => p.price >= priceRange.min && p.price < priceRange.max)
    switch (sort) {
      case 'newest':      r.sort((a, b) => Number(b.isNew) - Number(a.isNew)); break
      case 'price-asc':   r.sort((a, b) => a.price - b.price); break
      case 'price-desc':  r.sort((a, b) => b.price - a.price); break
      case 'bestselling': r.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller)); break
      default: r.sort((a, b) => (Number(b.isBestseller) + Number(b.isNew)) - (Number(a.isBestseller) + Number(a.isNew)))
    }
    return r
  }, [base, fabrics, colours, occasions, availability, priceRange, sort])

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
      {/* Breadcrumb schema */}
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
        <div className="relative container py-20 md:py-28 text-center">
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

      {/* Collection editorial (only for craft-heavy collections) */}
      {['silk-sarees','wedding-sarees','festival-sarees'].includes(slug) && (
        <section className="bg-luxury-ivory py-14 md:py-20 border-b border-burgundy-ink/5">
          <div className="container grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <div className="font-cinzel text-[0.6rem] tracking-[0.35em] uppercase text-gold mb-4">— THE STORY BEHIND THE WEAVE</div>
              <h2 className="font-cormorant text-3xl md:text-4xl text-burgundy-ink leading-[1.15]">
                {slug === 'wedding-sarees' && 'Woven for the days that stay in memory.'}
                {slug === 'silk-sarees' && 'The signature weave of the South.'}
                {slug === 'festival-sarees' && 'For the temple, the deepam and the family.'}
              </h2>
              <div className="h-px w-16 bg-gold my-6" />
              <p className="font-cormorant text-lg text-burgundy-ink/75 leading-[1.65] max-w-lg">
                {slug === 'wedding-sarees' && 'Kanjivaram silks composed on pit-looms in Kancheepuram, each carrying temple motifs, kaasu maalai borders and hand-inlaid zari — the saree becomes an heirloom the moment it is worn.'}
                {slug === 'silk-sarees' && 'From the mulberry silk of Mysuru to the twist-yarn tradition of Kancheepuram — every ARKADHATRI silk is chosen for weight, drape and quiet character.'}
                {slug === 'festival-sarees' && 'Refined silks with slim antique-gold borders and hand-inlaid zari — composed for Diwali evenings, Ugadi mornings, and every temple visit in between.'}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { t: 'REGION',  n: slug === 'wedding-sarees' ? 'Kancheepuram' : 'Mysuru · Karnataka', img: 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=600&q=85' },
                { t: 'FABRIC',  n: 'Pure Mulberry Silk',            img: 'https://images.unsplash.com/photo-1612380635121-411eda9ecbb9?auto=format&fit=crop&w=600&q=85' },
                { t: 'DETAIL',  n: 'Zari · Temple Border',          img: 'https://images.unsplash.com/photo-1630663124437-382b3831e7d8?auto=format&fit=crop&w=600&q=85' }
              ].map((s) => (
                <div key={s.t} className="relative aspect-[3/4] overflow-hidden rounded-sm group">
                  <img src={s.img} alt={s.n} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-b from-burgundy-ink/10 via-transparent to-burgundy-ink/80" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="font-cinzel text-[0.5rem] tracking-[0.3em] text-gold">{s.t}</div>
                    <div className="font-cormorant text-ivory text-sm mt-0.5 leading-tight">{s.n}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filter bar */}
      <div className="sticky top-[68px] z-30 bg-luxury-ivory/95 backdrop-blur-md border-b border-burgundy-ink/10">
        <div className="container flex items-center justify-between py-3 gap-4">
          <button onClick={() => setShowFilters((v) => !v)} className="flex items-center gap-2 font-cinzel text-[0.6rem] tracking-[0.32em] uppercase text-burgundy-ink hover:text-gold transition-colors">
            <SlidersHorizontal size={14} strokeWidth={1.4} />
            <span>Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
          </button>
          <div className="font-cormorant italic text-burgundy-ink/60 text-sm hidden md:block">{filtered.length} of {base.length} pieces</div>
          <label className="relative flex items-center gap-2">
            <span className="hidden md:inline font-cinzel text-[0.55rem] tracking-[0.3em] uppercase text-burgundy-ink/70">SORT</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none bg-transparent border border-burgundy-ink/20 rounded-sm py-1.5 pl-3 pr-8 font-cormorant text-sm text-burgundy-ink focus:border-gold focus:outline-none">
              {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            <ChevronDown size={12} strokeWidth={1.4} className="absolute right-2 pointer-events-none text-burgundy-ink/60" />
          </label>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="container py-6 border-t border-burgundy-ink/10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FilterGroup title="FABRIC"       options={opts.fabrics}                            active={fabrics}   onToggle={(v) => toggle(fabrics,   setFabrics,   v)} />
                <FilterGroup title="COLOUR"       options={opts.colours}                            active={colours}   onToggle={(v) => toggle(colours,   setColours,   v)} />
                <FilterGroup title="OCCASION"     options={opts.occasions}                          active={occasions} onToggle={(v) => toggle(occasions, setOccasions, v)} />
                <FilterGroup title="AVAILABILITY" options={['In Stock', 'New Arrivals', 'Bestsellers']} active={availability} onToggle={(v) => toggle(availability, setAvailability, v)} />
                <PriceGroup range={priceRange} setRange={setPriceRange} />
              </div>
              {activeFilterCount > 0 && (
                <div className="container pb-5 flex justify-end">
                  <button onClick={clearAll} className="font-cinzel text-[0.55rem] tracking-[0.3em] uppercase text-burgundy-ink/70 hover:text-gold transition-colors underline underline-offset-4">Clear all filters</button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid */}
      <section className="py-14 md:py-20">
        <div className="container">
          {filtered.length === 0 ? (
            <div className="py-16 md:py-24 text-center max-w-xl mx-auto">
              <div className="eyebrow mb-4">— CURATING</div>
              <h2 className="font-cormorant text-3xl md:text-4xl text-burgundy-ink mb-4 leading-tight">
                We&rsquo;re curating more beautiful sarees for this collection.
              </h2>
              <p className="font-cormorant italic text-burgundy-ink/60 text-lg mb-8">
                {activeFilterCount > 0 ? 'Try relaxing your filters or explore the wider curation.' : 'New pieces arrive at the atelier every few weeks.'}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                {activeFilterCount > 0 && <button onClick={clearAll} className="btn-luxury">Clear Filters</button>}
                <Link href="/#featured" className="btn-luxury-filled">Explore All Sarees</Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {filtered.map((p) => <ProductCard key={p.sku} p={p} variant="ivory" />)}
            </div>
          )}
        </div>
      </section>

      {/* Trust strip */}
      <TrustStrip variant="ivory" />

      {/* Other collections */}
      <section className="py-16 md:py-20">
        <div className="container">
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
      </section>
    </main>
  )
}

export default CollectionPage
