'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

const STATUSES = ['all', 'received', 'pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded']
const TONES = {
  received: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  packed: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-700',
  refunded: 'bg-red-100 text-red-800'
}

export default function Orders() {
  const [status, setStatus] = useState('all')
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)

  const load = () => fetch(`/api/admin/orders?status=${status}`).then(r => r.json()).then(d => setItems(d.orders || []))
  useEffect(() => { load() }, [status])

  const updateOrder = async (id, patch) => {
    await fetch(`/api/admin/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
    load()
    if (selected?.id === id) setSelected({ ...selected, ...patch })
  }

  const inr = new Intl.NumberFormat('en-IN')

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-cormorant text-3xl text-[#4A0F1C]">Orders</h1>
        <p className="font-inter text-sm text-[#4A0F1C]/60 mt-1">{items.length} order{items.length === 1 ? '' : 's'} in this view.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-cinzel tracking-[0.25em] uppercase transition-all ${status === s ? 'bg-[#4A0F1C] text-white' : 'bg-white border border-[#4A0F1C]/20 text-[#4A0F1C] hover:border-[#C8A45A]'}`}>{s}</button>
        ))}
      </div>

      <div className="bg-white border border-[#4A0F1C]/10 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#4A0F1C]/5">
            <tr>
              {['ORDER', 'CUSTOMER', 'DATE', 'TOTAL', 'PAYMENT', 'STATUS', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/70">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan="7" className="p-8 text-center text-[#4A0F1C]/50 font-inter">No orders in this view.</td></tr> :
              items.map(o => (
                <tr key={o.id} className="border-t border-[#4A0F1C]/10 hover:bg-[#F7F3EB]/50">
                  <td className="px-4 py-3 font-cinzel text-xs text-[#4A0F1C]">#{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <div className="font-cormorant text-base text-[#4A0F1C]">{o.customer?.fullName || '—'}</div>
                    <div className="font-inter text-xs text-[#4A0F1C]/50">{o.customer?.email}</div>
                  </td>
                  <td className="px-4 py-3 font-inter text-xs text-[#4A0F1C]/70">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 font-inter text-[#4A0F1C]">\u20b9 {inr.format(o.total || 0)}</td>
                  <td className="px-4 py-3 font-inter text-xs text-[#4A0F1C]/70">{o.paymentStatus || 'pending'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[0.55rem] font-cinzel tracking-[0.25em] uppercase ${TONES[o.status] || 'bg-gray-100 text-gray-700'}`}>{o.status || 'received'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelected(o)} className="text-[#C8A45A] font-cinzel text-[0.55rem] tracking-[0.3em] hover:text-[#4A0F1C]">VIEW →</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div onClick={e => e.stopPropagation()} className="bg-white rounded max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#4A0F1C]/10 flex items-center justify-between">
              <div>
                <div className="font-cinzel text-[0.6rem] tracking-[0.3em] text-[#C8A45A]">ORDER</div>
                <div className="font-cormorant text-2xl text-[#4A0F1C]">#{selected.id.slice(0, 8).toUpperCase()}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#4A0F1C]/60 hover:text-[#4A0F1C]">Close</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/60 mb-1">CUSTOMER</div>
                  <div className="font-cormorant text-lg text-[#4A0F1C]">{selected.customer?.fullName}</div>
                  <div className="font-inter text-xs text-[#4A0F1C]/70">{selected.customer?.email}</div>
                  <div className="font-inter text-xs text-[#4A0F1C]/70">{selected.customer?.mobile}</div>
                </div>
                <div>
                  <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/60 mb-1">SHIP TO</div>
                  <div className="font-inter text-sm text-[#4A0F1C]">
                    {selected.customer?.address1}<br />
                    {selected.customer?.address2 && <>{selected.customer.address2}<br /></>}
                    {selected.customer?.city}, {selected.customer?.state} {selected.customer?.pincode}
                  </div>
                </div>
              </div>
              <div className="border-t border-[#4A0F1C]/10 pt-4">
                <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/60 mb-2">ITEMS</div>
                {selected.items?.map(it => (
                  <div key={it.sku} className="flex justify-between py-1.5 text-sm border-b border-[#4A0F1C]/5">
                    <div className="font-inter text-[#4A0F1C]">{it.name} <span className="text-[#4A0F1C]/50">× {it.qty}</span></div>
                    <div className="font-cinzel text-xs">\u20b9 {inr.format(it.price * it.qty)}</div>
                  </div>
                ))}
                <div className="flex justify-between mt-3 font-cinzel text-lg text-[#4A0F1C]" style={{ fontWeight: 600 }}>
                  <span>TOTAL</span><span>\u20b9 {inr.format(selected.total)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#4A0F1C]/10">
                <label>
                  <div className="font-inter text-xs text-[#4A0F1C]/70 mb-1">Order Status</div>
                  <select value={selected.status} onChange={e => updateOrder(selected.id, { status: e.target.value })} className="w-full border border-[#4A0F1C]/20 rounded px-3 py-2 text-sm">
                    {STATUSES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label>
                  <div className="font-inter text-xs text-[#4A0F1C]/70 mb-1">Payment Status</div>
                  <select value={selected.paymentStatus || 'pending'} onChange={e => updateOrder(selected.id, { paymentStatus: e.target.value })} className="w-full border border-[#4A0F1C]/20 rounded px-3 py-2 text-sm">
                    {['pending', 'paid', 'refunded', 'failed'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
