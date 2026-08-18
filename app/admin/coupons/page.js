'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
export default function Coupons() {
  const [items, setItems] = useState([])
  const [f, setF] = useState({ code: '', type: 'percentage', value: 10, minPurchase: 0, expiryDate: '', usageLimit: 100 })
  const load = () => fetch('/api/admin/coupons').then(r => r.json()).then(d => setItems(d.coupons || []))
  useEffect(() => { load() }, [])
  const create = async () => {
    if (!f.code) return alert('Coupon code required')
    await fetch('/api/admin/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) })
    setF({ code: '', type: 'percentage', value: 10, minPurchase: 0, expiryDate: '', usageLimit: 100 }); load()
  }
  const del = async (id) => { await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' }); load() }
  const inp = 'w-full border border-[#4A0F1C]/20 rounded px-3 py-2 font-inter text-sm text-[#4A0F1C] focus:border-[#C8A45A] focus:outline-none'
  return (
    <div>
      <h1 className="font-cormorant text-3xl text-[#4A0F1C] mb-6">Coupons</h1>
      <div className="bg-white border border-[#4A0F1C]/10 rounded p-6 mb-6">
        <div className="font-cinzel text-[0.6rem] tracking-[0.32em] text-[#C8A45A] mb-4">— CREATE NEW COUPON</div>
        <div className="grid md:grid-cols-6 gap-3">
          <input placeholder="CODE" value={f.code} onChange={e => setF({...f, code: e.target.value})} className={inp} />
          <select value={f.type} onChange={e => setF({...f, type: e.target.value})} className={inp}><option value="percentage">% off</option><option value="flat">Flat \u20b9</option></select>
          <input type="number" placeholder="Value" value={f.value} onChange={e => setF({...f, value: Number(e.target.value)})} className={inp} />
          <input type="number" placeholder="Min \u20b9" value={f.minPurchase} onChange={e => setF({...f, minPurchase: Number(e.target.value)})} className={inp} />
          <input type="date" value={f.expiryDate} onChange={e => setF({...f, expiryDate: e.target.value})} className={inp} />
          <button onClick={create} className="bg-[#C8A45A] text-[#4A0F1C] font-cinzel text-[0.6rem] tracking-[0.3em] uppercase rounded font-semibold">Create</button>
        </div>
      </div>
      <div className="bg-white border border-[#4A0F1C]/10 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#4A0F1C]/5"><tr>{['CODE','TYPE','VALUE','MIN','EXPIRY','USED','']. map(h => <th key={h} className="text-left px-4 py-3 font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/70">{h}</th>)}</tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan="7" className="p-8 text-center text-[#4A0F1C]/50">No coupons yet.</td></tr> :
              items.map(c => (
                <tr key={c.id} className="border-t border-[#4A0F1C]/10">
                  <td className="px-4 py-3 font-cinzel text-[#4A0F1C]" style={{fontWeight:600}}>{c.code}</td>
                  <td className="px-4 py-3 font-inter">{c.type}</td>
                  <td className="px-4 py-3 font-inter">{c.type === 'percentage' ? `${c.value}%` : `\u20b9 ${c.value}`}</td>
                  <td className="px-4 py-3 font-inter">\u20b9 {c.minPurchase || 0}</td>
                  <td className="px-4 py-3 font-inter text-xs">{c.expiryDate || '—'}</td>
                  <td className="px-4 py-3 font-inter">{c.used || 0}/{c.usageLimit || '∞'}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => del(c.id)} className="text-red-700"><Trash2 size={14} /></button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
