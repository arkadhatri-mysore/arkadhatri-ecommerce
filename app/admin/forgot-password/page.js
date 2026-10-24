'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setMsg(null)
    const r = await fetch('/api/admin/password/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    const d = await r.json().catch(() => ({}))
    setBusy(false)
    setMsg({ ok: r.ok, t: r.ok ? d.message : (d.error || 'Something went wrong. Please try again.') })
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-[#4A0F1C]/10 rounded p-8">
        <h1 className="font-cormorant text-3xl text-[#4A0F1C] mb-2">Forgot password</h1>
        <p className="font-inter text-sm text-[#4A0F1C]/70 mb-6">Enter the admin email. We'll send a secure link to choose a new password. It expires in 30 minutes.</p>
        <label className="block mb-4">
          <div className="font-inter text-xs text-[#4A0F1C]/70 mb-1.5">Admin email</div>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-[#4A0F1C]/20 rounded px-3 py-2.5 font-inter text-sm text-[#4A0F1C] focus:border-[#C8A45A] focus:outline-none" />
        </label>
        {msg && <p className={`font-inter text-sm mb-4 ${msg.ok ? 'text-green-800' : 'text-red-800'}`}>{msg.t}</p>}
        <button disabled={busy} className="w-full bg-[#C8A45A] hover:bg-[#D6B56D] text-[#4A0F1C] font-inter text-sm font-semibold uppercase tracking-widest py-3 rounded disabled:opacity-60">{busy ? 'Sending…' : 'Send reset link'}</button>
        <Link href="/admin" className="block text-center mt-5 font-inter text-sm text-[#4A0F1C]/80 hover:text-[#C8A45A]">← Back to sign in</Link>
      </form>
    </div>
  )
}
