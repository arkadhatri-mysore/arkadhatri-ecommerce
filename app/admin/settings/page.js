'use client'
import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { PasswordCard, EmailCard } from '@/components/admin/SecurityEmailPanel'
import { ImageUploader } from '@/components/admin/MediaUpload'
export default function Settings() {
  const [s, setS] = useState({ businessName: 'ARKADHATRI', gst: '', shippingFlat: 250, freeShippingThreshold: 15000, contactEmail: 'hello@arkadhatri.com', contactPhone: '', whatsappNumber: '', instagram: '', youtube: '', pinterest: '', facebook: '', seoTitle: '', seoDescription: '', heroHeadline: '', heroSubtitle: '', heroCtaLabel: '', heroImage: '', storyTitle: '', storyText: '', trackingEnabled: false, ga4Id: '', googleAdsId: '', metaPixelId: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  useEffect(() => { fetch('/api/admin/settings').then(r => r.json()).then(d => d.settings && setS(prev => ({ ...prev, ...d.settings }))) }, [])
  const set = (k, v) => setS(prev => ({ ...prev, [k]: v }))
  const save = async () => {
    setErr(''); setBusy(true)
    try {
      const r = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || 'Could not save settings')
      setSaved(true); setTimeout(() => setSaved(false), 4000)
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }
  const inp = 'w-full border border-[#4A0F1C]/20 rounded px-3 py-2 font-inter text-sm text-[#4A0F1C] focus:border-[#C8A45A] focus:outline-none'
  const field = ({ label, k, type = 'text', placeholder }) => (
    <label className="block">
      <div className="font-inter text-xs text-[#4A0F1C]/70 mb-1.5">{label}</div>
      <input type={type} value={s[k] || ''} placeholder={placeholder} onChange={e => set(k, type === 'number' ? Number(e.target.value) : e.target.value)} className={inp} />
    </label>
  )
  const card = (title, children) => (
    <section className="bg-white border border-[#4A0F1C]/10 rounded p-6 mb-6">
      <div className="font-cinzel text-[0.62rem] tracking-[0.32em] text-[#C8A45A] mb-4">— {title.toUpperCase()}</div>
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </section>
  )
  const area = ({ label, k, rows = 4, max }) => (
    <label className="block md:col-span-2">
      <div className="font-inter text-xs text-[#4A0F1C]/70 mb-1.5">{label}</div>
      <textarea rows={rows} maxLength={max} value={s[k] || ''} onChange={e => set(k, e.target.value)} className={inp} />
    </label>
  )
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-cormorant text-3xl text-[#4A0F1C]">Boutique Settings</h1>
        <button onClick={save} className="inline-flex items-center gap-2 bg-[#C8A45A] hover:bg-[#D6B56D] text-[#4A0F1C] font-cinzel text-[0.65rem] tracking-[0.3em] uppercase px-5 py-2.5 rounded font-semibold">
          <Save size={14} /> {busy ? 'Saving…' : saved ? 'Saved ✓' : 'Save Settings'}
        </button>
      </div>
      {saved && <p data-testid="settings-saved" role="status" className="mb-4 font-inter text-sm text-green-800 bg-green-50 border border-green-200 rounded px-3 py-2">Saved. The shop shows the changes within about 30 seconds.</p>}
      {err && <p data-testid="settings-error" role="alert" className="mb-4 font-inter text-sm text-red-800 bg-red-50 border border-red-200 rounded px-3 py-2">{err}</p>}
      {card('Homepage', <>
        {field({ label: 'Hero headline (leave empty for the default)', k: 'heroHeadline' })}
        {field({ label: 'Hero button label', k: 'heroCtaLabel', placeholder: 'Shop Sarees' })}
        {area({ label: 'Hero subtitle', k: 'heroSubtitle', rows: 2, max: 240 })}
        <div className="md:col-span-2">
          {field({ label: 'Hero photo (https link or upload below)', k: 'heroImage' })}
          {s.heroImage && <img src={s.heroImage} alt="" className="mt-2 h-28 w-24 object-cover rounded" />}
          <div className="mt-2"><ImageUploader onUploaded={(url) => set('heroImage', url)} /></div>
        </div>
        {field({ label: 'Our story title', k: 'storyTitle' })}
        {area({ label: 'Our story text', k: 'storyText', rows: 5, max: 1200 })}
      </>)}
      {card('Business Information', <>
        {field({ label: 'Business Name', k: 'businessName' })}
        {field({ label: 'GSTIN', k: 'gst', placeholder: '29XXXXX0000X1Z0' })}
      </>)}
      {card('Shipping', <>
        {field({ label: 'Flat Shipping Charge (₹)', k: 'shippingFlat', type: 'number' })}
        {field({ label: 'Free Shipping Above (₹)', k: 'freeShippingThreshold', type: 'number' })}
      </>)}
      {card('Contact', <>
        {field({ label: 'Contact Email', k: 'contactEmail' })}
        {field({ label: 'Contact Phone', k: 'contactPhone' })}
        {field({ label: 'WhatsApp Number', k: 'whatsappNumber', placeholder: '+91XXXXXXXXXX' })}
      </>)}
      {card('Social Links', <>
        {field({ label: 'Instagram URL', k: 'instagram' })}
        {field({ label: 'YouTube URL', k: 'youtube' })}
        {field({ label: 'Pinterest URL', k: 'pinterest' })}
        {field({ label: 'Facebook URL', k: 'facebook' })}
      </>)}
      {card('Analytics & Ads (off until you add IDs and switch on)', <>
        <label className="md:col-span-2 flex items-center gap-2 font-inter text-sm text-[#4A0F1C]">
          <input type="checkbox" data-testid="tracking-enabled" checked={!!s.trackingEnabled} onChange={e => set('trackingEnabled', e.target.checked)} /> Enable tracking (visitors are asked for consent first; nothing loads if they decline)
        </label>
        {field({ label: 'Google Analytics 4 ID', k: 'ga4Id', placeholder: 'G-XXXXXXXXXX' })}
        {field({ label: 'Google Ads ID', k: 'googleAdsId', placeholder: 'AW-123456789' })}
        {field({ label: 'Meta Pixel ID', k: 'metaPixelId', placeholder: '123456789012345' })}
      </>)}
      {card('SEO Defaults', <>
        {field({ label: 'Default SEO Title', k: 'seoTitle' })}
        {field({ label: 'Default SEO Description', k: 'seoDescription' })}
      </>)}
      <PasswordCard />
      <EmailCard />
    </div>
  )
}
