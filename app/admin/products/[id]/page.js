'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Save, Plus, X } from 'lucide-react'

const STATUSES = ['draft', 'published', 'hidden', 'out-of-stock']
const COLLECTIONS = ['silk-sarees', 'wedding-sarees', 'festival-sarees', 'everyday-elegance', 'new-arrivals']

const empty = {
  name: '', sku: '', slug: '', tagline: '',
  price: 0, comparePrice: 0, stock: 0, status: 'draft',
  collection: 'silk-sarees', collectionName: 'Silk Sarees',
  fabricType: '', colourFamily: '', colourName: '',
  occasion: [], images: [],
  videoUrl: '', videoPoster: '',
  description: '',
  details: { Fabric: '', Colour: '', Occasion: '', 'Blouse Piece': '', 'Wash Care': '', Delivery: '', Returns: '' },
  weave: '', border: '', sareeLength: '',
  seoTitle: '', seoDescription: '', metaKeywords: '',
  tags: [], isNew: false, isBestseller: false, isTrending: false, isLimited: false
}

const Field = ({ label, children }) => (
  <label className="block">
    <div className="font-inter text-xs text-[#4A0F1C]/70 mb-1.5">{label}</div>
    {children}
  </label>
)

const inp = 'w-full border border-[#4A0F1C]/20 rounded px-3 py-2 font-inter text-sm text-[#4A0F1C] focus:border-[#C8A45A] focus:outline-none'

