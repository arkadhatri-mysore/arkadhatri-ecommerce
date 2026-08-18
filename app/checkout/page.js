'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ShieldCheck, Lock } from 'lucide-react'
import { cart, inr } from '@/lib/cart'
import CouponBox from '@/components/CouponBox'

const LOGO_URL = 'https://customer-assets-jt897jd0.emergentagent.net/job_timeless-crafted-8/artifacts/xkx14q2d_ARK%20LOGO.jpeg'

const FieldLabel = ({ children }) => (
  <label className="block font-cinzel text-[0.55rem] tracking-[0.3em] uppercase text-burgundy-deep/80 mb-2">{children}</label>
)
const input = 'w-full bg-transparent border border-burgundy-ink/20 focus:border-gold focus:outline-none py-3 px-4 font-cormorant text-base text-burgundy-ink placeholder:text-burgundy-ink/30 rounded-sm transition-colors'

const CheckoutPage = () => {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [coupon, setCoupon] = useState(null)
  const [form, setForm] = useState({
    fullName: '', email: '', mobile: '',
    address1: '', address2: '', city: '', state: 'Karnataka', pincode: '',
    paymentMethod: 'razorpay'
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setItems(cart.get())
    if (cart.count() === 0) router.replace('/cart')
    const sync = () => setItems(cart.get())
    window.addEventListener('cart:changed', sync)
    try {
      const c = JSON.parse(sessionStorage.getItem('ark_coupon') || 'null')
      if (c) setCoupon(c)
    } catch {}
    return () => window.removeEventListener('cart:changed', sync)
  }, [router])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const shipping = subtotal >= 15000 || subtotal === 0 ? 0 : 250
  const discount = coupon
    ? (coupon.type === 'percentage'
        ? Math.round(subtotal * (Number(coupon.value) / 100))
        : Number(coupon.value) || 0)
    : 0
  const total = Math.max(0, subtotal + shipping - discount)

  const applyCoupon = (c) => {
    setCoupon(c)
    try { sessionStorage.setItem('ark_coupon', JSON.stringify(c)) } catch {}
  }
  const removeCoupon = () => {
    setCoupon(null)
    try { sessionStorage.removeItem('ark_coupon') } catch {}
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ sku, slug, name, price, qty }) => ({ sku, slug, name, price, qty })),
          customer: form,
          subtotal, shipping,
          total: subtotal + shipping, // backend re-applies coupon safely
          couponCode: coupon?.code,
          currency: 'INR'
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Unable to place order')

      // MVP: skip live Razorpay unless keys are provided; complete order in demo/pending mode.
      cart.clear()
      try { sessionStorage.removeItem('ark_coupon') } catch {}
      router.push(`/order-success/${data.order.id}`)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-luxury-ivory">
      <header className="sticky top-0 z-40 bg-luxury-ivory/95 backdrop-blur-md border-b border-burgundy-ink/10">
        <div className="container flex items-center justify-between py-4">
          <Link href="/cart" className="flex items-center gap-2 text-burgundy-ink hover:text-gold transition-colors group">
            <ChevronLeft size={16} strokeWidth={1.4} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-cinzel text-[0.6rem] tracking-[0.35em]">BACK TO BAG</span>
          </Link>
          <Link href="/"><img src={LOGO_URL} alt="ARKADHATRI" className="h-12 md:h-14 object-contain" /></Link>
          <div className="flex items-center gap-1.5 font-cinzel text-[0.55rem] tracking-[0.35em] text-burgundy-ink/70">
            <Lock size={11} strokeWidth={1.5} /> SECURE
          </div>
        </div>
      </header>

      <section className="container py-10 md:py-14">
        <div className="text-center mb-10">
          <div className="font-cinzel text-[0.62rem] tracking-[0.35em] text-gold mb-3">— CHECKOUT</div>
          <h1 className="font-cormorant text-4xl md:text-5xl text-burgundy-ink">Your Details</h1>
        </div>

        <form onSubmit={submit} className="grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-16">
          <div className="space-y-10">
            <div>
              <div className="font-cinzel text-[0.62rem] tracking-[0.35em] text-burgundy-ink mb-5">— 01 &middot; CONTACT</div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><FieldLabel>Full Name</FieldLabel><input required value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className={input} placeholder="e.g. Anaya Kapoor" /></div>
                <div><FieldLabel>Email</FieldLabel><input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={input} placeholder="you@example.com" /></div>
                <div><FieldLabel>Mobile</FieldLabel><input required value={form.mobile} onChange={(e) => set('mobile', e.target.value)} className={input} placeholder="+91 —" /></div>
              </div>
            </div>
            <div>
              <div className="font-cinzel text-[0.62rem] tracking-[0.35em] text-burgundy-ink mb-5">— 02 &middot; DELIVERY ADDRESS</div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><FieldLabel>Address Line 1</FieldLabel><input required value={form.address1} onChange={(e) => set('address1', e.target.value)} className={input} placeholder="House / Flat / Street" /></div>
                <div className="md:col-span-2"><FieldLabel>Address Line 2 (optional)</FieldLabel><input value={form.address2} onChange={(e) => set('address2', e.target.value)} className={input} placeholder="Landmark, Area" /></div>
                <div><FieldLabel>City</FieldLabel><input required value={form.city} onChange={(e) => set('city', e.target.value)} className={input} placeholder="e.g. Bengaluru" /></div>
                <div><FieldLabel>State</FieldLabel><input required value={form.state} onChange={(e) => set('state', e.target.value)} className={input} /></div>
                <div><FieldLabel>PIN Code</FieldLabel><input required value={form.pincode} onChange={(e) => set('pincode', e.target.value)} className={input} placeholder="560001" /></div>
              </div>
            </div>
            <div>
              <div className="font-cinzel text-[0.62rem] tracking-[0.35em] text-burgundy-ink mb-5">— 03 &middot; PAYMENT</div>
              <label className="flex items-start gap-3 border border-gold/60 bg-gold/5 rounded-sm p-5 cursor-pointer">
                <input type="radio" name="pay" checked={form.paymentMethod === 'razorpay'} onChange={() => set('paymentMethod', 'razorpay')} className="mt-1 accent-[#C8A45A]" />
                <div>
                  <div className="font-cormorant text-xl text-burgundy-ink">Razorpay Secure Payment</div>
                  <div className="font-inter font-light text-burgundy-ink/60 text-[13px] mt-1">UPI, Cards, Netbanking &amp; Wallets. Payment gateway will open in a secure window.</div>
                  <div className="mt-2 flex items-center gap-2 font-cinzel text-[0.55rem] tracking-[0.3em] text-gold"><Lock size={11} strokeWidth={1.5} />256-BIT SSL ENCRYPTED</div>
                </div>
              </label>
              <p className="mt-3 font-cormorant italic text-burgundy-ink/50 text-xs">Note: Payment gateway keys pending. This order will be recorded as \u201cpending payment\u201d and our concierge will confirm the payment link with you within one working day.</p>
            </div>

            {error && <p className="font-cormorant italic text-red-800">{error}</p>}

            <button type="submit" disabled={submitting} className="btn-luxury-filled w-full disabled:opacity-60">
              {submitting ? 'Placing Order\u2026' : `Place Order \u00b7 \u20b9 ${inr(total)}`}
            </button>
            <p className="text-center font-cormorant italic text-burgundy-ink/50 text-xs">By placing the order you agree to our <Link href="/terms" className="underline hover:text-gold">Terms</Link> and <Link href="/privacy-policy" className="underline hover:text-gold">Privacy Policy</Link>.</p>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="bg-white/80 border border-burgundy-ink/10 rounded-sm p-6 md:p-8">
              <div className="font-cinzel text-[0.62rem] tracking-[0.35em] text-gold mb-4">— YOUR ORDER</div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.sku} className="flex gap-3">
                    <div className="w-14 h-16 shrink-0 overflow-hidden rounded-sm bg-burgundy-ink/5">
                      <img src={it.image} alt="" loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-cormorant text-base text-burgundy-ink truncate">{it.name} <span className="text-burgundy-ink/50">× {it.qty}</span></div>
                      <div className="font-inter text-[11px] text-burgundy-ink/50 truncate">{it.tagline}</div>
                    </div>
                    <div className="font-cinzel text-xs text-burgundy-ink whitespace-nowrap">₹ {inr(it.price * it.qty)}</div>
                  </div>
                ))}
              </div>
              <div className="my-4 border-t border-burgundy-ink/15" />
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between font-cormorant text-burgundy-ink/80"><dt>Subtotal</dt><dd>₹ {inr(subtotal)}</dd></div>
                <div className="flex justify-between font-cormorant text-burgundy-ink/80"><dt>Shipping</dt><dd>{shipping === 0 ? <span className="text-gold">Complimentary</span> : `₹ ${inr(shipping)}`}</dd></div>
                {discount > 0 && (
                  <div className="flex justify-between font-cormorant text-gold"><dt>Discount {coupon?.code ? `(${coupon.code})` : ''}</dt><dd>− ₹ {inr(discount)}</dd></div>
                )}
              </dl>

              {/* Coupon */}
              <div className="mt-4">
                <CouponBox
                  subtotal={subtotal}
                  applied={coupon}
                  onApply={applyCoupon}
                  onRemove={removeCoupon}
                  compact
                />
              </div>

              <div className="my-4 border-t border-burgundy-ink/15" />
              <div className="flex justify-between items-baseline">
                <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-burgundy-ink">TOTAL</span>
                <span className="font-cinzel text-2xl text-burgundy-ink" style={{ fontWeight: 600 }}>₹ {inr(total)}</span>
              </div>
              <div className="mt-5 flex items-center gap-2 font-cinzel text-[0.55rem] tracking-[0.3em] text-burgundy-ink/70">
                <ShieldCheck size={13} strokeWidth={1.5} className="text-gold" />
                SECURE 256-BIT SSL CHECKOUT
              </div>
            </div>
          </aside>
        </form>
      </section>
    </main>
  )
}

export default CheckoutPage
