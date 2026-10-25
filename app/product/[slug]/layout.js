import { notFound } from 'next/navigation'
import { getPublished, inStock, plain } from '@/lib/server-catalog'
import { COLLECTIONS } from '@/lib/products'
import { ORIGIN, SITE_URL, jsonLd } from '@/lib/site'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const p = await getPublished(slug)
  if (!p) return { title: 'Saree not found', robots: { index: false, follow: false } }
  const raw = p.seoTitle || `${p.name} — ${p.tagline || 'South Indian Saree'}`
  // Avoid "| ARKADHATRI | ARKADHATRI": titles that already name the brand bypass the layout template.
  const title = /arkadhatri/i.test(raw) ? { absolute: raw } : raw
  const plainTitle = typeof title === 'string' ? `${title} | ARKADHATRI` : raw
  const description = plain(p.seoDescription || p.description || p.tagline)
  const url = `/product/${p.slug}`
  const images = (p.images || []).slice(0, 4).map((src) => ({ url: src, alt: `${p.name} saree` }))
  return {
    title, description,
    alternates: SITE_URL ? { canonical: url } : undefined,
    openGraph: { type: 'website', title: plainTitle, description, url, images, siteName: 'ARKADHATRI' },
    twitter: { card: 'summary_large_image', title: plainTitle, description, images: images.map((i) => i.url) }
  }
}

export default async function ProductLayout({ children, params }) {
  const { slug } = await params
  const p = await getPublished(slug)
  if (!p) notFound()
  const col = COLLECTIONS.find((c) => c.slug === p.collection)
  const url = `${ORIGIN}/product/${p.slug}`
  const product = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: p.name, sku: p.sku, description: plain(p.seoDescription || p.description || p.tagline, 500),
    image: (p.images || []).slice(0, 6), url,
    brand: { '@type': 'Brand', name: 'ARKADHATRI' },
    ...(p.colourName ? { color: p.colourName } : {}),
    ...(p.fabricType ? { material: p.fabricType } : {}),
    offers: {
      '@type': 'Offer', priceCurrency: 'INR', price: Number(p.price) || 0, url,
      availability: inStock(p) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition'
    }
  }
  const crumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
      ...(col ? [{ '@type': 'ListItem', position: 2, name: col.name, item: `${ORIGIN}/collections/${col.slug}` }] : []),
      { '@type': 'ListItem', position: col ? 3 : 2, name: p.name, item: url }
    ]
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(product) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbs) }} />
      {children}
    </>
  )
}
