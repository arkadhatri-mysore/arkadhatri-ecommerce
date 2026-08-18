'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ShoppingBag, Plus, Minus, X, ShieldCheck, Truck, RotateCcw } from 'lucide-react'
import { cart, inr } from '@/lib/cart'
import CouponBox from '@/components/CouponBox'

const LOGO_URL = 'https://customer-assets-jt897jd0.emergentagent.net/job_timeless-crafted-8/artifacts/xkx14q2d_ARK%20LOGO.jpeg'

const CartPage = () => {
  const [items, setItems] = useState([])
  const [coupon, setCoupon] = useState(null)
  useEffect(() => {
    setItems(cart.get())
    const sync = () => setItems(cart.get())
    window.addEventListener('cart:changed', sync)
    // Restore coupon from session
    try {
      const c = JSON.parse(sessionStorage.getItem('ark_coupon') || 'null')
      if (c) setCoupon(c)
    } catch {}
    return () => window.removeEventListener('cart:changed', sync)
  }, [])

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const shipping = subtotal >= 15000 || subtotal === 0 ? 0 : 250
  // Recompute discount whenever subtotal changes (for percentage coupons)
  const discount = coupon
    ? (coupon.type === 'percentage'
        ? Math.round(subtotal * (Number(coupon.value) / 100))
        : Number(coupon.value) || 0)
    : 0
  const total = Math.max(0, subtotal + shipping - discount)

  const applyCoupon = (c) => {
    const next = { ...c }
    setCoupon(next)
    try { sessionStorage.setItem('ark_coupon', JSON.stringify(next)) } catch {}
  }
  const removeCoupon = () => {
    setCoupon(null)
    try { sessionStorage.removeItem('ark_coupon') } catch {}
  }

  return (
    <main className="min-h-screen bg-luxury-ivory">
      <header className="sticky top-0 z-40 bg-luxury-ivory/95 backdrop-blur-md border-b border-burgundy-ink/10">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2 text-burgundy-ink hover:text-gold transition-colors group">
            <ChevronLeft size={16} strokeWidth={1.4} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-cinzel text-[0.6rem] tracking-[0.35em]">CONTINUE SHOPPING</span>
          </Link>
          <Link href="/"><img src={LOGO_URL} alt="ARKADHATRI" className="h-12 md:h-14 object-contain" /></Link>
          <span className="font-cinzel text-[0.6rem] tracking-[0.35em] text-burgundy-ink">MY BAG</span>
        </div>
      </header>

      <section className="container py-12 md:py-16">
        <div className="text-center mb-12">
          <div className="font-cinzel text-[0.62rem] tracking-[0.35em] text-gold mb-3">— SHOPPING BAG</div>
          <h1 className="font-cormorant text-4xl md:text-5xl text-burgundy-ink">Your Selection</h1>
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto">
            <ShoppingBag size={40} strokeWidth={1.2} className="text-burgundy-ink/40 mx-auto mb-6" />
            <p className="font-cormorant italic text-xl text-burgundy-ink/70 mb-8">Your bag is empty. Discover the current curation of sarees.</p>
            <Link href="/" className="btn-luxury-filled inline-flex">Shop Collection</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-16">
            {/* Items */}
            <div className="space-y-4">
              <AnimatePresence>
                {items.map((it) => (
                  <motion.div key={it.sku} initial={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }} className="flex gap-4 md:gap-6 bg-white/60 border border-burgundy-ink/10 rounded-sm p-4 md:p-5">
                    <Link href={`/product/${it.slug}`} className="shrink-0 w-24 md:w-32 aspect-[4/5] overflow-hidden rounded-sm bg-burgundy-ink/5">
                      <img src={it.image} alt={it.name} loading="lazy" className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link href={`/product/${it.slug}`} className="font-cormorant text-xl md:text-2xl text-burgundy-ink hover:text-gold transition-colors">{it.name}</Link>
                          <div className="font-inter font-light text-burgundy-ink/60 text-[12px] md:text-[13px] mt-0.5 truncate">{it.tagline}</div>
                          <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-burgundy-ink/50 mt-1">{it.sku}</div>
                        </div>
                        <button onClick={() => cart.remove(it.sku)} aria-label="Remove" className="text-burgundy-ink/50 hover:text-burgundy-ink transition-colors shrink-0"><X size={16} strokeWidth={1.4} /></button>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 border border-burgundy-ink/20 rounded-sm">
                          <button onClick={() => cart.setQty(it.sku, it.qty - 1)} className="w-9 h-9 flex items-center justify-center hover:bg-burgundy-ink/5 transition-colors" aria-label="Decrease"><Minus size={12} strokeWidth={1.5} /></button>
                          <span className="font-cinzel text-sm w-6 text-center">{it.qty}</span>
                          <button onClick={() => cart.setQty(it.sku, it.qty + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-burgundy-ink/5 transition-colors" aria-label="Increase"><Plus size={12} strokeWidth={1.5} /></button>
                        </div>
                        <div className="font-cinzel text-lg md:text-xl text-burgundy-ink" style={{ fontWeight: 600 }}>{it.currency} {inr(it.price * it.qty)}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <aside className="lg:sticky lg:top-24 self-start">
              <div className="bg-white/80 border border-burgundy-ink/10 rounded-sm p-6 md:p-8">
                <div className="font-cinzel text-[0.62rem] tracking-[0.35em] text-gold mb-4">— ORDER SUMMARY</div>
                <dl className="space-y-3">
                  <div className="flex justify-between font-cormorant text-burgundy-ink/80">
                    <dt>Subtotal ({items.reduce((n, i) => n + i.qty, 0)} items)</dt>
                    <dd>₹ {inr(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between font-cormorant text-burgundy-ink/80">
                    <dt>Shipping</dt>
                    <dd>{shipping === 0 ? <span className="text-gold">Complimentary</span> : `₹ ${inr(shipping)}`}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between font-cormorant text-gold">
                      <dt>Discount {coupon?.code ? `(${coupon.code})` : ''}</dt>
                      <dd>− ₹ {inr(discount)}</dd>
                    </div>
                  )}
                  {subtotal > 0 && subtotal < 15000 && (
                    <div className="text-xs font-cormorant italic text-burgundy-ink/60">Free shipping on orders above ₹ 15,000</div>
                  )}
                </dl>

                {/* Coupon input */}
                {subtotal > 0 && (
                  <div className="mt-5">
                    <CouponBox
                      subtotal={subtotal}
                      applied={coupon}
                      onApply={applyCoupon}
                      onRemove={removeCoupon}
                    />
                  </div>
                )}

                <div className="my-5 border-t border-burgundy-ink/15" />
                <div className="flex justify-between items-baseline">
                  <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-burgundy-ink">TOTAL</span>
                  <span className="font-cinzel text-2xl text-burgundy-ink" style={{ fontWeight: 600 }}>₹ {inr(total)}</span>
                </div>
                <div className="font-cormorant italic text-burgundy-ink/50 text-xs mt-1 text-right">inclusive of all taxes</div>
                <Link href="/checkout" className="mt-6 btn-luxury-filled w-full inline-flex">Proceed to Checkout</Link>
                <Link href="/" className="mt-3 btn-luxury w-full inline-flex">Continue Shopping</Link>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[
                  { i: ShieldCheck, t: 'Secure Payments' },
                  { i: Truck,       t: 'Fast India Delivery' },
                  { i: RotateCcw,   t: '7-Day Returns' }
                ].map((x) => (
                  <div key={x.t} className="flex flex-col items-center gap-2 py-3 px-2 border border-burgundy-ink/10 rounded-sm">
                    <x.i size={16} strokeWidth={1.3} className="text-gold" />
                    <div className="font-cinzel text-[0.5rem] tracking-[0.25em] text-burgundy-ink/80 leading-tight">{x.t}</div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}

export default CartPage
