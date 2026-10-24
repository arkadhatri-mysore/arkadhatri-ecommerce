'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const inp = 'w-full border border-[#4A0F1C]/20 rounded px-3 py-2.5 font-inter text-sm text-[#4A0F1C] focus:border-[#C8A45A] focus:outline-none'

function ResetForm() {
  const token = useSearchParams().get('token') || ''
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const valid = pw.length >= 10 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && pw === pw2
  const submit = async (e) => {
    e.preventDefault()
    if (!valid) return
    setBusy(true); setMsg(null)
    const r = await fetch('/api/admin/password/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, newPassword: pw }) })
    const d = await r.json().catch(() => ({}))
    setBusy(false)
    setMsg(r.ok ? { ok: true, t: 'Your password has been changed. You can now sign in.' } : { ok: false, t: d.error || 'Reset failed' })
    if (r.ok) { setPw(''); setPw2('') }
  }
  return (
    <form onSubmit={submit} className="w-full max-w-sm bg-white border border-[#4A0F1C]/10 rounded p-8">
      <h1 className="font-cormorant text-3xl text-[#4A0F1C] mb-2">Choose a new password</h1>
      <p className="font-inter text-sm text-[#4A0F1C]/70 mb-6">At least 10 characters, with upper- and lower-case letters and a number.</p>
      {!token && <p className="font-inter text-sm text-red-800 mb-4">This link is missing its security code. Please request a new reset email.</p>}
      <label className="block mb-4"><div className="font-inter text-xs text-[#4A0F1C]/70 mb-1.5">New password</div><input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={inp} /></label>
      <label className="block mb-4"><div className="font-inter text-xs text-[#4A0F1C]/70 mb-1.5">Confirm new password</div><input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} className={inp} /></label>
      {msg && <p className={`font-inter text-sm mb-4 ${msg.ok ? 'text-green-800' : 'text-red-800'}`}>{msg.t}</p>}
      <button disabled={busy || !valid || !token} className="w-full bg-[#C8A45A] hover:bg-[#D6B56D] text-[#4A0F1C] font-inter text-sm font-semibold uppercase tracking-widest py-3 rounded disabled:opacity-60">{busy ? 'Saving…' : 'Set new password'}</button>
      <Link href="/admin" className="block text-center mt-5 font-inter text-sm text-[#4A0F1C]/80 hover:text-[#C8A45A]">← Back to sign in</Link>
    </form>
  )
}

export default function ResetPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={null}><ResetForm /></Suspense>
    </div>
  )
}
