import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import {
  LayoutDashboard, Users, Newspaper, BookOpen, MessageSquare,
  Ticket, Users2, FileText, Settings, Shield, ChevronRight, BookMarked,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',     href: '/admin',               icon: LayoutDashboard },
  { label: 'Benutzer',      href: '/admin/users',         icon: Users },
  { label: 'News',          href: '/admin/news',          icon: Newspaper },
  { label: 'Guides',        href: '/admin/guides',        icon: BookMarked },
  { label: 'Gesetze',       href: '/admin/gesetze',       icon: BookOpen },
  { label: 'Forum',         href: '/admin/forum',         icon: MessageSquare },
  { label: 'Tickets',       href: '/admin/tickets',       icon: Ticket },
  { label: 'Team',          href: '/admin/team',          icon: Users2 },
  { label: 'Logs',          href: '/admin/logs',          icon: FileText },
  { label: 'Einstellungen', href: '/admin/einstellungen', icon: Settings },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'OWNER')) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex bg-surface-0">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-white/6 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Greifenberg RP</p>
              <p className="text-brand-light text-[10px] font-semibold uppercase tracking-wider mt-0.5">Admin-Panel</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400
                hover:text-white hover:bg-white/5 transition-all group"
            >
              <item.icon className="w-4 h-4 flex-shrink-0 group-hover:text-brand-light transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/6">
          <Link href="/" className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-2">
            <ChevronRight className="w-3 h-3 rotate-180" /> Zur Website
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
