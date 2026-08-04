import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'ARKADHATRI — Timeless Luxury. Modern Heritage.',
  description: 'ARKADHATRI is an ultra-premium Indian luxury fashion house crafting handwoven silk sarees, bridal couture and timeless heirlooms. Discover our world of heritage craftsmanship and modern elegance.',
  keywords: 'ARKADHATRI, luxury sarees, Indian couture, bridal silk, handwoven, heritage, luxury fashion, sabyasachi alternative',
  openGraph: {
    title: 'ARKADHATRI — Timeless Luxury. Modern Heritage.',
    description: 'Ultra-premium Indian luxury fashion house. Handcrafted sarees and heirlooms.',
    type: 'website'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
