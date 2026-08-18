'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import LuxuryVideo from './LuxuryVideo'

/**
 * CraftJourney — five-step editorial strip for South Indian saree storytelling.
 *   Region → Craft → Fabric → Detail → Saree → Shop
 *
 * Props:
 *   variant   'dark' (default, on burgundy backgrounds) | 'ivory' (on light backgrounds)
 *   compact   boolean — renders a horizontal strip instead of a 5-panel grid
 *   steps     optional override array; falls back to canonical South Indian steps.
 *   shopHref  optional CTA link, default '/#collections'
 *   shopLabel optional CTA label, default 'Shop the Collection'
 *   videoUrl  optional craft video URL for the immersive slot.
 *   posterUrl optional poster image URL used behind the video (or standalone).
 */

const DEFAULT_STEPS = [
  {
    key: 'region',
    tag: '— THE REGION',
    title: 'Karnataka & Tamil Nadu',
    body: 'From the temple towns of Kancheepuram and the silk city of Mysuru — where the loom, the river and the temple share the same breath.',
    img: 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?auto=format&fit=crop&w=1000&q=85'
  },
  {
    key: 'craft',
    tag: '— THE CRAFT',
    title: 'Handwoven, one thread at a time',
    body: 'Each ARKADHATRI saree is composed on a pit-loom by weavers whose families have practised the craft for four to five generations.',
    img: 'https://images.unsplash.com/photo-1623171404570-1d196759fe20?auto=format&fit=crop&w=1000&q=85'
  },
  {
    key: 'fabric',
    tag: '— THE FABRIC',
    title: 'Pure mulberry silk',
    body: 'Only pure mulberry silk, twisted three times for weight and drape. No power looms, no synthetic warp — the saree is a family heirloom in the making.',
    img: 'https://images.unsplash.com/photo-1612380635121-411eda9ecbb9?auto=format&fit=crop&w=1000&q=85'
  },
  {
    key: 'detail',
    tag: '— THE DETAIL',
    title: 'Zari, border, pallu, motif',
    body: 'Temple borders, kaasu maalai motifs and 24k gilded zari — each element carries meaning from a South Indian tradition.',
    img: 'https://images.unsplash.com/photo-1630663124437-382b3831e7d8?auto=format&fit=crop&w=1000&q=85'
  },
  {
    key: 'saree',
    tag: '— THE SAREE',
    title: 'When she wears it',
    body: 'The saree finds its meaning when it is worn — folded, pleated and pinned by the woman it was composed for.',
    img: 'https://images.pexels.com/photos/6487380/pexels-photo-6487380.jpeg?auto=compress&cs=tinysrgb&w=1000'
  }
]

export default function CraftJourney({
  variant = 'dark',
  compact = false,
  steps = DEFAULT_STEPS,
  shopHref = '/#collections',
  shopLabel = 'Shop the Collection',
  eyebrow = '— A JOURNEY THROUGH THE CRAFT',
  heading = 'From loom to living, quietly.',
  intro = 'Every ARKADHATRI saree is a small journey — through a region, a craft, a fabric, and finally a woman who chooses to wear it.',
  videoUrl,
  posterUrl
}) {
  const isDark = variant === 'dark'
  const bg = isDark ? 'bg-[#4A0F1C]' : 'bg-[#F7F3EB]'
  const textHead = isDark ? 'text-[#F7F3EB]' : 'text-[#4A0F1C]'
  const textBody = isDark ? 'text-[#F7F3EB]/70' : 'text-[#4A0F1C]/70'
  const eyebrowClass = isDark ? 'text-[#C8A45A]' : 'text-[#C8A45A]'
  const cardBg = isDark ? 'bg-[#3A0B15]/80 border-[#C8A45A]/15' : 'bg-white/70 border-[#4A0F1C]/10'
  const stepGold = 'text-[#C8A45A]'

  return (
    <section className={`${bg} py-20 md:py-28`}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-14 md:mb-16"
        >
          <div className={`font-cinzel text-[0.6rem] tracking-[0.35em] uppercase ${eyebrowClass} mb-4`}>{eyebrow}</div>
          <h2 className={`font-cormorant text-4xl md:text-5xl ${textHead}`}>{heading}</h2>
          <div className="mx-auto h-px w-20 bg-[#C8A45A] my-6" />
          <p className={`font-cormorant italic text-lg md:text-xl ${textBody}`}>{intro}</p>
        </motion.div>

        {/* Optional cinematic video slot */}
        {(videoUrl || posterUrl) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="mb-14 md:mb-16 rounded-sm overflow-hidden border border-[#C8A45A]/20 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]"
          >
            <LuxuryVideo
              src={videoUrl}
              poster={posterUrl}
              alt="South Indian saree — craft in motion"
              ratio={compact ? '21/9' : '16/9'}
              overlay
            />
          </motion.div>
        )}

        {/* Journey grid */}
        <div className={`grid gap-4 md:gap-6 ${compact ? 'md:grid-cols-3 lg:grid-cols-5' : 'md:grid-cols-2 lg:grid-cols-5'}`}>
          {steps.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className={`relative border ${cardBg} rounded-sm overflow-hidden group`}
            >
              <div className={`${compact ? 'aspect-[4/5]' : 'aspect-[4/5]'} overflow-hidden`}>
                <img src={s.img} alt={s.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-1000" />
              </div>
              <div className="p-5 md:p-6">
                <div className={`font-cinzel text-[0.55rem] tracking-[0.32em] ${stepGold} mb-2 flex items-center gap-2`}>
                  <span>0{i + 1}</span>
                  <span className="h-px w-6 bg-[#C8A45A]/60" />
                  <span>{s.tag.replace('— ', '')}</span>
                </div>
                <h3 className={`font-cormorant text-xl md:text-2xl leading-[1.15] ${textHead}`}>{s.title}</h3>
                <p className={`mt-2 font-cormorant text-[15px] md:text-base leading-[1.55] ${textBody}`}>{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        {shopHref && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mt-14"
          >
            <Link href={shopHref} className={`inline-flex items-center gap-2 font-cinzel text-[0.62rem] tracking-[0.35em] uppercase px-8 py-3.5 rounded-sm border transition-colors ${isDark ? 'text-[#F7F3EB] border-[#C8A45A] hover:bg-[#C8A45A] hover:text-[#4A0F1C]' : 'text-[#4A0F1C] border-[#C8A45A] hover:bg-[#C8A45A]'}`}>
              {shopLabel} <ArrowRight size={13} strokeWidth={1.5} />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
