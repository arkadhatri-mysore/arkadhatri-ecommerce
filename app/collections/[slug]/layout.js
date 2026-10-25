import { notFound } from 'next/navigation'
import { COLLECTIONS } from '@/lib/products'
import { ORIGIN, SITE_URL, jsonLd } from '@/lib/site'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const c = COLLECTIONS.find((x) => x.slug === slug)
  if (!c) return { title: 'Collection not found', robots: { index: false, follow: false } }
  const title = `${c.name} — South Indian Sarees`
  return {
    title, description: c.desc,
    alternates: SITE_URL ? { canonical: `/collections/${c.slug}` } : undefined,
    openGraph: { title, description: c.desc, url: `/collections/${c.slug}`, images: [{ url: c.image, alt: `${c.name} collection` }], siteName: 'ARKADHATRI' },
    twitter: { card: 'summary_large_image', title, description: c.desc, images: [c.image] }
  }
}

export default async function CollectionLayout({ children, params }) {
  const { slug } = await params
  const c = COLLECTIONS.find((x) => x.slug === slug)
  if (!c) notFound()
  const crumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: c.name, item: `${ORIGIN}/collections/${c.slug}` }
    ]
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbs) }} />
      {children}
    </>
  )
}
