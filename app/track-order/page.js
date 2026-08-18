'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Package, Truck, CheckCircle2 } from 'lucide-react'

import { LOGO_URL } from '@/lib/brand'

const STEPS = [
  { key: 'PAYMENT_PENDING',  label: 'Placed' },
  { key: 'PAID',             label: 'Paid' },
  { key: 'PROCESSING',       label: 'Processing' },
  { key: 'PACKED',           label: 'Packed' },
  { key: 'SHIPPED',          label: 'Shipped' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED',        label: 'Delivered' }
]

const ACTIVE_INDEX = (status) => {
  const i = STEPS.findIndex(s => s.key === status)
  return i === -1 ? 0 : i
}

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('')
  const [idn, setIdn] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setOrder(null); setLoading(true)
    try {
      const r = await fetch('/api/orders/track', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId.trim(), identifier: idn.trim() })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Unable to find order')
      setOrder(d.order)
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  const inr = new Intl.NumberFormat('en-IN')
  const active = order ? ACTIVE_INDEX(order.status) : -1
  const isFailed = order?.status === 'PAYMENT_FAILED' || order?.status === 'CANCELLED'

  return (
    <main className="min-h-screen bg-luxury-ivory">
      <header className="py-6 border-b border-burgundy-ink/10">
        <div className="container flex items-center justify-center">
          <Link href="/"><img src={LOGO_URL} alt="ARKADHATRI" className="h-14 object-contain" /></Link>
        </div>
      </header>

      <section className="container py-14 md:py-20">
        <div className="text-center mb-10">
          <div className="font-cinzel text-[0.62rem] tracking-[0.35em] text-gold mb-3">— TRACK YOUR ORDER</div>
          <h1 className="font-cormorant text-4xl md:text-5xl text-burgundy-ink">Follow Your Saree</h1>
          <p className="mt-4 font-cormorant italic text-burgundy-ink/60 text-lg max-w-xl mx-auto">Enter your order number and the email or mobile you used at checkout.</p>
        </div>

        <form onSubmit={submit} className="max-w-xl mx-auto grid gap-4">
          <div>
            <label className="block font-cinzel text-[0.55rem] tracking-[0.3em] uppercase text-burgundy-ink/70 mb-2">Order Number</label>
            <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="e.g. c4a1b2d3-..." required className="w-full bg-transparent border border-burgundy-ink/20 focus:border-gold focus:outline-none py-3 px-4 font-cormorant text-burgundy-ink rounded-sm" />
          </div>
          <div>
            <label className="block font-cinzel text-[0.55rem] tracking-[0.3em] uppercase text-burgundy-ink/70 mb-2">Email or Mobile</label>
            <input value={idn} onChange={e => setIdn(e.target.value)} placeholder="you@example.com or +91…" required className="w-full bg-transparent border border-burgundy-ink/20 focus:border-gold focus:outline-none py-3 px-4 font-cormorant text-burgundy-ink rounded-sm" />
          </div>
          {error && <p className="font-cormorant italic text-red-700">{error}</p>}
          <button disabled={loading} className="btn-luxury-filled disabled:opacity-60">
            {loading ? 'Locating your order…' : 'Track Order'}
          </button>
        </form>

        {order && (
          <div className="mt-14 max-w-3xl mx-auto">
            <div className="bg-white/80 border border-burgundy-ink/10 rounded-sm p-6 md:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-burgundy-ink/60">ORDER</div>
                  <div className="font-cinzel text-lg text-burgundy-ink" style={{fontWeight:600}}>#{order.id.slice(0,8).toUpperCase()}</div>
                </div>
                <div className="text-right">
                  <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-burgundy-ink/60">TOTAL</div>
                  <div className="font-cinzel text-lg text-burgundy-ink">₹ {inr.format(order.total)}</div>
                </div>
              </div>

              {/* Timeline */}
              {!isFailed ? (
                <>
                  <div className="mt-6">
                    <div className="hidden md:flex items-center">
                      {STEPS.map((s, i) => {
                        const done = i <= active
                        return (
                          <div key={s.key} className="flex-1 flex items-center">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${done ? 'bg-gold border-gold text-burgundy-ink' : 'bg-transparent border-burgundy-ink/20 text-burgundy-ink/40'}`}>
                                {done ? <CheckCircle2 size={16} strokeWidth={1.6} /> : <span className="text-[10px]">{i+1}</span>}
                              </div>
                              <div className={`mt-2 font-cinzel text-[0.5rem] tracking-[0.25em] uppercase ${done ? 'text-burgundy-ink' : 'text-burgundy-ink/40'}`}>{s.label}</div>
                            </div>
                            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < active ? 'bg-gold' : 'bg-burgundy-ink/15'}`} />}
                          </div>
                        )
                      })}
                    </div>
                    <ol className="md:hidden space-y-3">
                      {STEPS.map((s, i) => {
                        const done = i <= active
                        return (
                          <li key={s.key} className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${done ? 'bg-gold border-gold text-burgundy-ink' : 'bg-transparent border-burgundy-ink/20 text-burgundy-ink/40'}`}>
                              {done ? <CheckCircle2 size={14} strokeWidth={1.6} /> : <span className="text-[10px]">{i+1}</span>}
                            </div>
                            <span className={`font-cormorant ${done ? 'text-burgundy-ink' : 'text-burgundy-ink/40'}`}>{s.label}</span>
                          </li>
                        )
                      })}
                    </ol>
                  </div>

                  {/* Shipping details */}
                  {order.courier && (
                    <div className="mt-8 border-t border-burgundy-ink/15 pt-6">
                      <div className="flex items-center gap-2 font-cinzel text-[0.55rem] tracking-[0.3em] text-burgundy-ink/70 mb-3"><Truck size={13} strokeWidth={1.5} className="text-gold"/> SHIPMENT</div>
                      <div className="font-cormorant text-burgundy-ink">
                        <div><span className="opacity-60">Courier:</span> {order.courier}</div>
                        {order.awb && <div><span className="opacity-60">AWB:</span> {order.awb}</div>}
                        {order.shipmentStatus && <div className="italic">{order.shipmentStatus}</div>}
                      </div>
                      {order.trackingUrl && (
                        <a href={order.trackingUrl} target="_blank" rel="noopener" className="btn-luxury inline-block mt-4">Open Courier Tracking</a>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="py-6 text-center">
                  <div className="font-cormorant text-2xl text-red-700 italic">{order.status === 'CANCELLED' ? 'Order cancelled.' : 'Payment not completed.'}</div>
                  <p className="mt-3 font-cormorant italic text-burgundy-ink/60">Please reach us on WhatsApp for assistance.</p>
                </div>
              )}

              {/* Items summary */}
              <div className="mt-8 border-t border-burgundy-ink/15 pt-6">
                <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-burgundy-ink/70 mb-3 flex items-center gap-2"><Package size={13} strokeWidth={1.5} className="text-gold"/> YOUR PIECES</div>
                <div className="space-y-3">
                  {order.items?.map(it => (
                    <div key={it.name} className="flex items-center gap-3">
                      {it.image && <img src={it.image} alt="" className="w-12 h-14 object-cover rounded-sm" />}
                      <div className="font-cormorant text-burgundy-ink flex-1">{it.name} <span className="text-burgundy-ink/50">× {it.qty}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
