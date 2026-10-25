'use client'

import { useState } from 'react'
import { Tag, Check, X } from 'lucide-react'

/**
 * CouponBox
 * A quiet, on-brand coupon input. Uses POST /api/coupons/validate.
 *
 * Props:
 *   subtotal   number — order subtotal used to validate min-purchase & compute discount.
 *   applied    object | null — currently applied coupon: { code, type, value, discount }
 *   onApply    (coupon) => void — called on successful validation.
 *   onRemove   () => void — called when user removes applied coupon.
 *   compact    boolean — render compact variant (used on checkout summary).
 */
export default function CouponBox({ subtotal = 0, applied = null, onApply, onRemove, compact = false }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e?.preventDefault?.()
    if (!code.trim()) return
    setError(''); setLoading(true)
    try {
      const r = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), subtotal })
      })
      const d = await r.json()
      if (!r.ok || !d.ok) throw new Error(d.error || 'Invalid coupon')
      onApply?.({ ...d.coupon, discount: d.discount })
      setCode('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inr = new Intl.NumberFormat('en-IN')

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 border border-[#A48246]/50 bg-[#A48246]/10 rounded-sm px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Check size={14} strokeWidth={1.6} className="text-[#35121C] shrink-0" />
          <div className="min-w-0">
            <div className="font-cinzel text-[0.6rem] tracking-[0.3em] text-[#35121C] truncate">{applied.code} APPLIED</div>
            <div className="font-cormorant italic text-[#35121C]/70 text-xs">
              You save ₹ {inr.format(applied.discount || 0)}
            </div>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="shrink-0 text-[#35121C]/60 hover:text-[#35121C] transition-colors"
          aria-label="Remove coupon"
        >
          <X size={14} strokeWidth={1.6} />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div role="group" aria-label="Coupon code" className={`flex items-stretch gap-2 ${compact ? '' : 'mt-1'}`}>
        <div className="relative flex-1">
          <Tag size={12} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#35121C]/40" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } }}
            placeholder="HAVE A CODE?"
            className="w-full pl-8 pr-3 py-2.5 bg-transparent border border-[#35121C]/20 focus:border-[#A48246] rounded-sm font-cinzel text-[0.65rem] tracking-[0.25em] text-[#35121C] placeholder:text-[#35121C]/40 focus:outline-none uppercase"
            disabled={loading}
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={loading || !code.trim()}
          className="px-4 rounded-sm font-cinzel text-[0.6rem] tracking-[0.28em] uppercase bg-[#35121C] text-[#F7F3EB] hover:bg-[#2C0F17] disabled:opacity-70 transition-colors"
        >
          {loading ? '…' : 'Apply'}
        </button>
      </div>
      {error && <p className="mt-2 font-inter text-[#9B2C22] text-sm">{error}</p>}
    </div>
  )
}
