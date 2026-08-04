'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, X, ArrowRight } from 'lucide-react'
import { searchProducts, COLLECTIONS } from '@/lib/products'
import { inr } from '@/lib/cart'

const SUGGESTIONS = ['Kanjivaram', 'Mysore Silk', 'Wedding', 'Bridal Red', 'Festival', 'Bhavana', 'Meenakshi']

const SearchOverlay = ({ open, onClose }) => {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
    else { setQ(''); setResults([]) }
  }, [open])

  useEffect(() => { setResults(searchProducts(q)) }, [q])

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[80] bg-burgundy-ink/98 backdrop-blur-md overflow-y-auto"
        >
          <div className="container pt-8 md:pt-12 pb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="font-cinzel text-[0.62rem] tracking-[0.35em] text-gold">— SEARCH THE BOUTIQUE</div>
              <button onClick={onClose} className="text-ivory hover:text-gold transition-colors flex items-center gap-2" aria-label="Close search">
                <span className="font-cinzel text-[0.6rem] tracking-[0.35em]">CLOSE</span>
                <X size={20} strokeWidth={1.3} />
              </button>
            </div>

            <div className="relative max-w-3xl mx-auto">
              <SearchIcon size={22} strokeWidth={1.3} className="absolute left-0 top-4 text-gold" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, fabric, colour, occasion or SKU"
                className="w-full bg-transparent border-b-2 border-gold/40 focus:border-gold outline-none py-4 pl-10 pr-4 font-cormorant text-2xl md:text-3xl text-ivory placeholder:text-ivory/30 italic"
              />
            </div>

            <div className="max-w-3xl mx-auto mt-8">
              {/* Suggestions */}
              {!q && (
                <div>
                  <div className="font-cinzel text-[0.55rem] tracking-[0.35em] text-warm-grey mb-4">POPULAR SEARCHES</div>
                  <div className="flex flex-wrap gap-2 mb-10">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => setQ(s)} className="px-4 py-2 border border-gold/40 rounded-full font-cinzel text-[0.55rem] tracking-[0.3em] uppercase text-gold hover:bg-gold hover:text-burgundy-ink transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="font-cinzel text-[0.55rem] tracking-[0.35em] text-warm-grey mb-4">BROWSE COLLECTIONS</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {COLLECTIONS.map((c) => (
                      <Link key={c.slug} href={`/collections/${c.slug}`} onClick={onClose} className="group flex items-center justify-between px-4 py-4 border border-gold/20 rounded-sm hover:border-gold transition-colors">
                        <span className="font-cormorant text-lg text-ivory group-hover:text-gold transition-colors">{c.name}</span>
                        <ArrowRight size={14} strokeWidth={1.3} className="text-gold" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {q && (
                <div>
                  <div className="font-cinzel text-[0.55rem] tracking-[0.35em] text-warm-grey mb-4">
                    {results.length} MATCH{results.length === 1 ? '' : 'ES'}
                  </div>
                  {results.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="font-cormorant italic text-ivory/70 text-xl">No sarees match "{q}". Try a different weave, colour or occasion.</p>
                      <Link href="/" onClick={onClose} className="mt-6 btn-luxury inline-flex">Browse The Boutique</Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {results.map((p) => (
                        <Link
                          key={p.sku}
                          href={`/product/${p.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-4 p-3 hover:bg-burgundy transition-colors rounded-sm group"
                        >
                          <div className="w-16 h-20 shrink-0 overflow-hidden rounded-sm bg-burgundy">
                            <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-cormorant text-lg md:text-xl text-ivory group-hover:text-gold transition-colors">{p.name}</div>
                            <div className="font-inter text-[12px] text-warm-grey mt-0.5">{p.fabricType} · {p.colourName}</div>
                            <div className="font-cinzel text-[0.5rem] tracking-[0.3em] text-gold/70 mt-0.5">{p.sku}</div>
                          </div>
                          <div className="font-cinzel text-sm text-gold whitespace-nowrap">\u20b9 {inr(p.price)}</div>
                          <ArrowRight size={14} strokeWidth={1.3} className="text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SearchOverlay
