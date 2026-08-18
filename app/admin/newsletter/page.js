'use client'
import { useEffect, useState } from 'react'
export default function Newsletter() {
  const [items, setItems] = useState([])
  useEffect(() => { fetch('/api/admin/newsletter').then(r => r.json()).then(d => setItems(d.subscribers || [])) }, [])
  const copy = () => { navigator.clipboard.writeText(items.map(i => i.email).join('\n')); alert('Copied ' + items.length + ' emails') }
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-cormorant text-3xl text-[#4A0F1C]">Newsletter Subscribers</h1>
        {items.length > 0 && <button onClick={copy} className="bg-[#4A0F1C] text-white font-cinzel text-[0.6rem] tracking-[0.3em] uppercase px-4 py-2 rounded">Copy Emails</button>}
      </div>
      <div className="bg-white border border-[#4A0F1C]/10 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#4A0F1C]/5"><tr>{['EMAIL','SUBSCRIBED'].map(h => <th key={h} className="text-left px-4 py-3 font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/70">{h}</th>)}</tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan="2" className="p-8 text-center text-[#4A0F1C]/50">No subscribers yet.</td></tr> :
              items.map(s => <tr key={s.email} className="border-t border-[#4A0F1C]/10"><td className="px-4 py-3 font-inter text-[#4A0F1C]">{s.email}</td><td className="px-4 py-3 font-inter text-xs text-[#4A0F1C]/60">{s.subscribedAt ? new Date(s.subscribedAt).toLocaleString() : '—'}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
