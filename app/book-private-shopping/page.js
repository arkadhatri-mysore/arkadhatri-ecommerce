'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ArrowUpRight, MapPin, Check } from 'lucide-react'

const LOGO_URL = 'https://customer-assets-jt897jd0.emergentagent.net/job_timeless-crafted-8/artifacts/xkx14q2d_ARK%20LOGO.jpeg'
const HERO_IMG = 'https://images.unsplash.com/photo-1610047520958-b42ebcd2f6cb?auto=format&fit=crop&w=2000&q=85'

const PREFS = [
  'Wedding Sarees', 'Bridal Collection', 'Festive Collection',
  'Luxury Silk Sarees', 'Corporate Gifting', 'Luxury Accessories'
]
const METHODS = ['Visit Boutique', 'Video Consultation', 'WhatsApp Consultation']
const BUDGETS = [
  'Under ₹ 1,00,000',
  '₹ 1,00,000 – ₹ 3,00,000',
  '₹ 3,00,000 – ₹ 6,00,000',
  '₹ 6,00,000 – ₹ 12,00,000',
  'Above ₹ 12,00,000',
  'On Request'
]
const LANGS = ['English', 'Hindi', 'Bengali', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Gujarati', 'Punjabi']
const OCCASIONS = ['Wedding', 'Reception', 'Sangeet', 'Engagement', 'Festive Gathering', 'Anniversary', 'Corporate Event', 'Other']

const FieldLabel = ({ children }) => (
  <label className="block font-cinzel text-[0.6rem] tracking-[0.35em] uppercase text-burgundy-deep mb-3">{children}</label>
)

const inputCls = 'w-full bg-transparent border-b border-burgundy/30 focus:border-burgundy focus:outline-none py-3 px-1 font-cormorant text-lg text-burgundy-ink placeholder:text-burgundy/30 transition-colors'

const BookPrivateShopping = () => {
  const [form, setForm] = useState({
    fullName: '', mobile: '', email: '',
    preferences: [], shoppingMethod: 'Visit Boutique',
    preferredDate: '', preferredTime: '',
    city: '', specialRequirements: '',
    occasion: '', expectedBudget: '', preferredLanguage: 'English'
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const togglePref = (p) => setForm((f) => ({
    ...f,
    preferences: f.preferences.includes(p) ? f.preferences.filter(x => x !== p) : [...f.preferences, p]
  }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Unable to submit')
      setDone(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-luxury-ivory">
      {/* Top bar with back to home */}
      <div className="absolute top-0 left-0 right-0 z-30 py-6">
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-ivory hover:text-gold transition-colors group">
            <ChevronLeft size={16} strokeWidth={1.4} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-cinzel text-[0.6rem] tracking-[0.35em]">RETURN TO MAISON</span>
          </Link>
          <Link href="/">
            <img src={LOGO_URL} alt="ARKADHATRI" className="h-14 md:h-16 object-contain" />
          </Link>
          <div className="font-cinzel text-[0.55rem] tracking-[0.4em] text-gold hidden md:block">EST · MMXXV</div>
        </div>
      </div>

      {/* HERO (Deep Burgundy) */}
      <section className="relative min-h-[80vh] bg-burgundy-ink overflow-hidden flex items-center">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-burgundy-ink/85 via-burgundy/70 to-burgundy-ink" />
        </div>
        <div className="container relative py-32 md:py-40 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="divider-ornament max-w-md mx-auto mb-8">
            <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-gold">BY APPOINTMENT ONLY</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, letterSpacing: '0.5em' }} animate={{ opacity: 1, letterSpacing: '0.15em' }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }} className="font-cinzel text-4xl md:text-6xl lg:text-7xl gold-metallic-text" style={{ fontWeight: 600 }}>
            PRIVATE SHOPPING EXPERIENCE
          </motion.h1>
          <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 1.4, delay: 0.8 }} className="gold-line w-32 md:w-56 mx-auto my-10" />
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 1 }} className="font-cormorant italic text-warm-grey text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            Enjoy a personalised shopping journey with ARKADHATRI. Our Luxury Concierge
            will curate exclusive selections tailored to your style, occasion, and
            preferences.
          </motion.p>

          {/* Trust row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 1.3 }} className="mt-14 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { n: '01', l: 'CURATED SELECTION' },
              { n: '02', l: 'PRIVATE ATELIER' },
              { n: '03', l: 'STYLED FOR YOU' }
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="font-cormorant italic text-3xl text-gold">{s.n}</div>
                <div className="font-cinzel text-[0.55rem] tracking-[0.35em] text-warm-grey mt-2">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FORM (Ivory) */}
      <section className="relative bg-luxury-ivory py-24 md:py-32">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="container max-w-3xl text-center">
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="w-24 h-24 mx-auto mb-10 rounded-full border-2 border-[#C8A45A] flex items-center justify-center" style={{ boxShadow: '0 20px 40px -20px rgba(200,164,90,0.4)' }}>
                <motion.svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <motion.path d="M4 12 L10 18 L20 6" stroke="#C8A45A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.5 }} />
                </motion.svg>
              </motion.div>
              <div className="font-cinzel text-[0.65rem] tracking-[0.4em] text-[#C8A45A] mb-4">— CONFIRMED</div>
              <h2 className="font-cormorant text-4xl md:text-6xl text-burgundy-ink leading-[1.1] mb-8">
                Your request has been <em className="italic text-[#C8A45A]">received.</em>
              </h2>
              <p className="font-cormorant italic text-xl md:text-2xl text-burgundy-ink/70 max-w-2xl mx-auto leading-relaxed">
                A Luxury Concierge from ARKADHATRI will personally contact you within
                24 hours to arrange your private shopping experience.
              </p>
              <div className="gold-line w-24 mx-auto my-12" />
              <Link href="/" className="btn-luxury-filled inline-flex">Return to Maison</Link>
              <div className="mt-16 flex items-center justify-center gap-3 text-burgundy-ink/60">
                <MapPin size={14} strokeWidth={1.2} />
                <span className="font-cinzel text-[0.55rem] tracking-[0.35em]">ATELIER · KOLKATA · INDIA</span>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container">
              <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
                {/* Left illustration column */}
                <aside className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
                  <div className="font-cinzel text-[0.6rem] tracking-[0.4em] text-[#C8A45A] mb-4">— THE APPOINTMENT</div>
                  <h2 className="font-cormorant text-4xl md:text-5xl text-burgundy-ink leading-[1.05] mb-6">
                    A quiet hour<br />with the <em className="italic text-[#C8A45A]">maison.</em>
                  </h2>
                  <div className="gold-line w-16 mb-6" />
                  <p className="font-inter font-light text-burgundy-ink/70 text-[15px] leading-[1.9] max-w-md">
                    Share a few details and our Luxury Concierge will design a
                    personalised experience &mdash; from silks reserved for you, to a
                    private appointment at our atelier or a video walk-through with
                    a stylist.
                  </p>

                  {/* Elegant SVG illustration */}
                  <div className="mt-12 relative aspect-square max-w-xs">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      <circle cx="100" cy="100" r="90" stroke="#C8A45A" strokeWidth="0.6" fill="none" />
                      <circle cx="100" cy="100" r="70" stroke="#C8A45A" strokeWidth="0.4" fill="none" opacity="0.6" />
                      <circle cx="100" cy="100" r="50" stroke="#C8A45A" strokeWidth="0.3" fill="none" opacity="0.4" />
                      {/* Lotus motif */}
                      <g transform="translate(100 100)">
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                          <ellipse key={a} cx="0" cy="-28" rx="9" ry="22" fill="none" stroke="#C8A45A" strokeWidth="0.8" transform={`rotate(${a})`} />
                        ))}
                        <circle cx="0" cy="0" r="5" fill="#C8A45A" />
                      </g>
                      {/* Ornament corners */}
                      {[[20,20],[180,20],[20,180],[180,180]].map(([x,y],i) => (
                        <g key={i} transform={`translate(${x} ${y})`}>
                          <path d="M-4 0 L4 0 M0 -4 L0 4" stroke="#C8A45A" strokeWidth="0.8" />
                        </g>
                      ))}
                    </svg>
                  </div>
                </aside>

                {/* Form column */}
                <form onSubmit={submit} className="lg:col-span-8 space-y-16">
                  {/* Personal Details */}
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-[#C8A45A]">— 01</span>
                      <span className="h-[1px] w-12 bg-[#C8A45A]" />
                      <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-burgundy-ink">PERSONAL DETAILS</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="md:col-span-2">
                        <FieldLabel>Full Name</FieldLabel>
                        <input required value={form.fullName} onChange={e => set('fullName', e.target.value)} className={inputCls} placeholder="e.g. Anaya Kapoor" />
                      </div>
                      <div>
                        <FieldLabel>Mobile Number</FieldLabel>
                        <input required value={form.mobile} onChange={e => set('mobile', e.target.value)} className={inputCls} placeholder="+91 —" />
                      </div>
                      <div>
                        <FieldLabel>Email Address</FieldLabel>
                        <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} placeholder="you@example.com" />
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-[#C8A45A]">— 02</span>
                      <span className="h-[1px] w-12 bg-[#C8A45A]" />
                      <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-burgundy-ink">SHOPPING PREFERENCES</span>
                    </div>
                    <p className="font-cormorant italic text-burgundy-ink/60 text-lg mb-6">Select all that interest you.</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {PREFS.map(p => {
                        const on = form.preferences.includes(p)
                        return (
                          <button type="button" key={p} onClick={() => togglePref(p)}
                            className={`group flex items-center gap-3 border p-4 rounded-md text-left transition-all duration-500 ${on ? 'border-[#C8A45A] bg-[#C8A45A]/10' : 'border-burgundy-ink/15 hover:border-[#C8A45A]/60'}`}>
                            <div className={`w-5 h-5 border flex items-center justify-center rounded-sm shrink-0 transition-all ${on ? 'bg-[#C8A45A] border-[#C8A45A]' : 'border-burgundy-ink/30'}`}>
                              {on && <Check size={12} strokeWidth={3} className="text-burgundy-ink" />}
                            </div>
                            <span className="font-cormorant text-lg text-burgundy-ink">{p}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Shopping Method */}
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-[#C8A45A]">— 03</span>
                      <span className="h-[1px] w-12 bg-[#C8A45A]" />
                      <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-burgundy-ink">PREFERRED SHOPPING METHOD</span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      {METHODS.map(m => {
                        const on = form.shoppingMethod === m
                        return (
                          <button type="button" key={m} onClick={() => set('shoppingMethod', m)}
                            className={`p-6 border rounded-md text-center transition-all duration-500 ${on ? 'border-[#C8A45A] bg-[#C8A45A]/10' : 'border-burgundy-ink/15 hover:border-[#C8A45A]/60'}`}>
                            <div className={`w-4 h-4 mx-auto rounded-full border-2 mb-3 transition-all ${on ? 'border-[#C8A45A] bg-[#C8A45A]' : 'border-burgundy-ink/40'}`} style={on ? { boxShadow: 'inset 0 0 0 3px #F7F3EB' } : {}} />
                            <div className="font-cormorant text-lg text-burgundy-ink">{m}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-[#C8A45A]">— 04</span>
                      <span className="h-[1px] w-12 bg-[#C8A45A]" />
                      <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-burgundy-ink">SCHEDULE & LOCATION</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <FieldLabel>Preferred Date</FieldLabel>
                        <input type="date" value={form.preferredDate} onChange={e => set('preferredDate', e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <FieldLabel>Preferred Time</FieldLabel>
                        <input type="time" value={form.preferredTime} onChange={e => set('preferredTime', e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <FieldLabel>City</FieldLabel>
                        <input value={form.city} onChange={e => set('city', e.target.value)} className={inputCls} placeholder="e.g. Mumbai" />
                      </div>
                      <div>
                        <FieldLabel>Preferred Language</FieldLabel>
                        <select value={form.preferredLanguage} onChange={e => set('preferredLanguage', e.target.value)} className={`${inputCls} appearance-none cursor-hover`}>
                          {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Occasion & Budget */}
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-[#C8A45A]">— 05</span>
                      <span className="h-[1px] w-12 bg-[#C8A45A]" />
                      <span className="font-cinzel text-[0.65rem] tracking-[0.35em] text-burgundy-ink">OCCASION & INVESTMENT</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <FieldLabel>Occasion</FieldLabel>
                        <select value={form.occasion} onChange={e => set('occasion', e.target.value)} className={`${inputCls} appearance-none cursor-hover`}>
                          <option value="">Select occasion</option>
                          {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <FieldLabel>Expected Budget</FieldLabel>
                        <select value={form.expectedBudget} onChange={e => set('expectedBudget', e.target.value)} className={`${inputCls} appearance-none cursor-hover`}>
                          <option value="">Select budget</option>
                          {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <FieldLabel>Special Requirements</FieldLabel>
                        <textarea value={form.specialRequirements} onChange={e => set('specialRequirements', e.target.value)} rows={4} className={`${inputCls} resize-none border-b`} placeholder="Any specific requests, preferred colours, sizing notes, etc." />
                      </div>
                    </div>
                  </div>

                  {error && <p className="font-cormorant italic text-red-800">{error}</p>}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4">
                    <button type="submit" disabled={submitting} className="btn-luxury-filled disabled:opacity-60">
                      {submitting ? 'Sending…' : 'Book Private Shopping'}
                    </button>
                    <p className="font-cormorant italic text-burgundy-ink/60 text-sm max-w-sm">
                      By submitting, you agree to be contacted by our Luxury Concierge.
                      Your details remain private to the maison.
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Small footer */}
      <footer className="bg-burgundy-ink py-10 border-t border-gold/15">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="font-cinzel text-[0.55rem] tracking-[0.4em] text-warm-grey">© MMXXV ARKADHATRI</div>
          <div className="font-cinzel text-[0.55rem] tracking-[0.4em] text-[#C8A45A]">TIMELESS · LUXURY · MODERN · HERITAGE</div>
        </div>
      </footer>
    </main>
  )
}

export default BookPrivateShopping
