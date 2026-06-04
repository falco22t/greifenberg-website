import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import {
  LayoutDashboard, Users, Newspaper, BookOpen, MessageSquare,
  Ticket, Users2, FileText, Settings, Shield, ChevronRight, BookMarked,
} from 'lucide-react'
import type { UserRole } from '@prisma/client'

const ALL_NAV = [
  { label: 'Dashboard',     href: '/admin',               icon: LayoutDashboard, minRole: 'MOD'   },
  { label: 'Benutzer',      href: '/admin/users',         icon: Users,           minRole: 'ADMIN' },
  { label: 'News',          href: '/admin/news',          icon: Newspaper,       minRole: 'OWNER' },
  { label: 'Guides',        href: '/admin/guides',        icon: BookMarked,      minRole: 'OWNER' },
  { label: 'Gesetze',       href: '/admin/gesetze',       icon: BookOpen,        minRole: 'OWNER' },
  { label: 'Forum',         href: '/admin/forum',         icon: MessageSquare,   minRole: 'MOD'   },
  { label: 'Tickets',       href: '/admin/tickets',       icon: Ticket,          minRole: 'ADMIN' },
  { label: 'Team',          href: '/admin/team',          icon: Users2,          minRole: 'OWNER' },
  { label: 'Regelwerk',     href: '/admin/regelwerk',     icon: Shield,          minRole: 'OWNER' },
  { label: 'Logs',          href: '/admin/logs',          icon: FileText,        minRole: 'ADMIN' },
  { label: 'Einstellungen', href: '/admin/einstellungen', icon: Settings,        minRole: 'OWNER' },
] as const

const ROLE_ORDER: UserRole[] = ['GUEST', 'USER', 'MOD', 'ADMIN', 'OWNER']
function hasMinRole(role: UserRole, min: string) {
  return ROLE_ORDER.indexOf(role) >= ROLE_ORDER.indexOf(min as UserRole)
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || !hasMinRole(session.role, 'MOD')) redirect('/')

  const navItems = ALL_NAV.filter((item) => hasMinRole(session.role, item.minRole))

  return (
    <div className="min-h-screen flex bg-surface-0">
      <aside className="w-60 flex-shrink-0 border-r border-white/6 flex flex-col">
        <div className="px-5 py-5 border-b border-white/6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Greifenberg RP</p>
              <p className="text-brand-light text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                {session.role === 'OWNER' ? 'Owner-Panel' : session.role === 'ADMIN' ? 'Admin-Panel' : 'Mod-Panel'}
              </p>
            </div>
          </Link>
        </div>

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

        <div className="px-3 py-4 border-t border-white/6">
          <Link href="/" className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-2">
            <ChevronRight className="w-3 h-3 rotate-180" /> Zur Website
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
