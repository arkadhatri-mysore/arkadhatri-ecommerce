'use client'
import { useEffect, useState } from 'react'
export default function Contacts() {
  const [items, setItems] = useState([])
  useEffect(() => { fetch('/api/admin/contacts').then(r => r.json()).then(d => setItems(d.contacts || [])) }, [])
  return (
    <div>
      <h1 className="font-cormorant text-3xl text-[#4A0F1C] mb-6">Contact Enquiries</h1>
      <div className="space-y-3">
        {items.length === 0 ? <div className="p-8 text-center text-[#4A0F1C]/50 bg-white border border-[#4A0F1C]/10 rounded">No enquiries yet.</div> :
          items.map(m => (
            <div key={m.id} className="bg-white border border-[#4A0F1C]/10 rounded p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-cormorant text-lg text-[#4A0F1C]">{m.name || 'Anonymous'}</div>
                  <div className="font-inter text-xs text-[#4A0F1C]/60">{m.email}</div>
                </div>
                <div className="font-inter text-xs text-[#4A0F1C]/50">{m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}</div>
              </div>
              <p className="font-inter text-sm text-[#4A0F1C]/80 whitespace-pre-wrap">{m.message}</p>
            </div>
          ))}
      </div>
    </div>
  )
}
