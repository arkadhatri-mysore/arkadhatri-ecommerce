'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, Boxes, ShoppingBag, Users, Mail, MessageSquare,
  Settings, LogOut, Tag, ChevronRight
} from 'lucide-react'

import BrandLogo from '@/components/BrandLogo'

const NAV = [
  { href: '/admin/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products',   icon: Package,         label: 'Products' },
  { href: '/admin/inventory',  icon: Boxes,           label: 'Inventory' },
  { href: '/admin/orders',     icon: ShoppingBag,     label: 'Orders' },
  { href: '/admin/customers',  icon: Users,           label: 'Customers' },
  { href: '/admin/coupons',    icon: Tag,             label: 'Coupons' },
  { href: '/admin/newsletter', icon: Mail,            label: 'Newsletter' },
  { href: '/admin/contacts',   icon: MessageSquare,   label: 'Enquiries' },
  { href: '/admin/settings',   icon: Settings,        label: 'Settings' }
]

export default function AdminShell({ children }) {
  const path = usePathname()
  const router = useRouter()
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const isLogin = ['/admin', '/admin/login', '/admin/forgot-password', '/admin/reset-password'].includes(path)

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then((d) => {
      if (d.email) setMe(d)
      else if (!isLogin) router.replace('/admin')
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [path, router, isLogin])

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.replace('/admin')
  }

  if (isLogin) return <div className="min-h-screen" style={{ background: '#F7F3EB' }}>{children}</div>
  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F3EB' }}><div className="font-cinzel text-sm tracking-widest text-[#4A0F1C]/60">LOADING…</div></div>

  return (
    <div className="min-h-screen flex" style={{ background: '#F7F3EB' }}>
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a0508] text-white flex flex-col fixed h-screen">
        <div className="p-5 border-b border-white/10">
          <BrandLogo variant="light" size="sm" />
          <div className="mt-1.5 pl-[42px] font-inter text-white/60 text-xs">Owner dashboard</div>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ href, icon: I, label }) => {
            const active = path === href || path.startsWith(href + '/')
            return (
              <Link key={href} href={href} className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${active ? 'bg-[#C8A45A]/15 text-[#C8A45A] border-l-2 border-[#C8A45A]' : 'text-white/70 hover:text-white hover:bg-white/5 border-l-2 border-transparent'}`}>
                <I size={16} strokeWidth={1.5} />
                <span className="font-inter">{label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="text-[0.65rem] text-white/50 font-inter mb-1">Signed in as</div>
          <div className="font-inter text-sm text-white truncate">{me?.email}</div>
          <button onClick={logout} className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded transition-colors">
            <LogOut size={14} strokeWidth={1.5} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64">
        <div className="px-8 py-6 border-b border-[#4A0F1C]/10 bg-white flex items-center justify-between">
          <div className="font-cinzel text-[0.62rem] tracking-[0.32em] text-[#4A0F1C]/70 flex items-center gap-2">
            ADMIN <ChevronRight size={11} strokeWidth={1.4} /> <span className="text-[#C8A45A]">{(path.split('/')[2] || 'dashboard').toUpperCase()}</span>
          </div>
          <Link href="/" target="_blank" className="text-xs text-[#4A0F1C]/60 hover:text-[#C8A45A] font-inter transition-colors">View Site ↗</Link>
        </div>
        <div className="p-8">
          {me?.needsPasswordChange && (
            <div data-testid="bootstrap-password-banner" className="mb-6 border border-[#C8A45A] bg-[#C8A45A]/10 rounded px-4 py-3 font-inter text-sm text-[#4A0F1C]">
              You are signed in with the starter password from the hosting settings. Please <Link href="/admin/settings" className="underline font-semibold">choose your own password</Link> in Settings → Security.
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
