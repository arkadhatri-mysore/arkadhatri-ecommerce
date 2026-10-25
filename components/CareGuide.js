'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, Sparkles } from 'lucide-react'
import { careGuideFor } from '@/lib/care-guide'

/**
 * Care & Draping guide shown on every product page.
 * Care tips follow the saree's fabric (or the custom tips set in Admin);
 * draping steps are the same for every saree.
 */
const CareGuide = ({ product }) => {
  const g = careGuideFor(product)
  const [tab, setTab] = useState('care')
  const tabs = [
    { k: 'care', label: 'Caring for it', icon: Droplets },
    { k: 'drape', label: 'How to drape', icon: Sparkles }
  ]

  return (
    <section id="care-guide" data-testid="care-guide" className="mt-16 md:mt-20 border-y border-burgundy-ink/10 py-14 md:py-16">
      <div className="text-center mb-8 md:mb-10">
        <div className="eyebrow mb-3" style={{ color: '#A48246' }}>— THE SAREE GUIDE</div>
        <h2 className="font-cormorant text-3xl md:text-5xl text-burgundy-ink">Care &amp; Draping</h2>
        <p className="mt-3 font-cormorant italic text-lg text-burgundy-ink/60 max-w-xl mx-auto">
          So that {product.name} looks the way it did the day it arrived, for years to come.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex border border-burgundy-ink/15 rounded-sm p-1 bg-white/60">
          {tabs.map((t) => (
            <button
              key={t.k}
              data-testid={`care-tab-${t.k}`}
              onClick={() => setTab(t.k)}
              className={`relative flex items-center gap-2 px-4 md:px-6 h-11 font-cinzel text-[0.58rem] md:text-[0.62rem] tracking-[0.28em] uppercase rounded-sm transition-colors ${tab === t.k ? 'text-ivory' : 'text-burgundy-ink/70 hover:text-gold'}`}
            >
              {tab === t.k && (
                <motion.span layoutId="careTabBg" className="absolute inset-0 bg-burgundy-ink rounded-sm" transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} />
              )}
              <t.icon size={13} strokeWidth={1.5} className="relative z-10" />
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'care' ? (
          <motion.div
            key="care"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="max-w-4xl mx-auto grid md:grid-cols-[260px_1fr] gap-8 md:gap-12"
            data-testid="care-panel"
          >
            <div>
              <div className="font-cinzel text-[0.55rem] tracking-[0.32em] uppercase text-gold mb-2">Fabric</div>
              <div className="font-cormorant text-3xl text-burgundy-ink leading-tight">{g.title}</div>
              <div className="gold-line w-12 my-5" />
              <p className="font-cormorant italic text-lg text-burgundy-ink/70 leading-relaxed">{g.intro}</p>
            </div>
            <ol className="space-y-4">
              {g.tips.map((tip, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="shrink-0 w-7 h-7 rounded-full border border-gold/60 flex items-center justify-center font-cinzel text-[0.6rem] text-gold mt-0.5">{i + 1}</span>
                  <p className="font-cormorant text-lg text-burgundy-ink/85 leading-[1.6]">{tip}</p>
                </li>
              ))}
            </ol>
          </motion.div>
        ) : (
          <motion.div
            key="drape"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="max-w-5xl mx-auto"
            data-testid="drape-panel"
          >
            <p className="text-center font-cinzel text-[0.55rem] tracking-[0.32em] uppercase text-burgundy-ink/60 mb-8">The classic Nivi drape · about 10 minutes</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {g.steps.map((s, i) => (
                <div key={s.t} className="border border-burgundy-ink/10 bg-white/50 rounded-sm p-6 hover:border-gold/50 transition-colors">
                  <div className="font-cormorant text-4xl text-gold/80 leading-none mb-3">{String(i + 1).padStart(2, '0')}</div>
                  <div className="font-cinzel text-[0.62rem] tracking-[0.28em] uppercase text-burgundy-ink mb-2">{s.t}</div>
                  <p className="font-cormorant text-base md:text-lg text-burgundy-ink/75 leading-[1.55]">{s.d}</p>
                </div>
              ))}
            </div>
            {g.drapingNote && (
              <div data-testid="draping-note" className="mt-8 max-w-3xl mx-auto border-l-2 border-gold bg-gold/5 px-6 py-5">
                <div className="font-cinzel text-[0.55rem] tracking-[0.32em] uppercase text-gold mb-1.5">A note for {product.name}</div>
                <p className="font-cormorant italic text-lg text-burgundy-ink/85 leading-relaxed">{g.drapingNote}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default CareGuide
