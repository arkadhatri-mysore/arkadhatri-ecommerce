import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'ARKADHATRI — Timeless South Indian Elegance',
  description: 'ARKADHATRI is a premium South Indian saree boutique. Carefully curated silk sarees celebrating Karnataka, Mysore silk, and Kanjivaram temple traditions. Timeless craftsmanship, quality, and everyday elegance.',
  keywords: 'ARKADHATRI, South Indian saree, Kanjivaram, Mysore silk, silk sarees, wedding sarees, festival sarees, daily wear sarees, Karnataka, premium sarees',
  openGraph: {
    title: 'ARKADHATRI — Timeless South Indian Elegance',
    description: 'A premium South Indian saree boutique. Curated silk sarees inspired by tradition.',
    type: 'website'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);(function(){function c(x){var m=String((x&&(x.message||x.name))||"");return /ChunkLoadError|Loading chunk|Loading CSS chunk/i.test(m)}function r(){try{var k="ark:chunk-reload:"+location.pathname;if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,"1");location.reload()}catch(_){}}window.addEventListener("error",function(e){if(c(e.error||e))r()});window.addEventListener("unhandledrejection",function(e){if(c(e.reason))r()});window.addEventListener("load",function(){setTimeout(function(){try{Object.keys(sessionStorage).forEach(function(k){if(k.indexOf("ark:chunk-reload:")===0)sessionStorage.removeItem(k)})}catch(_){}},8000)})})();'}} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