export default function ProductEditor() {
  const { id } = useParams()
  const router = useRouter()
  const isNew = id === 'new'
  const [p, setP] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [newImg, setNewImg] = useState('')
  const [tagsStr, setTagsStr] = useState('')

  useEffect(() => {
    if (isNew) return
    fetch(`/api/admin/products/${id}`).then(r => r.json()).then(d => {
      if (d.product) {
        setP({ ...empty, ...d.product, details: { ...empty.details, ...(d.product.details || {}) } })
        setTagsStr((d.product.tags || []).join(', '))
      }
    })
  }, [id, isNew])

  const set = (k, v) => setP(prev => ({ ...prev, [k]: v }))
  const setD = (k, v) => setP(prev => ({ ...prev, details: { ...prev.details, [k]: v } }))

  const save = async () => {
    setSaving(true)
    const body = { ...p, tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean) }
    if (!body.slug) body.slug = body.name.toLowerCase().replace(/\s+/g, '-')
    const url = isNew ? '/api/admin/products' : `/api/admin/products/${id}`
    const method = isNew ? 'POST' : 'PUT'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaving(false)
    if (r.ok) router.push('/admin/products')
    else { const d = await r.json(); alert(d.error || 'Save failed') }
  }

  const addImg = () => { if (newImg) { set('images', [...p.images, newImg]); setNewImg('') } }
  const rmImg = (i) => set('images', p.images.filter((_, x) => x !== i))
  const moveImg = (i, dir) => {
    const arr = [...p.images]; const j = i + dir
    if (j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    set('images', arr)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/products" className="flex items-center gap-2 text-[#4A0F1C]/70 hover:text-[#C8A45A] transition-colors">
          <ArrowLeft size={16} strokeWidth={1.4} /> <span className="font-inter text-sm">All products</span>
        </Link>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 bg-[#C8A45A] hover:bg-[#D6B56D] text-[#4A0F1C] font-cinzel text-[0.65rem] tracking-[0.3em] uppercase px-5 py-2.5 rounded transition-colors font-semibold disabled:opacity-60">
          <Save size={14} strokeWidth={1.6} /> {saving ? 'Saving\u2026' : (isNew ? 'Create Product' : 'Save Changes')}
        </button>
      </div>

      <h1 className="font-cormorant text-3xl text-[#4A0F1C] mb-6">{isNew ? 'New Product' : (p.name || 'Edit Product')}</h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <Section title="Basics">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Product Name"><input required value={p.name} onChange={e => set('name', e.target.value)} className={inp} /></Field>
              <Field label="SKU"><input value={p.sku} onChange={e => set('sku', e.target.value)} className={inp} /></Field>
              <Field label="Slug (URL)"><input value={p.slug} onChange={e => set('slug', e.target.value)} className={inp} placeholder="auto-generated from name" /></Field>
              <Field label="Tagline"><input value={p.tagline} onChange={e => set('tagline', e.target.value)} className={inp} placeholder="Kanjivaram Silk • Deep Ruby" /></Field>
            </div>
            <Field label="Description">
              <textarea rows={4} value={p.description} onChange={e => set('description', e.target.value)} className={inp} />
            </Field>
          </Section>

          <Section title="Pricing & Inventory">
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Price (\u20b9)"><input type="number" value={p.price} onChange={e => set('price', e.target.value)} className={inp} /></Field>
              <Field label="Compare-at Price (\u20b9)"><input type="number" value={p.comparePrice} onChange={e => set('comparePrice', e.target.value)} className={inp} /></Field>
              <Field label="Stock"><input type="number" value={p.stock} onChange={e => set('stock', e.target.value)} className={inp} /></Field>
            </div>
          </Section>

          <Section title="Attributes">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Fabric Type"><input value={p.fabricType} onChange={e => set('fabricType', e.target.value)} className={inp} placeholder="Kanjivaram Silk" /></Field>
              <Field label="Weave"><input value={p.weave} onChange={e => set('weave', e.target.value)} className={inp} placeholder="Handwoven" /></Field>
              <Field label="Border"><input value={p.border} onChange={e => set('border', e.target.value)} className={inp} placeholder="Temple border" /></Field>
              <Field label="Saree Length"><input value={p.sareeLength} onChange={e => set('sareeLength', e.target.value)} className={inp} placeholder="5.5 m + 0.8 m blouse" /></Field>
              <Field label="Colour Family"><input value={p.colourFamily} onChange={e => set('colourFamily', e.target.value)} className={inp} placeholder="Red" /></Field>
              <Field label="Colour Name"><input value={p.colourName} onChange={e => set('colourName', e.target.value)} className={inp} placeholder="Deep Ruby" /></Field>
              <Field label="Occasion (comma-separated)"><input value={p.occasion.join(', ')} onChange={e => set('occasion', e.target.value.split(',').map(x => x.trim()).filter(Boolean))} className={inp} placeholder="Wedding, Reception, Festive" /></Field>
              <Field label="Blouse Piece"><input value={p.details['Blouse Piece']} onChange={e => setD('Blouse Piece', e.target.value)} className={inp} /></Field>
              <Field label="Wash Care"><input value={p.details['Wash Care']} onChange={e => setD('Wash Care', e.target.value)} className={inp} /></Field>
              <Field label="Delivery"><input value={p.details.Delivery} onChange={e => setD('Delivery', e.target.value)} className={inp} /></Field>
              <Field label="Returns"><input value={p.details.Returns} onChange={e => setD('Returns', e.target.value)} className={inp} /></Field>
            </div>
          </Section>

          <Section title="Images">
            <div className="space-y-3 mb-3">
              {p.images.map((src, i) => (
                <div key={i} className="flex items-center gap-3 border border-[#4A0F1C]/10 rounded p-2">
                  <img src={src} alt="" className="w-14 h-16 object-cover rounded" />
                  <input value={src} readOnly className={`${inp} flex-1`} />
                  {i === 0 && <span className="px-2 py-1 bg-[#C8A45A] text-[#4A0F1C] text-[0.5rem] font-cinzel tracking-[0.25em] rounded">FEATURED</span>}
                  <button onClick={() => moveImg(i, -1)} disabled={i === 0} className="px-2 py-1 text-xs disabled:opacity-30">↑</button>
                  <button onClick={() => moveImg(i, 1)} disabled={i === p.images.length - 1} className="px-2 py-1 text-xs disabled:opacity-30">↓</button>
                  <button onClick={() => rmImg(i)} className="p-1.5 hover:bg-red-50 text-red-700 rounded"><X size={14} strokeWidth={1.5} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newImg} onChange={e => setNewImg(e.target.value)} placeholder="Paste image URL" className={`${inp} flex-1`} />
              <button onClick={addImg} type="button" className="inline-flex items-center gap-1 bg-[#4A0F1C] hover:bg-[#3A0B15] text-white font-inter text-sm px-4 rounded transition-colors"><Plus size={14} /> Add</button>
            </div>
            <p className="font-inter text-xs text-[#4A0F1C]/50 mt-2">First image is the featured / cover image. Direct URLs recommended; upload widget coming next.</p>
          </Section>

          <Section title="Video (optional)">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Video URL (MP4/WebM or hosted)">
                <input value={p.videoUrl} onChange={e => set('videoUrl', e.target.value)} className={inp} placeholder="https://.../saree-drape.mp4" />
              </Field>
              <Field label="Video Poster URL (fallback / preview image)">
                <input value={p.videoPoster} onChange={e => set('videoPoster', e.target.value)} className={inp} placeholder="https://.../poster.jpg" />
              </Field>
            </div>
            <p className="font-inter text-xs text-[#4A0F1C]/50">Adds a &ldquo;See the saree in motion&rdquo; strip on the product page. Leave blank to hide.</p>
          </Section>

          <Section title="SEO">
            <div className="space-y-4">
              <Field label="SEO Title"><input value={p.seoTitle} onChange={e => set('seoTitle', e.target.value)} className={inp} /></Field>
              <Field label="SEO Description"><textarea rows={3} value={p.seoDescription} onChange={e => set('seoDescription', e.target.value)} className={inp} /></Field>
              <Field label="Meta Keywords (comma-separated)"><input value={p.metaKeywords} onChange={e => set('metaKeywords', e.target.value)} className={inp} /></Field>
              <Field label="Product Tags (comma-separated)"><input value={tagsStr} onChange={e => setTagsStr(e.target.value)} className={inp} placeholder="kanjivaram, bridal, wedding" /></Field>
            </div>
          </Section>
        </div>

        <aside className="space-y-6">
          <Section title="Status & Visibility">
            <Field label="Status">
              <select value={p.status} onChange={e => set('status', e.target.value)} className={inp}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Collection">
              <select value={p.collection} onChange={e => { set('collection', e.target.value); set('collectionName', e.target.selectedOptions[0].text) }} className={inp}>
                {COLLECTIONS.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
            </Field>
            <div className="pt-3 space-y-2">
              {[['isNew','New Arrival'], ['isBestseller','Bestseller'], ['isTrending','Trending'], ['isLimited','Limited Edition']].map(([k, l]) => (
                <label key={k} className="flex items-center gap-2 text-sm font-inter text-[#4A0F1C]">
                  <input type="checkbox" checked={!!p[k]} onChange={e => set(k, e.target.checked)} className="accent-[#C8A45A]" />
                  {l}
                </label>
              ))}
            </div>
          </Section>
        </aside>
      </div>
    </div>
  )
}

const Section = ({ title, children }) => (
  <section className="bg-white border border-[#4A0F1C]/10 rounded p-6">
    <div className="font-cinzel text-[0.62rem] tracking-[0.32em] text-[#C8A45A] mb-4">— {title.toUpperCase()}</div>
    <div className="space-y-4">{children}</div>
  </section>
)
