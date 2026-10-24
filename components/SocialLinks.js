'use client'

import { Instagram, Youtube } from 'lucide-react'
import { useStoreConfig } from '@/lib/store-config'

const Pinterest = (props) => (
  <svg viewBox="0 0 24 24" width={props.size || 13} height={props.size || 13} fill="currentColor" className={props.className} aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.3-5.4s-.3-.7-.3-1.6c0-1.5.9-2.6 2-2.6.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.6-.3 1.1.5 2 1.6 2 1.9 0 3.4-2 3.4-4.9 0-2.6-1.9-4.4-4.5-4.4-3.1 0-4.9 2.3-4.9 4.7 0 .9.4 1.9.8 2.5.1.1.1.2.1.3l-.3 1.2c0 .2-.2.3-.4.2-1.4-.6-2.2-2.6-2.2-4.2 0-3.4 2.5-6.6 7.2-6.6 3.8 0 6.7 2.7 6.7 6.3 0 3.7-2.4 6.8-5.6 6.8-1.1 0-2.2-.6-2.5-1.3l-.7 2.6c-.2 1-.9 2.2-1.4 2.9A10 10 0 1 0 12 2z" />
  </svg>
)

/** Shows only the social links that are set in Admin → Settings (no placeholder "#" links). */
export default function SocialLinks({ size = 'w-9 h-9' }) {
  const { config } = useStoreConfig()
  const links = [
    { href: config.instagram, I: Instagram, label: 'Instagram' },
    { href: config.youtube, I: Youtube, label: 'YouTube' },
    { href: config.pinterest, I: Pinterest, label: 'Pinterest' }
  ].filter((l) => l.href)
  if (!links.length) return null
  return (
    <div className="mt-4 flex items-center gap-2" data-testid="social-links">
      {links.map(({ href, I, label }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`ARKADHATRI on ${label}`} className={`${size} border border-gold/40 flex items-center justify-center hover:bg-gold group transition-colors rounded-sm`}>
          <I size={13} strokeWidth={1.3} className="text-gold group-hover:text-burgundy" />
        </a>
      ))}
    </div>
  )
}
