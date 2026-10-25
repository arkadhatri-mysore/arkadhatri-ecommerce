'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { ChevronLeft, MapPin, Instagram, Youtube } from 'lucide-react'
import { getLegalPage, legalSlugs } from '@/lib/legal'

import BrandLogo from '@/components/BrandLogo'
import SocialLinks from '@/components/SocialLinks'
import { useStoreConfig } from '@/lib/store-config'
import { inr } from '@/lib/cart'

// Fills shipping placeholders in policy text from the live store settings
const useFill = () => {
  const { config } = useStoreConfig()
  // WhatsApp: store settings first, then the same env fallback used by the floating button
  const waDigits = String(config.whatsappNumber || '').replace(/\D/g, '')
  const waDisplay = waDigits.length >= 10 ? (config.whatsappDisplay || `+${waDigits}`) : ''
  const fill = (t) => String(t || '')
    .replaceAll('{{FREE_SHIPPING_ABOVE}}', inr(config.freeShippingThreshold))
    .replaceAll('{{SHIPPING_FLAT}}', inr(config.shippingFlat))
    .replaceAll('{{WHATSAPP}}', waDisplay)
  return { fill, waDigits: waDisplay ? waDigits : '' }
}

const LegalPage = () => {
  const { slug } = useParams()
  const { fill, waDigits } = useFill()
  const page = getLegalPage(slug)

  useEffect(() => {
    // title comes from the server layout metadata
  }, [page])

  if (!page) return notFound()

  return (
    <main className="min-h-screen bg-luxury-ivory">
      <header className="sticky top-0 z-40 bg-luxury-ivory/95 backdrop-blur-md border-b border-burgundy-ink/10">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2 text-burgundy-ink hover:text-gold transition-colors group">
            <ChevronLeft size={16} strokeWidth={1.4} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-cinzel text-[0.6rem] tracking-[0.35em]">MAISON</span>
          </Link>
          <Link href="/"><BrandLogo size="md" /></Link>
          <div className="w-16" />
        </div>
      </header>

      <section className="container py-16 md:py-24 max-w-3xl">
        <div className="text-center mb-14">
          <div className="font-cinzel text-[0.62rem] tracking-[0.35em] text-gold mb-4">{page.eyebrow}</div>
          <h1 className="font-cormorant text-4xl md:text-6xl text-burgundy-ink leading-[1.05]">{page.title}</h1>
          {page.updated && <p className="mt-4 font-cormorant italic text-burgundy-ink/60">{page.updated}</p>}
          <div className="gold-line w-16 mx-auto mt-8" />
        </div>

        <article className="space-y-10">
          {page.sections.filter((s) => fill(s.p).trim()).map((s) => (
            <div key={s.h}>
              <h2 className="font-cormorant text-2xl md:text-3xl text-burgundy-ink mb-3">{s.h}</h2>
              {s.wa && waDigits ? (
                <a data-testid="contact-whatsapp" href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener noreferrer" className="font-inter font-light text-burgundy-ink/75 text-[15px] leading-[1.85] underline underline-offset-4 decoration-gold/60 hover:text-gold transition-colors">{fill(s.p)}</a>
              ) : (
                <p className="font-inter font-light text-burgundy-ink/75 text-[15px] leading-[1.85] whitespace-pre-wrap">{fill(s.p)}</p>
              )}
            </div>
          ))}
        </article>

        <div className="mt-16 pt-8 border-t border-burgundy-ink/15 flex flex-wrap gap-x-8 gap-y-2">
          {legalSlugs().filter((s) => s !== slug).map((s) => (
            <Link key={s} href={`/${s}`} className="font-cormorant text-burgundy-ink/70 hover:text-gold transition-colors text-base">
              {getLegalPage(s).title}
            </Link>
          ))}
        </div>
      </section>

      <footer className="bg-burgundy-ink border-t border-gold/15 py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-cinzel text-[0.55rem] tracking-[0.35em] text-warm-grey"><MapPin size={11} strokeWidth={1.3} />KARNATAKA · INDIA</div>
          <div className="font-cormorant italic text-ivory/40 text-sm">© {new Date().getFullYear()} ARKADHATRI</div>
          <SocialLinks size="w-8 h-8" />
        </div>
      </footer>
    </main>
  )
}

export default LegalPage
