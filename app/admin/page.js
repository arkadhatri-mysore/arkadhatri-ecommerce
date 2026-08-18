'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

const LOGO_URL = 'https://customer-assets-jt897jd0.emergentagent.net/job_timeless-crafted-8/artifacts/xkx14q2d_ARK%20LOGO.jpeg'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => { if (d.email) router.replace('/admin/dashboard') }).catch(() => {})
  }, [router])

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    const d = await r.json()
    setLoading(false)
    if (!r.ok) return setErr(d.error || 'Login failed')
    router.push('/admin/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-md bg-white border border-[#4A0F1C]/10 rounded p-8 shadow-sm">
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="ARKADHATRI" className="h-16 object-contain mx-auto" />
          <div className="mt-4 font-cinzel text-[0.62rem] tracking-[0.35em] text-[#C8A45A]">— ADMIN SUITE</div>
          <h1 className="font-cormorant text-3xl text-[#4A0F1C] mt-2">Sign in</h1>
        </div>
        <label className="block mb-4">
          <div className="font-inter text-xs text-[#4A0F1C]/70 mb-1">Email</div>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-[#4A0F1C]/20 rounded px-3 py-2.5 font-inter text-sm text-[#4A0F1C] focus:border-[#C8A45A] focus:outline-none" placeholder="admin@arkadhatri.com" />
        </label>
        <label className="block mb-6">
          <div className="font-inter text-xs text-[#4A0F1C]/70 mb-1">Password</div>
          <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-[#4A0F1C]/20 rounded px-3 py-2.5 font-inter text-sm text-[#4A0F1C] focus:border-[#C8A45A] focus:outline-none" />
        </label>
        {err && <p className="text-red-800 text-sm mb-4 font-inter">{err}</p>}
        <button disabled={loading} type="submit" className="w-full bg-[#C8A45A] hover:bg-[#D6B56D] text-[#4A0F1C] font-cinzel text-[0.7rem] tracking-[0.3em] uppercase py-3 rounded transition-colors font-semibold disabled:opacity-60">
          {loading ? 'Signing in\u2026' : 'Sign In'}
        </button>
        <div className="mt-6 flex items-center justify-center gap-2 font-inter text-xs text-[#4A0F1C]/50">
          <Lock size={12} strokeWidth={1.5} /> Secure admin session
        </div>
      </form>
    </div>
  )
}
