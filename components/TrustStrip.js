import { ShieldCheck, Truck, Award, RotateCcw } from 'lucide-react'

/**
 * Trust strip shown below product listings.
 * Variant: 'ivory' (light) or 'burgundy' (dark).
 */
const TrustStrip = ({ variant = 'ivory' }) => {
  const dark = variant === 'burgundy'
  const items = [
    { i: ShieldCheck, t: 'Secure Payments' },
    { i: Truck,       t: 'Fast Delivery Across India' },
    { i: Award,       t: 'Quality Checked' },
    { i: RotateCcw,   t: 'Easy Returns' }
  ]
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 ${dark ? 'bg-burgundy-ink' : 'bg-luxury-ivory'} py-8 md:py-10 border-y ${dark ? 'border-gold/15' : 'border-burgundy-ink/10'}`}>
      {items.map((x) => (
        <div key={x.t} className="flex flex-col items-center text-center gap-2 md:gap-3 px-2">
          <x.i size={22} strokeWidth={1.3} className="text-gold" />
          <div className={`font-cinzel text-[0.55rem] md:text-[0.6rem] tracking-[0.3em] uppercase leading-tight ${dark ? 'text-ivory/85' : 'text-burgundy-ink/85'}`}>{x.t}</div>
        </div>
      ))}
    </div>
  )
}

export default TrustStrip
