'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, ShoppingBag, TrendingUp, IndianRupee, Mail, MessageSquare, AlertCircle, CheckCircle, AlertTriangle, Boxes } from 'lucide-react'

const Card = ({ icon: I, label, value, sub, tone = 'default' }) => {
  const tones = {
    default: 'bg-white text-[#4A0F1C] border-[#4A0F1C]/10',
    gold:    'bg-[#C8A45A]/10 text-[#4A0F1C] border-[#C8A45A]/40',
    dark:    'bg-[#1a0508] text-white border-[#1a0508]'
  }
  return (
    <div className={`p-6 rounded border ${tones[tone]}`}>
      <div className="flex items-start justify-between mb-4">
        <I size={20} strokeWidth={1.5} className={tone === 'dark' ? 'text-[#C8A45A]' : 'text-[#C8A45A]'} />
        {sub && <span className={`text-xs font-inter ${tone === 'dark' ? 'text-white/60' : 'text-[#4A0F1C]/60'}`}>{sub}</span>}
      </div>
      <div className="font-cinzel text-2xl md:text-3xl" style={{ fontWeight: 600 }}>{value}</div>
      <div className={`font-inter text-xs mt-1 ${tone === 'dark' ? 'text-white/70' : 'text-[#4A0F1C]/70'}`}>{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const [d, setD] = useState(null)
  const [inv, setInv] = useState(null)
  useEffect(() => {
    fetch('/api/admin/dashboard').then(r => r.json()).then(setD)
    fetch('/api/admin/inventory?threshold=3').then(r => r.json()).then(setInv)
  }, [])
  if (!d) return <div className="font-inter text-sm text-[#4A0F1C]/60">Loading dashboard\u2026</div>

  const inr = new Intl.NumberFormat('en-IN')
  // Merge out-of-stock + low-stock, ascending
  const alerts = (inv?.products || [])
    .filter(p => (p.stock ?? 0) <= (inv?.threshold ?? 3))
    .slice(0, 6)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-cormorant text-3xl text-[#4A0F1C]">Overview</h1>
        <p className="font-inter text-sm text-[#4A0F1C]/60 mt-1">A quick snapshot of your boutique.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card icon={IndianRupee}  label="Total Revenue"      value={`\u20b9 ${inr.format(d.revenue || 0)}`} tone="dark" />
        <Card icon={ShoppingBag}  label="Total Orders"       value={d.orders || 0} />
        <Card icon={AlertCircle}  label="Pending Orders"     value={d.pending || 0} tone="gold" />
        <Card icon={Package}      label="Total Products"     value={d.products || 0} />
        <Card icon={CheckCircle}  label="Active Products"    value={d.active || 0} sub="published" />
        <Card icon={AlertCircle}  label="Out of Stock"       value={d.outOfStock || 0} />
        <Card icon={Mail}         label="Newsletter Subs"    value={d.subscribers || 0} />
        <Card icon={MessageSquare} label="Contact Enquiries" value={d.contacts || 0} />
      </div>

      {/* Low stock alert panel */}
      {alerts.length > 0 && (
        <div className="mb-6 border border-amber-200 bg-amber-50 rounded overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2 font-cinzel text-[0.6rem] tracking-[0.32em] text-amber-900">
              <AlertTriangle size={13} strokeWidth={1.6} />
              STOCK ALERTS <span className="text-amber-700/70">({alerts.length})</span>
            </div>
            <Link href="/admin/inventory" className="font-inter text-xs text-amber-900 hover:underline">Manage inventory \u2192</Link>
          </div>
          <div className="divide-y divide-amber-200/60">
            {alerts.map(p => {
              const oos = (p.stock ?? 0) <= 0
              return (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  {p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-12 object-cover rounded-sm" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-cormorant text-base text-[#4A0F1C] truncate">{p.name}</div>
                    <div className="font-inter text-xs text-[#4A0F1C]/60">{p.sku} \u00b7 {p.fabricType}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-[0.55rem] font-cinzel tracking-[0.25em] uppercase ${oos ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'}`}>
                    {oos ? 'OUT OF STOCK' : `LOW \u00b7 ${p.stock}`}
                  </span>
                  <Link href={`/admin/inventory`} className="font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/70 hover:text-[#C8A45A]">ADJUST</Link>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/admin/products" className="p-6 bg-white border border-[#4A0F1C]/10 rounded hover:border-[#C8A45A] transition-colors">
          <Package size={20} strokeWidth={1.4} className="text-[#C8A45A]" />
          <div className="font-cormorant text-xl text-[#4A0F1C] mt-3">Manage Products</div>
          <div className="font-inter text-xs text-[#4A0F1C]/60 mt-1">Add, edit and organise sarees</div>
        </Link>
        <Link href="/admin/inventory" className="p-6 bg-white border border-[#4A0F1C]/10 rounded hover:border-[#C8A45A] transition-colors">
          <Boxes size={20} strokeWidth={1.4} className="text-[#C8A45A]" />
          <div className="font-cormorant text-xl text-[#4A0F1C] mt-3">Inventory</div>
          <div className="font-inter text-xs text-[#4A0F1C]/60 mt-1">Track stock and low-stock alerts</div>
        </Link>
        <Link href="/admin/orders" className="p-6 bg-white border border-[#4A0F1C]/10 rounded hover:border-[#C8A45A] transition-colors">
          <ShoppingBag size={20} strokeWidth={1.4} className="text-[#C8A45A]" />
          <div className="font-cormorant text-xl text-[#4A0F1C] mt-3">Process Orders</div>
          <div className="font-inter text-xs text-[#4A0F1C]/60 mt-1">View, update and fulfil orders</div>
        </Link>
      </div>
    </div>
  )
}
