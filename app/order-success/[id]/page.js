'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { inr } from '@/lib/cart'

const LOGO_URL = 'https://customer-assets-jt897jd0.emergentagent.net/job_timeless-crafted-8/artifacts/xkx14q2d_ARK%20LOGO.jpeg'

const OrderSuccess = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch(`/api/orders/${id}`).then(r => r.json()).then((d) => {
      if (d?.order) setOrder(d.order)
      else setErr(d?.error || 'Order not found')
    }).catch((e) => setErr(e.message))
  }, [id])

  return (
    <main className="min-h-screen bg-luxury-ivory">
      <header className="py-6 border-b border-burgundy-ink/10">
        <div className="container flex items-center justify-center">
          <Link href="/"><img src={LOGO_URL} alt="ARKADHATRI" className="h-14 object-contain" /></Link>
        </div>
      </header>

      <section className="container py-16 md:py-24 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-8 rounded-full border-2 border-gold flex items-center justify-center" style={{ boxShadow: '0 20px 40px -20px rgba(200,164,90,0.35)' }}>
          <motion.svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <motion.path d="M4 12 L10 18 L20 6" stroke="#C8A45A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, delay: 0.3 }} />
          </motion.svg>
        </motion.div>

        <div className="font-cinzel text-[0.62rem] tracking-[0.35em] text-gold mb-4">— THANK YOU</div>
        <h1 className="font-cormorant text-4xl md:text-6xl text-burgundy-ink leading-[1.1] max-w-3xl mx-auto">
          Your order has been <em className="italic text-gold">received.</em>
        </h1>
        <p className="mt-6 font-cormorant italic text-burgundy-ink/70 text-lg md:text-xl max-w-2xl mx-auto">
          A confirmation has been sent to your email. Our concierge will personally reach out
          within one working day to confirm your payment and dispatch details.
        </p>

        {order && (
          <div className="mt-12 max-w-2xl mx-auto bg-white/80 border border-burgundy-ink/10 rounded-sm p-6 md:p-8 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-burgundy-ink/60">ORDER NUMBER</div>
                <div className="font-cinzel text-base text-burgundy-ink mt-1" style={{ fontWeight: 600 }}>{order.id.slice(0, 8).toUpperCase()}</div>
              </div>
              <div>
                <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-burgundy-ink/60">STATUS</div>
                <div className="font-cormorant italic text-gold">Payment pending confirmation</div>
              </div>
            </div>
            <div className="border-t border-burgundy-ink/15 pt-4 space-y-3">
              {order.items?.map((it) => (
                <div key={it.sku} className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-cormorant text-lg text-burgundy-ink truncate">{it.name} <span className="text-burgundy-ink/50">× {it.qty}</span></div>
                    <div className="font-cinzel text-[0.5rem] tracking-[0.25em] text-burgundy-ink/50">{it.sku}</div>
                  </div>
                  <div className="font-cinzel text-sm text-burgundy-ink">₹ {inr(it.price * it.qty)}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-burgundy-ink/15 flex justify-between">
              <span className="font-cinzel text-[0.6rem] tracking-[0.35em] text-burgundy-ink">TOTAL PAID</span>
              <span className="font-cinzel text-lg text-burgundy-ink" style={{ fontWeight: 600 }}>₹ {inr(order.total)}</span>
            </div>
            {order.customer?.address1 && (
              <div className="mt-6 pt-5 border-t border-burgundy-ink/15">
                <div className="flex items-center gap-2 font-cinzel text-[0.55rem] tracking-[0.3em] text-burgundy-ink/60 mb-2"><MapPin size={11} strokeWidth={1.4} />SHIPPING TO</div>
                <div className="font-cormorant text-burgundy-ink">
                  {order.customer.fullName}<br />
                  {order.customer.address1}{order.customer.address2 ? `, ${order.customer.address2}` : ''}<br />
                  {order.customer.city}, {order.customer.state} {order.customer.pincode}
                </div>
              </div>
            )}
          </div>
        )}

        {err && <div className="mt-10 font-cormorant italic text-burgundy-ink/70">{err}. Please write to hello@arkadhatri.com with your order details.</div>}

        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link href="/" className="btn-luxury-filled">Continue Shopping</Link>
          <Link href="/faq" className="btn-luxury">Delivery FAQ</Link>
        </div>
      </section>
    </main>
  )
}

export default OrderSuccess
