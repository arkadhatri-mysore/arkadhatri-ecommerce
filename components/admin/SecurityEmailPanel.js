'use client'

import { useEffect, useState } from 'react'
import { Eye, EyeOff, KeyRound, Mail, Send, ExternalLink } from 'lucide-react'

const inp = 'w-full border border-[#4A0F1C]/20 rounded px-3 py-2 font-inter text-sm text-[#4A0F1C] focus:border-[#C8A45A] focus:outline-none'
const LABELS = {
  'order-confirmation': 'Order confirmation',
  'payment-receipt': 'Payment receipt',
  'payment-failed': 'Payment not completed',
  'order-shipped': 'Shipping notification',
  'order-delivered': 'Delivered',
  'refund-initiated': 'Refund initiated',
  'refund-processed': 'Refund completed',
  'admin-password-reset': 'Admin password reset'
}

const PwInput = ({ value, onChange, placeholder, autoComplete, testid }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input data-testid={testid} type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} className={`${inp} pr-10`} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4A0F1C]/60 hover:text-[#4A0F1C]">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

export function PasswordCard() {
  const [f, setF] = useState({ current: '', next: '', confirm: '' })
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const rules = [
    [f.next.length >= 10, 'At least 10 characters'],
    [/[A-Z]/.test(f.next) && /[a-z]/.test(f.next), 'Upper- and lower-case letters'],
    [/[0-9]/.test(f.next), 'At least one number'],
    [f.next && f.next === f.confirm, 'Both new passwords match']
  ]
  const ok = rules.every(([v]) => v) && f.current
  const submit = async (e) => {
    e.preventDefault()
    if (!ok) return
    setBusy(true); setMsg(null)
    try {
      const r = await fetch('/api/admin/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: f.current, newPassword: f.next }) })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || 'Could not change password')
      setF({ current: '', next: '', confirm: '' })
      setMsg({ ok: true, t: 'Password changed. Other devices have been signed out.' })
    } catch (err) { setMsg({ ok: false, t: err.message }) } finally { setBusy(false) }
  }
  return (
    <section className="bg-white border border-[#4A0F1C]/10 rounded p-6 mb-6" data-testid="password-card">
      <div className="flex items-center gap-2 font-cinzel text-[0.62rem] tracking-[0.32em] text-[#C8A45A] mb-1"><KeyRound size={14} /> — ADMIN PASSWORD</div>
      <p className="font-inter text-sm text-[#4A0F1C]/70 mb-4">Set your own private password. It is stored only as a secure hash and is never shown anywhere.</p>
      <form onSubmit={submit} className="grid md:grid-cols-3 gap-4">
        <label className="block"><div className="font-inter text-xs text-[#4A0F1C]/70 mb-1.5">Current password</div><PwInput testid="pw-current" value={f.current} onChange={(v) => setF({ ...f, current: v })} autoComplete="current-password" /></label>
        <label className="block"><div className="font-inter text-xs text-[#4A0F1C]/70 mb-1.5">New password</div><PwInput testid="pw-new" value={f.next} onChange={(v) => setF({ ...f, next: v })} autoComplete="new-password" /></label>
        <label className="block"><div className="font-inter text-xs text-[#4A0F1C]/70 mb-1.5">Confirm new password</div><PwInput testid="pw-confirm" value={f.confirm} onChange={(v) => setF({ ...f, confirm: v })} autoComplete="new-password" /></label>
        <ul className="md:col-span-2 grid sm:grid-cols-2 gap-1">
          {rules.map(([v, t]) => <li key={t} className={`font-inter text-xs ${v ? 'text-green-800' : 'text-[#4A0F1C]/70'}`}>{v ? '✓' : '○'} {t}</li>)}
        </ul>
        <div className="flex md:justify-end items-start">
          <button data-testid="pw-submit" disabled={!ok || busy} className="bg-[#4A0F1C] text-white font-inter text-sm font-medium px-5 py-2.5 rounded disabled:opacity-60">{busy ? 'Saving…' : 'Change password'}</button>
        </div>
      </form>
      {msg && <p data-testid="pw-msg" className={`font-inter text-sm mt-3 ${msg.ok ? 'text-green-800' : 'text-red-800'}`}>{msg.t}</p>}
    </section>
  )
}

export function EmailCard() {
  const [st, setSt] = useState(null)
  const [tpl, setTpl] = useState('order-confirmation')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { fetch('/api/admin/email/status').then((r) => r.json()).then(setSt).catch(() => {}) }, [])
  const test = async () => {
    setBusy(true); setMsg(null)
    const r = await fetch('/api/admin/email/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ template: tpl }) })
    const d = await r.json().catch(() => ({}))
    setBusy(false)
    setMsg(r.ok ? { ok: true, t: `Test email sent to ${d.to}. Check your inbox (and spam folder).` } : { ok: false, t: d.error || 'Test failed' })
  }
  return (
    <section className="bg-white border border-[#4A0F1C]/10 rounded p-6 mb-6" data-testid="email-card">
      <div className="flex items-center gap-2 font-cinzel text-[0.62rem] tracking-[0.32em] text-[#C8A45A] mb-1"><Mail size={14} /> — CUSTOMER EMAILS</div>
      <p className="font-inter text-sm text-[#4A0F1C]/70 mb-4">
        Status: {st ? (st.configured ? <b className="text-green-800">Connected{st.from ? ` (sending as ${st.from})` : ''}</b> : <b className="text-amber-800">Not connected yet. Emails will start once your arkadhatri.com mail details are added.</b>) : '…'}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <select value={tpl} onChange={(e) => setTpl(e.target.value)} className={`${inp} sm:max-w-xs`} data-testid="email-template">
          {(st?.templates || Object.keys(LABELS)).map((k) => <option key={k} value={k}>{LABELS[k] || k}</option>)}
        </select>
        <a href={`/api/admin/email/preview/${tpl}`} target="_blank" rel="noreferrer" data-testid="email-preview" className="inline-flex items-center justify-center gap-1.5 border border-[#4A0F1C]/20 text-[#4A0F1C] font-inter text-sm px-4 py-2 rounded hover:border-[#C8A45A]"><ExternalLink size={14} /> Preview</a>
        <button onClick={test} disabled={busy || !st?.configured} data-testid="email-test" className="inline-flex items-center justify-center gap-1.5 bg-[#4A0F1C] text-white font-inter text-sm px-4 py-2 rounded disabled:opacity-60"><Send size={14} /> {busy ? 'Sending…' : 'Send test to admin email'}</button>
      </div>
      {msg && <p className={`font-inter text-sm mt-3 ${msg.ok ? 'text-green-800' : 'text-red-800'}`}>{msg.t}</p>}
    </section>
  )
}

export function RefundBox({ order, onDone }) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  if (!order) return null
  const canRefund = order.paymentStatus === 'paid' && order.razorpayPaymentId && !['REFUND_INITIATED', 'REFUNDED'].includes(order.status)
  if (!canRefund) {
    if (order.refundId) return <div className="border-t border-[#4A0F1C]/10 pt-4 font-inter text-sm text-[#4A0F1C]/80">Refund {order.status === 'REFUNDED' ? 'completed' : 'in progress'}: ₹ {order.refundAmount} · {order.refundId}</div>
    return null
  }
  const go = async () => {
    const amt = amount === '' ? order.total : Number(amount)
    if (!window.confirm(`Refund ₹ ${amt} to the customer's original payment method? This cannot be undone.`)) return
    setBusy(true); setErr('')
    const r = await fetch(`/api/admin/orders/${order.id}/refund`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: amount === '' ? undefined : Number(amount), reason }) })
    const d = await r.json().catch(() => ({}))
    setBusy(false)
    if (!r.ok) return setErr(d.error || 'Refund failed')
    onDone?.(d.order)
  }
  return (
    <div className="border-t border-[#4A0F1C]/10 pt-4" data-testid="refund-box">
      <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/70 mb-3">REFUND</div>
      <div className="grid grid-cols-2 gap-3">
        <input type="number" min="1" max={order.total} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Full: ₹ ${order.total}`} className={inp} />
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" className={inp} />
      </div>
      {err && <p className="font-inter text-sm text-red-800 mt-2">{err}</p>}
      <button onClick={go} disabled={busy} data-testid="refund-btn" className="mt-3 bg-white border border-red-300 text-red-800 hover:bg-red-50 font-inter text-sm px-4 py-2 rounded disabled:opacity-60">{busy ? 'Processing…' : 'Refund via Razorpay'}</button>
    </div>
  )
}
