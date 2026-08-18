'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { AlertTriangle, AlertCircle, CheckCircle2, Search, Save, Edit3 } from 'lucide-react'

const STATUS_TONES = {
  published: 'bg-green-100 text-green-800',
  draft: 'bg-gray-200 text-gray-700',
  hidden: 'bg-gray-800 text-white',
  'out-of-stock': 'bg-red-100 text-red-800'
}

export default function Inventory() {
  const [data, setData] = useState(null)
  const [threshold, setThreshold] = useState(3)
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState({}) // { [id]: newStockValue }
  const [saving, setSaving] = useState({})

  const load = () => fetch(`/api/admin/inventory?threshold=${threshold}`).then(r => r.json()).then(setData)
  useEffect(() => { load() }, [threshold])

  const filtered = useMemo(() => {
    if (!data?.products) return []
    if (!q) return data.products
    const s = q.toLowerCase()
    return data.products.filter(p => `${p.name} ${p.sku} ${p.fabricType} ${p.colourName || ''}`.toLowerCase().includes(s))
  }, [data, q])

  const startEdit = (p) => setEditing({ ...editing, [p.id]: String(p.stock ?? 0) })
  const cancelEdit = (id) => { const n = { ...editing }; delete n[id]; setEditing(n) }
  const saveStock = async (p) => {
    const val = Number(editing[p.id])
    if (Number.isNaN(val) || val < 0) return alert('Enter a valid stock number.')
    setSaving({ ...saving, [p.id]: true })
    await fetch(`/api/admin/products/${p.id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: val, status: val === 0 ? 'out-of-stock' : 'published' })
    })
    cancelEdit(p.id)
    setSaving({ ...saving, [p.id]: false })
    load()
  }

  const stockTone = (s) => {
    if ((s ?? 0) <= 0) return 'text-red-700 bg-red-50 border-red-200'
    if ((s ?? 0) <= threshold) return 'text-amber-800 bg-amber-50 border-amber-200'
    return 'text-green-800 bg-green-50 border-green-200'
  }

  const t = data?.totals || {}
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-cormorant text-3xl text-[#4A0F1C]">Inventory</h1>
        <p className="font-inter text-sm text-[#4A0F1C]/60 mt-1">Live stock levels across the atelier. Adjust stock inline; out-of-stock pieces auto-hide from the boutique.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-5 bg-white border border-[#4A0F1C]/10 rounded">
          <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/60">ALL PIECES</div>
          <div className="font-cinzel text-3xl text-[#4A0F1C] mt-2" style={{fontWeight:600}}>{t.all ?? '—'}</div>
        </div>
        <div className="p-5 bg-red-50 border border-red-200 rounded">
          <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-red-700 flex items-center gap-1"><AlertCircle size={11}/> OUT OF STOCK</div>
          <div className="font-cinzel text-3xl text-red-800 mt-2" style={{fontWeight:600}}>{t.outOfStock ?? 0}</div>
        </div>
        <div className="p-5 bg-amber-50 border border-amber-200 rounded">
          <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-amber-800 flex items-center gap-1"><AlertTriangle size={11}/> LOW STOCK</div>
          <div className="font-cinzel text-3xl text-amber-900 mt-2" style={{fontWeight:600}}>{t.lowStock ?? 0}</div>
        </div>
        <div className="p-5 bg-green-50 border border-green-200 rounded">
          <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-green-800 flex items-center gap-1"><CheckCircle2 size={11}/> HEALTHY</div>
          <div className="font-cinzel text-3xl text-green-900 mt-2" style={{fontWeight:600}}>{t.healthy ?? 0}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-[#4A0F1C]/10 rounded p-4 mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <Search size={14} className="text-[#4A0F1C]/50" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, SKU, fabric, colour..." className="flex-1 outline-none font-inter text-sm text-[#4A0F1C] placeholder:text-[#4A0F1C]/40" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/60">LOW-STOCK THRESHOLD</span>
          <input type="number" min={0} value={threshold} onChange={e => setThreshold(Math.max(0, Number(e.target.value) || 0))} className="w-16 border border-[#4A0F1C]/20 rounded px-2 py-1 font-inter text-sm text-[#4A0F1C] focus:border-[#C8A45A] focus:outline-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#4A0F1C]/10 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#4A0F1C]/5">
            <tr>
              {['PRODUCT','SKU','PRICE','STOCK','STATUS','ACTIONS'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/70">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!data ? <tr><td colSpan="6" className="p-8 text-center text-[#4A0F1C]/50">Loading…</td></tr> :
              filtered.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-[#4A0F1C]/50">No products match.</td></tr> :
              filtered.map(p => {
                const isEditing = editing[p.id] !== undefined
                const inr = new Intl.NumberFormat('en-IN')
                return (
                  <tr key={p.id} className="border-t border-[#4A0F1C]/10 hover:bg-[#F7F3EB]/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-12 object-cover rounded-sm" />}
                        <div>
                          <div className="font-cormorant text-base text-[#4A0F1C]">{p.name}</div>
                          <div className="font-inter text-xs text-[#4A0F1C]/50">{p.fabricType} · {p.colourName || p.colourFamily || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-cinzel text-xs text-[#4A0F1C]/70">{p.sku}</td>
                    <td className="px-4 py-3 font-inter text-[#4A0F1C]">₹ {inr.format(p.price || 0)}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input type="number" min={0} value={editing[p.id]} onChange={e => setEditing({...editing, [p.id]: e.target.value})} className={`w-20 border rounded px-2 py-1 font-inter text-sm focus:outline-none focus:border-[#C8A45A] ${stockTone(Number(editing[p.id]))}`} />
                      ) : (
                        <span className={`inline-flex items-center gap-1 border rounded px-2 py-1 font-cinzel text-sm ${stockTone(p.stock)}`} style={{fontWeight:600}}>
                          {p.stock ?? 0}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[0.55rem] font-cinzel tracking-[0.25em] uppercase ${STATUS_TONES[p.status] || STATUS_TONES.draft}`}>{p.status || 'draft'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button disabled={!!saving[p.id]} onClick={() => saveStock(p)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#C8A45A] text-[#4A0F1C] font-cinzel text-[0.55rem] tracking-[0.3em] uppercase font-semibold disabled:opacity-60">
                              <Save size={12} /> {saving[p.id] ? 'Saving…' : 'Save'}
                            </button>
                            <button onClick={() => cancelEdit(p.id)} className="text-xs text-[#4A0F1C]/60 hover:text-[#4A0F1C] font-inter">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(p)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-[#4A0F1C]/20 text-[#4A0F1C] hover:border-[#C8A45A] hover:text-[#C8A45A] font-cinzel text-[0.55rem] tracking-[0.3em] uppercase">
                              <Edit3 size={12} /> Adjust
                            </button>
                            <Link href={`/admin/products/${p.id}`} className="text-xs text-[#4A0F1C]/60 hover:text-[#C8A45A] font-inter">Full edit</Link>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
