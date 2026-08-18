'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { inr } from '@/lib/cart'
import { firePurchaseOnce } from '@/components/Analytics'

import { LOGO_URL } from '@/lib/brand'

const STATUS_LABEL = {
  PAYMENT_PENDING:  { text: 'Payment pending confirmation',   tone: 'text-gold' },
  PAID:             { text: 'Payment received',                tone: 'text-green-700' },
  PAYMENT_FAILED:   { text: 'Payment not completed',           tone: 'text-red-700' },
  PROCESSING:       { text: 'Being prepared at the atelier',   tone: 'text-gold' },
  PACKED:           { text: 'Packed and ready to ship',        tone: 'text-gold' },
  SHIPPED:          { text: 'Dispatched',                      tone: 'text-green-700' },
  OUT_FOR_DELIVERY: { text: 'Out for delivery',                tone: 'text-green-700' },
  DELIVERED:        { text: 'Delivered',                       tone: 'text-green-700' },
  CANCELLED:        { text: 'Cancelled',                       tone: 'text-red-700' },
  REFUND_INITIATED: { text: 'Refund initiated',                tone: 'text-gold' },
  REFUNDED:         { text: 'Refunded',                        tone: 'text-green-700' }
}

const OrderSuccess = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch(`/api/orders/${id}`).then(r => r.json()).then((d) => {
      if (d?.order) {
        setOrder(d.order)
        // Fire analytics purchase only when the order is server-confirmed PAID (dedupe by orderId).
        if (d.order.paymentStatus === 'paid') firePurchaseOnce(d.order)
      } else setErr(d?.error || 'Order not found')
    }).catch((e) => setErr(e.message))
  }, [id])

  const statusInfo = STATUS_LABEL[order?.status] || STATUS_LABEL.PAYMENT_PENDING
  const isPaid = order?.paymentStatus === 'paid'
  const isFailed = order?.status === 'PAYMENT_FAILED'

  return (
    <main className="min-h-screen bg-luxury-ivory">
      <header className="py-6 border-b border-burgundy-ink/10">
        <div className="container flex items-center justify-center">
          <Link href="/"><img src={LOGO_URL} alt="ARKADHATRI" className="h-14 object-contain" /></Link>
        </div>
      </header>

      <section className="container py-16 md:py-24 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className={`w-20 h-20 md:w-24 md:h-24 mx-auto mb-8 rounded-full border-2 flex items-center justify-center ${isFailed ? 'border-red-500' : 'border-gold'}`} style={{ boxShadow: isFailed ? '0 20px 40px -20px rgba(239,68,68,0.3)' : '0 20px 40px -20px rgba(200,164,90,0.35)' }}>
          {isFailed ? (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path d="M6 6 L18 18 M18 6 L6 18" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <motion.svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <motion.path d="M4 12 L10 18 L20 6" stroke="#C8A45A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, delay: 0.3 }} />
            </motion.svg>
          )}
        </motion.div>

        <div className={`font-cinzel text-[0.62rem] tracking-[0.35em] mb-4 ${isFailed ? 'text-red-700' : 'text-gold'}`}>
          {isFailed ? '— PAYMENT NOT COMPLETED' : '— THANK YOU'}
        </div>
        <h1 className="font-cormorant text-4xl md:text-6xl text-burgundy-ink leading-[1.1] max-w-3xl mx-auto">
          {isFailed
            ? <>Your payment did <em className="italic text-red-700">not go through.</em></>
            : isPaid
              ? <>Your order has been <em className="italic text-gold">confirmed.</em></>
              : <>Your order has been <em className="italic text-gold">received.</em></>}
        </h1>
        <p className="mt-6 font-cormorant italic text-burgundy-ink/70 text-lg md:text-xl max-w-2xl mx-auto">
          {isFailed
            ? 'No charge has been made. You may retry payment at any time or write to the atelier.'
            : isPaid
              ? 'A confirmation has been sent to your email. The atelier is preparing your saree for dispatch.'
              : 'Your order is reserved. The atelier will confirm your payment link within one working day.'}
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
                <div className={`font-cormorant italic ${statusInfo.tone}`}>{statusInfo.text}</div>
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
              <span className="font-cinzel text-[0.6rem] tracking-[0.35em] text-burgundy-ink">{isPaid ? 'TOTAL PAID' : 'ORDER TOTAL'}</span>
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
            {order.trackingUrl && (
              <div className="mt-6 pt-5 border-t border-burgundy-ink/15">
                <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-burgundy-ink/60 mb-2">TRACK SHIPMENT</div>
                <div className="font-cormorant text-burgundy-ink">{order.courier} · AWB {order.awb}</div>
                <a href={order.trackingUrl} target="_blank" rel="noopener" className="btn-luxury inline-block mt-3">Open Tracking</a>
              </div>
            )}
          </div>
        )}

        {err && <div className="mt-10 font-cormorant italic text-burgundy-ink/70">{err}. Please write to hello@arkadhatri.com with your order details.</div>}

        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link href="/" className="btn-luxury-filled">Continue Shopping</Link>
          <Link href="/track-order" className="btn-luxury">Track Order</Link>
        </div>
      </section>
    </main>
  )
}

export default OrderSuccess
