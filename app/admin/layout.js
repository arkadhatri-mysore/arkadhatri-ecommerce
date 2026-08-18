import '../globals.css'
import AdminShell from '@/components/AdminShell'

export const metadata = { title: 'Admin \u2014 ARKADHATRI', robots: { index: false, follow: false } }

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>
}
