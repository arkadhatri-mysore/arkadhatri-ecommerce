import './globals.css'
import { Providers } from './providers'
import { INDEXABLE, ORIGIN, NOINDEX, jsonLd } from '@/lib/site'

const DESCRIPTION = 'ARKADHATRI is a South Indian saree boutique from Karnataka. Shop curated silk, wedding, festival and everyday sarees.'
const OG_IMAGE = 'https://images.unsplash.com/photo-1619516388835-2b60acc4049e?auto=format&fit=crop&w=1200&h=630&q=80'

export const metadata = {
  metadataBase: ORIGIN ? new URL(ORIGIN) : undefined,
  title: { default: 'ARKADHATRI — South Indian Silk Sarees', template: '%s | ARKADHATRI' },
  description: DESCRIPTION,
  applicationName: 'ARKADHATRI',
  robots: INDEXABLE ? { index: true, follow: true } : NOINDEX,
  icons: { icon: '/brand/arkadhatri-emblem.svg', apple: '/brand/arkadhatri-emblem.svg' },
  openGraph: {
    type: 'website', siteName: 'ARKADHATRI', locale: 'en_IN',
    title: 'ARKADHATRI — South Indian Silk Sarees', description: DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'A South Indian silk saree from ARKADHATRI' }]
  },
  twitter: { card: 'summary_large_image', title: 'ARKADHATRI — South Indian Silk Sarees', description: DESCRIPTION, images: [OG_IMAGE] }
}

export const viewport = { themeColor: '#F7F3EB', width: 'device-width', initialScale: 1 }

const ORG = {
  '@context': 'https://schema.org', '@type': 'Organization',
  name: 'ARKADHATRI', url: ORIGIN ? `${ORIGIN}/` : undefined,
  logo: ORIGIN ? `${ORIGIN}/brand/arkadhatri-emblem.svg` : undefined,
  address: { '@type': 'PostalAddress', addressRegion: 'Karnataka', addressCountry: 'IN' }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ORG) }} />
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);(function(){function c(x){var m=String((x&&(x.message||x.name))||"");return /ChunkLoadError|Loading chunk|Loading CSS chunk/i.test(m)}function r(){try{var k="ark:chunk-reload:"+location.pathname;if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,"1");location.reload()}catch(_){}}window.addEventListener("error",function(e){if(c(e.error||e))r()});window.addEventListener("unhandledrejection",function(e){if(c(e.reason))r()});window.addEventListener("load",function(){setTimeout(function(){try{Object.keys(sessionStorage).forEach(function(k){if(k.indexOf("ark:chunk-reload:")===0)sessionStorage.removeItem(k)})}catch(_){}},8000)})})();'}} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
