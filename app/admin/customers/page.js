'use client'
import { useEffect, useState } from 'react'
export default function Customers() {
  const [items, setItems] = useState([])
  useEffect(() => { fetch('/api/admin/customers').then(r => r.json()).then(d => setItems(d.customers || [])) }, [])
  const inr = new Intl.NumberFormat('en-IN')
  return (
    <div>
      <h1 className="font-cormorant text-3xl text-[#4A0F1C] mb-6">Customers</h1>
      <div className="bg-white border border-[#4A0F1C]/10 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#4A0F1C]/5"><tr>{['NAME','EMAIL','PHONE','ORDERS','TOTAL SPEND'].map(h => <th key={h} className="text-left px-4 py-3 font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/70">{h}</th>)}</tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-[#4A0F1C]/50">No customers yet.</td></tr> :
              items.map(c => (
                <tr key={c.email} className="border-t border-[#4A0F1C]/10 hover:bg-[#F7F3EB]/50">
                  <td className="px-4 py-3 font-cormorant text-[#4A0F1C]">{c.name}</td>
                  <td className="px-4 py-3 font-inter text-xs text-[#4A0F1C]/70">{c.email}</td>
                  <td className="px-4 py-3 font-inter text-xs text-[#4A0F1C]/70">{c.phone}</td>
                  <td className="px-4 py-3 font-cinzel text-[#4A0F1C]">{c.orders}</td>
                  <td className="px-4 py-3 font-cinzel text-[#4A0F1C]">\u20b9 {inr.format(c.spend || 0)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
