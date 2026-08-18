'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// Discreet gold WhatsApp floating button.
// Hidden on /admin routes.
export default function WhatsAppFloat() {
  const path = usePathname() || '/'
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Fade in after a short delay so it doesn't jump above hero animations
    const t = setTimeout(() => setVisible(true), 900)
    return () => clearTimeout(t)
  }, [])

  if (path.startsWith('/admin')) return null

  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918217204324'
  const display = process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || '+91 82172 04324'
  const number = raw.replace(/[^0-9]/g, '')
  const message = encodeURIComponent(
    'Namaste, I would like to enquire about a saree from the ARKADHATRI atelier.'
  )
  const href = `https://wa.me/${number}?text=${message}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ARKADHATRI atelier on WhatsApp ${display}`}
      title={`WhatsApp · ${display}`}
      className={`fixed bottom-5 right-5 md:bottom-7 md:right-7 z-[80] group transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
    >
      <span className="absolute inset-0 rounded-full bg-[#C8A45A]/25 animate-ping" aria-hidden="true" />
      <span
        className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg"
        style={{
          background: 'linear-gradient(140deg, #D6B56D 0%, #C8A45A 50%, #A8853C 100%)',
          boxShadow: '0 12px 30px -8px rgba(74,15,28,0.45), inset 0 1px 0 rgba(255,255,255,0.35)'
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="26"
          height="26"
          fill="#4A0F1C"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="drop-shadow-sm"
        >
          <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .19 5.3.19 11.85a11.7 11.7 0 0 0 1.63 6L0 24l6.31-1.66a11.86 11.86 0 0 0 5.75 1.47h.01c6.55 0 11.87-5.3 11.87-11.85 0-3.17-1.23-6.14-3.42-8.48ZM12.07 21.8h-.01a9.94 9.94 0 0 1-5.06-1.39l-.36-.21-3.75.98 1-3.65-.24-.38a9.85 9.85 0 0 1-1.52-5.3c0-5.45 4.44-9.87 9.9-9.87 2.64 0 5.13 1.03 6.99 2.88a9.79 9.79 0 0 1 2.9 6.99c0 5.45-4.44 9.86-9.9 9.86Zm5.42-7.4c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.66.15-.2.29-.76.95-.94 1.15-.17.19-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48a9 9 0 0 1-1.67-2.05c-.17-.29-.02-.44.13-.59.13-.13.3-.34.44-.51.15-.17.2-.29.3-.48.1-.19.05-.36-.02-.51-.07-.15-.66-1.6-.9-2.19-.24-.58-.48-.5-.66-.51h-.56c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.4 0 1.42 1.03 2.78 1.17 2.97.15.19 2.02 3.09 4.9 4.33.68.29 1.22.47 1.64.6.69.22 1.31.19 1.81.11.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.27-.19-.57-.34Z" />
        </svg>
      </span>

      {/* Hover tooltip */}
      <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="px-3 py-1.5 rounded-sm bg-[#111111] text-[#F7F3EB] font-cinzel text-[0.55rem] tracking-[0.32em]">
          ATELIER · WHATSAPP
        </span>
      </span>
    </a>
  )
}
