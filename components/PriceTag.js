import { inr } from '@/lib/cart'

/** Price with an optional genuine "was" price (shown only when compareAt > price). */
export default function PriceTag({ price, compareAt, currency = '\u20b9', className = '', wasClassName = '', size = 'sm' }) {
  const was = Number(compareAt) > Number(price) ? Number(compareAt) : 0
  const off = was ? Math.round(((was - Number(price)) / was) * 100) : 0
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`} data-testid="price-tag">
      <span>{currency} {inr(price)}</span>
      {was > 0 && (
        <>
          <s className={`font-inter font-normal opacity-75 ${size === 'lg' ? 'text-base' : 'text-[0.8rem]'} ${wasClassName}`} data-testid="compare-price" aria-label={`Original price ${currency} ${inr(was)}`}>{currency} {inr(was)}</s>
          {off >= 1 && <span className={`font-inter font-semibold text-[#1F7A4D] ${size === 'lg' ? 'text-sm' : 'text-[0.75rem]'}`}>{off}% off</span>}
        </>
      )}
    </span>
  )
}
