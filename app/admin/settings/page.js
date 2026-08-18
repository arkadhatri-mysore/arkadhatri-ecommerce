'use client'
import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
export default function Settings() {
  const [s, setS] = useState({ businessName: 'ARKADHATRI', gst: '', shippingFlat: 250, freeShippingThreshold: 15000, contactEmail: 'hello@arkadhatri.com', contactPhone: '', whatsappNumber: '', instagram: '', youtube: '', pinterest: '', seoTitle: '', seoDescription: '' })
  const [saved, setSaved] = useState(false)
  useEffect(() => { fetch('/api/admin/settings').then(r => r.json()).then(d => d.settings && setS(prev => ({ ...prev, ...d.settings }))) }, [])
  const set = (k, v) => setS(prev => ({ ...prev, [k]: v }))
  const save = async () => {
    await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }
  const inp = 'w-full border border-[#4A0F1C]/20 rounded px-3 py-2 font-inter text-sm text-[#4A0F1C] focus:border-[#C8A45A] focus:outline-none'
  const Field = ({ label, k, type = 'text', placeholder }) => (
    <label className="block">
      <div className="font-inter text-xs text-[#4A0F1C]/70 mb-1.5">{label}</div>
      <input type={type} value={s[k] || ''} placeholder={placeholder} onChange={e => set(k, type === 'number' ? Number(e.target.value) : e.target.value)} className={inp} />
    </label>
  )
  const Card = ({ title, children }) => (
    <section className="bg-white border border-[#4A0F1C]/10 rounded p-6 mb-6">
      <div className="font-cinzel text-[0.62rem] tracking-[0.32em] text-[#C8A45A] mb-4">— {title.toUpperCase()}</div>
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </section>
  )
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-cormorant text-3xl text-[#4A0F1C]">Boutique Settings</h1>
        <button onClick={save} className="inline-flex items-center gap-2 bg-[#C8A45A] hover:bg-[#D6B56D] text-[#4A0F1C] font-cinzel text-[0.65rem] tracking-[0.3em] uppercase px-5 py-2.5 rounded font-semibold">
          <Save size={14} /> {saved ? 'Saved ✓' : 'Save Settings'}
        </button>
      </div>
      <Card title="Business Information">
        <Field label="Business Name" k="businessName" />
        <Field label="GSTIN" k="gst" placeholder="29XXXXX0000X1Z0" />
      </Card>
      <Card title="Shipping">
        <Field label="Flat Shipping Charge (\u20b9)" k="shippingFlat" type="number" />
        <Field label="Free Shipping Above (\u20b9)" k="freeShippingThreshold" type="number" />
      </Card>
      <Card title="Contact">
        <Field label="Contact Email" k="contactEmail" />
        <Field label="Contact Phone" k="contactPhone" />
        <Field label="WhatsApp Number" k="whatsappNumber" placeholder="+91XXXXXXXXXX" />
      </Card>
      <Card title="Social Links">
        <Field label="Instagram URL" k="instagram" />
        <Field label="YouTube URL" k="youtube" />
        <Field label="Pinterest URL" k="pinterest" />
      </Card>
      <Card title="SEO Defaults">
        <Field label="Default SEO Title" k="seoTitle" />
        <Field label="Default SEO Description" k="seoDescription" />
      </Card>
    </div>
  )
}
