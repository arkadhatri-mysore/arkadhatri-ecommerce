import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-luxury-ivory flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="eyebrow mb-4">— 404</div>
        <h1 className="font-cormorant text-4xl md:text-5xl text-burgundy-ink mb-4">This page has drifted away.</h1>
        <p className="font-cormorant text-lg text-burgundy-ink/70 mb-8">The page you were looking for isn&rsquo;t here. Our sarees are.</p>
        <Link href="/" className="btn-luxury-filled">Return to Shop</Link>
      </div>
    </main>
  )
}
