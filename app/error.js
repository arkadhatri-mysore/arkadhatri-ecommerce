'use client'

import { useEffect } from 'react'
import Link from 'next/link'

// App-wide error boundary. A failed page download (ChunkLoadError, usually right after an update)
// silently reloads the page once. Anything else shows a calm, branded message.
const isChunkError = (e) =>
  e?.name === 'ChunkLoadError' || /Loading chunk|Loading CSS chunk|ChunkLoadError/i.test(String(e?.message || ''))

export default function Error({ error, reset }) {
  useEffect(() => {
    if (isChunkError(error) && typeof window !== 'undefined') {
      const k = 'ark:chunk-reload:' + window.location.pathname
      if (!sessionStorage.getItem(k)) {
        sessionStorage.setItem(k, '1')
        window.location.reload()
        return
      }
    }
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-luxury-ivory flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="eyebrow mb-4">— A MOMENT, PLEASE</div>
        <h1 className="font-cormorant text-4xl md:text-5xl text-burgundy-ink mb-4">Something didn&rsquo;t load as it should.</h1>
        <p className="font-cormorant text-lg text-burgundy-ink/70 mb-8">Please try again. If it keeps happening, message us on WhatsApp and we&rsquo;ll help right away.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => { try { sessionStorage.clear() } catch {} ; reset?.(); window.location.reload() }} className="btn-luxury-filled">Try Again</button>
          <Link href="/" className="btn-luxury" style={{ color: '#4A0F1C', borderColor: '#4A0F1C' }}>Back to Shop</Link>
        </div>
      </div>
    </main>
  )
}
