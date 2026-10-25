import { notFound } from 'next/navigation'
import { getLegalPage } from '@/lib/legal'
import { SITE_URL } from '@/lib/site'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const page = getLegalPage(slug)
  if (!page) return { title: 'Page not found', robots: { index: false, follow: false } }
  const description = String(page.sections?.[0]?.p || page.updated || page.title).replace(/\{\{[A-Z_]+\}\}/g, '').slice(0, 155)
  return { title: page.title, description, alternates: SITE_URL ? { canonical: `/${slug}` } : undefined, openGraph: { title: `${page.title} — ARKADHATRI`, description, url: `/${slug}` } }
}

export default async function LegalLayout({ children, params }) {
  const { slug } = await params
  if (!getLegalPage(slug)) notFound()
  return children
}
