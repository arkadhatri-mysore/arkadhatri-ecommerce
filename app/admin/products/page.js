'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search } from 'lucide-react'

const STATUS_TONES = {
  published: 'bg-green-100 text-green-800',
  draft: 'bg-gray-200 text-gray-700',
  hidden: 'bg-gray-800 text-white',
  'out-of-stock': 'bg-red-100 text-red-800'
}

export default function ProductsList() {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => fetch('/api/admin/products').then(r => r.json()).then(d => { setItems(d.products || []); setLoading(false) })
  useEffect(() => { load() }, [])

  const del = async (id) => {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    load()
  }

  const filtered = items.filter(p => !q || `${p.name} ${p.sku} ${p.fabricType}`.toLowerCase().includes(q.toLowerCase()))
  const inr = new Intl.NumberFormat('en-IN')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cormorant text-3xl text-[#4A0F1C]">Products</h1>
          <p className="font-inter text-sm text-[#4A0F1C]/60 mt-1">{items.length} pieces in the catalogue.</p>
        </div>
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 bg-[#C8A45A] hover:bg-[#D6B56D] text-[#4A0F1C] font-cinzel text-[0.65rem] tracking-[0.3em] uppercase px-5 py-2.5 rounded transition-colors font-semibold">
          <Plus size={14} strokeWidth={1.6} /> Add Product
        </Link>
      </div>

      <div className="bg-white border border-[#4A0F1C]/10 rounded overflow-hidden">
        <div className="p-4 border-b border-[#4A0F1C]/10 flex items-center gap-2">
          <Search size={14} strokeWidth={1.4} className="text-[#4A0F1C]/50" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, SKU, fabric..." className="flex-1 outline-none font-inter text-sm text-[#4A0F1C] placeholder:text-[#4A0F1C]/40" />
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#4A0F1C]/5">
            <tr>
              <th className="text-left px-4 py-3 font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/70">PRODUCT</th>
              <th className="text-left px-4 py-3 font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/70">SKU</th>
              <th className="text-left px-4 py-3 font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/70">PRICE</th>
              <th className="text-left px-4 py-3 font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/70">STOCK</th>
              <th className="text-left px-4 py-3 font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/70">STATUS</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="6" className="p-8 text-center text-[#4A0F1C]/50 font-inter">Loading\u2026</td></tr> :
              filtered.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-[#4A0F1C]/50 font-inter">No products found.</td></tr> :
              filtered.map(p => (
                <tr key={p.id} className="border-t border-[#4A0F1C]/10 hover:bg-[#F7F3EB]/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-12 object-cover rounded-sm" />}
                      <div>
                        <div className="font-cormorant text-base text-[#4A0F1C]">{p.name}</div>
                        <div className="font-inter text-xs text-[#4A0F1C]/50">{p.fabricType} · {p.colourName || p.colourFamily}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-cinzel text-xs text-[#4A0F1C]/70">{p.sku}</td>
                  <td className="px-4 py-3 font-inter text-[#4A0F1C]">\u20b9 {inr.format(p.price || 0)}</td>
                  <td className="px-4 py-3 font-inter text-[#4A0F1C]">{p.stock ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[0.55rem] font-cinzel tracking-[0.25em] uppercase ${STATUS_TONES[p.status] || STATUS_TONES.draft}`}>{p.status || 'draft'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <Link href={`/admin/products/${p.id}`} className="p-1.5 hover:bg-[#C8A45A]/10 text-[#4A0F1C]/70 hover:text-[#C8A45A] rounded transition-colors"><Edit size={14} strokeWidth={1.5} /></Link>
                      <button onClick={() => del(p.id)} className="p-1.5 hover:bg-red-50 text-[#4A0F1C]/70 hover:text-red-700 rounded transition-colors"><Trash2 size={14} strokeWidth={1.5} /></button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
