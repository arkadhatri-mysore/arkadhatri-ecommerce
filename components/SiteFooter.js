'use client'

import Link from 'next/link'
import BrandLogo from '@/components/BrandLogo'
import SocialLinks from '@/components/SocialLinks'
import { COLLECTION_LINKS } from '@/components/SiteHeader'
import { useStoreConfig, waLink } from '@/lib/store-config'
import { ConsentLink } from '@/components/Analytics'

const COLS = [
  { t: 'Shop', l: COLLECTION_LINKS },
  { t: 'Help', l: [
    { name: 'Track Order', href: '/track-order' }, { name: 'Shipping Policy', href: '/shipping-policy' },
    { name: 'Returns & Refunds', href: '/returns' }, { name: 'FAQ', href: '/faq' }, { name: 'Contact', href: '/contact' }
  ] },
  { t: 'Boutique', l: [
    { name: 'Our Story', href: '/#story' }, { name: 'Saved Sarees', href: '/wishlist' },
    { name: 'Privacy Policy', href: '/privacy-policy' }, { name: 'Terms & Conditions', href: '/terms' }
  ] }
]

/** Shared storefront footer (oxblood). Social links show only when set in Admin → Settings. */
const SiteFooter = () => {
  const { config } = useStoreConfig()
  const wa = waLink(config)
  return (
    <footer id="contact" className="bg-burgundy-ink text-ivory pt-16 pb-8">
      <div className="container">
        <div className="grid gap-10 md:grid-cols-12 pb-12 border-b border-ivory/10">
          <div className="md:col-span-4">
            <BrandLogo variant="light" size="md" tagline />
            <p className="mt-6 font-inter text-[15px] leading-relaxed text-ivory/75 max-w-sm">A South Indian saree boutique from Karnataka, curating silk sarees for weddings, festivals and everyday elegance.</p>
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center min-h-11 font-inter text-sm text-ivory underline underline-offset-4 decoration-gold hover:text-gold">Message us on WhatsApp{config.whatsappDisplay ? ` · ${config.whatsappDisplay}` : ''}</a>}
            <SocialLinks />
          </div>
          {COLS.map((c) => (
            <div key={c.t} className="md:col-span-2 lg:col-span-2 md:col-start-auto">
              <h2 className="font-inter text-[0.72rem] tracking-[0.22em] uppercase text-gold mb-4">{c.t}</h2>
              <ul className="space-y-1">
                {c.l.map((x) => (
                  <li key={x.name}><Link href={x.href} className="inline-block py-1.5 font-inter text-[15px] text-ivory/80 hover:text-gold transition-colors">{x.name}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-2 font-inter text-[13px] text-ivory/60">
          <span>Karnataka · India</span>
          <ConsentLink className="underline underline-offset-4 hover:text-gold min-h-11" />
          <span>© {new Date().getFullYear()} ARKADHATRI. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
