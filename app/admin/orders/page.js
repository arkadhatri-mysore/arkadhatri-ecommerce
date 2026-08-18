'use client'

import { useEffect, useState } from 'react'
import { Search, Truck, Save } from 'lucide-react'

const STATUSES = ['all', 'PAYMENT_PENDING', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'PAYMENT_FAILED', 'REFUND_INITIATED', 'REFUNDED']
const TONES = {
  PAYMENT_PENDING:  'bg-yellow-100 text-yellow-800',
  PAID:             'bg-blue-100 text-blue-800',
  PROCESSING:       'bg-blue-100 text-blue-800',
  PACKED:           'bg-purple-100 text-purple-800',
  SHIPPED:          'bg-indigo-100 text-indigo-800',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
  DELIVERED:        'bg-green-100 text-green-800',
  CANCELLED:        'bg-gray-200 text-gray-700',
  PAYMENT_FAILED:   'bg-red-100 text-red-800',
  REFUND_INITIATED: 'bg-amber-100 text-amber-900',
  REFUNDED:         'bg-red-100 text-red-800'
}

export default function Orders() {
  const [status, setStatus] = useState('all')
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => fetch(`/api/admin/orders?status=${status}`).then(r => r.json()).then(d => setItems(d.orders || []))
  useEffect(() => { load() }, [status])

  const patchOrder = async (id, patch) => {
    setSaving(true)
    const r = await fetch(`/api/admin/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
    const d = await r.json()
    setSaving(false)
    if (!r.ok) return alert(d.error || 'Update failed')
    if (d.order) setSelected(d.order)
    load()
    return d.order
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
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-full text-[0.6rem] font-cinzel tracking-[0.25em] uppercase transition-all ${status === s ? 'bg-[#4A0F1C] text-white' : 'bg-white border border-[#4A0F1C]/20 text-[#4A0F1C] hover:border-[#C8A45A]'}`}>{s.replace(/_/g,' ')}</button>
        ))}
      </div>

      <div className="bg-white border border-[#4A0F1C]/10 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#4A0F1C]/5">
            <tr>
              {['ORDER', 'CUSTOMER', 'DATE', 'TOTAL', 'PAYMENT', 'STATUS', 'SHIPPING', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/70">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan="8" className="p-8 text-center text-[#4A0F1C]/50 font-inter">No orders in this view.</td></tr> :
              items.map(o => (
                <tr key={o.id} className="border-t border-[#4A0F1C]/10 hover:bg-[#F7F3EB]/50">
                  <td className="px-4 py-3 font-cinzel text-xs text-[#4A0F1C]">#{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <div className="font-cormorant text-base text-[#4A0F1C]">{o.customer?.fullName || '—'}</div>
                    <div className="font-inter text-xs text-[#4A0F1C]/50">{o.customer?.email}</div>
                  </td>
                  <td className="px-4 py-3 font-inter text-xs text-[#4A0F1C]/70">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 font-inter text-[#4A0F1C]">₹ {inr.format(o.total || 0)}</td>
                  <td className="px-4 py-3 font-inter text-xs text-[#4A0F1C]/70">{o.paymentStatus || 'pending'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[0.55rem] font-cinzel tracking-[0.25em] uppercase whitespace-nowrap ${TONES[o.status] || 'bg-gray-100 text-gray-700'}`}>{(o.status || 'PAYMENT_PENDING').replace(/_/g,' ')}</span>
                  </td>
                  <td className="px-4 py-3 font-inter text-xs text-[#4A0F1C]/70">
                    {o.courier ? <span>{o.courier} · {o.awb || '—'}</span> : <span className="text-[#4A0F1C]/40">—</span>}
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
        <OrderDrawer order={selected} onClose={() => setSelected(null)} onPatch={patchOrder} saving={saving} />
      )}
    </div>
  )
}

function OrderDrawer({ order, onClose, onPatch, saving }) {
  const inr = new Intl.NumberFormat('en-IN')
  const [ship, setShip] = useState({
    courier: order.courier || '',
    awb: order.awb || '',
    trackingUrl: order.trackingUrl || '',
    shipmentStatus: order.shipmentStatus || ''
  })
  useEffect(() => {
    setShip({
      courier: order.courier || '',
      awb: order.awb || '',
      trackingUrl: order.trackingUrl || '',
      shipmentStatus: order.shipmentStatus || ''
    })
  }, [order.id])

  const saveShipping = async () => {
    await onPatch(order.id, ship)
  }
  const setStatus = (s) => onPatch(order.id, { status: s })
  const setPay = (s) => onPatch(order.id, { paymentStatus: s })

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded max-w-3xl w-full max-h-[92vh] overflow-y-auto">
        <div className="p-6 border-b border-[#4A0F1C]/10 flex items-center justify-between">
          <div>
            <div className="font-cinzel text-[0.6rem] tracking-[0.3em] text-[#C8A45A]">ORDER</div>
            <div className="font-cormorant text-2xl text-[#4A0F1C]">#{order.id.slice(0, 8).toUpperCase()}</div>
          </div>
          <button onClick={onClose} className="text-[#4A0F1C]/60 hover:text-[#4A0F1C]">Close</button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/60 mb-1">CUSTOMER</div>
              <div className="font-cormorant text-lg text-[#4A0F1C]">{order.customer?.fullName}</div>
              <div className="font-inter text-xs text-[#4A0F1C]/70">{order.customer?.email}</div>
              <div className="font-inter text-xs text-[#4A0F1C]/70">{order.customer?.mobile}</div>
            </div>
            <div>
              <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/60 mb-1">SHIP TO</div>
              <div className="font-inter text-sm text-[#4A0F1C]">
                {order.customer?.address1}<br />
                {order.customer?.address2 && <>{order.customer.address2}<br /></>}
                {order.customer?.city}, {order.customer?.state} {order.customer?.pincode}
              </div>
            </div>
          </div>

          <div className="border-t border-[#4A0F1C]/10 pt-4">
            <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/60 mb-2">ITEMS</div>
            {order.items?.map(it => (
              <div key={it.sku} className="flex justify-between py-1.5 text-sm border-b border-[#4A0F1C]/5">
                <div className="font-inter text-[#4A0F1C]">{it.name} <span className="text-[#4A0F1C]/50">× {it.qty}</span></div>
                <div className="font-cinzel text-xs">₹ {inr.format(it.price * it.qty)}</div>
              </div>
            ))}
            <div className="flex justify-between mt-3 font-cinzel text-lg text-[#4A0F1C]" style={{ fontWeight: 600 }}>
              <span>TOTAL</span><span>₹ {inr.format(order.total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#4A0F1C]/10">
            <label>
              <div className="font-inter text-xs text-[#4A0F1C]/70 mb-1">Order Status</div>
              <select value={order.status} onChange={e => setStatus(e.target.value)} className="w-full border border-[#4A0F1C]/20 rounded px-3 py-2 text-sm">
                {STATUSES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>
              <div className="font-inter text-xs text-[#4A0F1C]/70 mb-1">Payment Status</div>
              <select value={order.paymentStatus || 'pending'} onChange={e => setPay(e.target.value)} className="w-full border border-[#4A0F1C]/20 rounded px-3 py-2 text-sm">
                {['pending','paid','failed','refunded'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>

          {/* Shipping fields */}
          <div className="border-t border-[#4A0F1C]/10 pt-4">
            <div className="flex items-center gap-2 font-cinzel text-[0.55rem] tracking-[0.3em] text-[#4A0F1C]/70 mb-3"><Truck size={13} strokeWidth={1.5} className="text-[#C8A45A]"/> SHIPPING & TRACKING</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label>
                <div className="font-inter text-xs text-[#4A0F1C]/70 mb-1">Courier</div>
                <input value={ship.courier} onChange={e => setShip({...ship, courier: e.target.value})} placeholder="Delhivery / DTDC / Blue Dart" className="w-full border border-[#4A0F1C]/20 rounded px-3 py-2" />
              </label>
              <label>
                <div className="font-inter text-xs text-[#4A0F1C]/70 mb-1">AWB / Tracking Number</div>
                <input value={ship.awb} onChange={e => setShip({...ship, awb: e.target.value})} className="w-full border border-[#4A0F1C]/20 rounded px-3 py-2" />
              </label>
              <label className="col-span-2">
                <div className="font-inter text-xs text-[#4A0F1C]/70 mb-1">Tracking URL</div>
                <input value={ship.trackingUrl} onChange={e => setShip({...ship, trackingUrl: e.target.value})} placeholder="https://..." className="w-full border border-[#4A0F1C]/20 rounded px-3 py-2" />
              </label>
              <label className="col-span-2">
                <div className="font-inter text-xs text-[#4A0F1C]/70 mb-1">Shipment Status (courier's status text)</div>
                <input value={ship.shipmentStatus} onChange={e => setShip({...ship, shipmentStatus: e.target.value})} placeholder="e.g. In transit to Bengaluru hub" className="w-full border border-[#4A0F1C]/20 rounded px-3 py-2" />
              </label>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button disabled={saving} onClick={saveShipping} className="inline-flex items-center gap-1 bg-[#C8A45A] text-[#4A0F1C] font-cinzel text-[0.55rem] tracking-[0.3em] uppercase font-semibold px-4 py-2 rounded disabled:opacity-60">
                <Save size={12} /> {saving ? 'Saving…' : 'Save Shipping'}
              </button>
              <span className="font-inter text-xs text-[#4A0F1C]/60">Marking status as SHIPPED / DELIVERED triggers a customer email if SMTP is configured.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
