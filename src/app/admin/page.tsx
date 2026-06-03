import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Users, MessageSquare, Ticket, Newspaper, TrendingUp, Activity, BookOpen, Clock } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/dateUtils'
import Link from 'next/link'

export const revalidate = 0

async function getStats() {
  try {
    const now = new Date()
    const startOfDay  = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [totalUsers, newUsersToday, newUsersWeek, totalThreads, totalPosts, openTickets, totalNews, totalLaws, recentLogs] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.forumThread.count(),
      prisma.forumPost.count({ where: { deletedAt: null } }),
      prisma.ticket.count({ where: { status: { not: 'CLOSED' } } }),
      prisma.newsPost.count({ where: { isPublished: true } }),
      prisma.lawBook.count({ where: { isPublished: true } }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' }, take: 8,
        include: { user: { select: { username: true } } },
      }),
    ])
    return { totalUsers, newUsersToday, newUsersWeek, totalThreads, totalPosts, openTickets, totalNews, totalLaws, recentLogs }
  } catch { return null }
}

export default async function AdminDashboard() {
  const session = await getSession()
  const stats = await getStats()

  const statCards = [
    { label: 'Benutzer gesamt',     value: stats?.totalUsers ?? '—',    sub: `+${stats?.newUsersWeek ?? 0} diese Woche`,   icon: Users,          href: '/admin/users',   color: 'text-brand-light',  bg: 'bg-brand/10' },
    { label: 'Forum-Threads',       value: stats?.totalThreads ?? '—',  sub: `${stats?.totalPosts ?? 0} Beiträge`,          icon: MessageSquare,  href: '/admin/forum',   color: 'text-purple-400',   bg: 'bg-purple-500/10' },
    { label: 'Offene Tickets',      value: stats?.openTickets ?? '—',   sub: 'Warten auf Bearbeitung',                      icon: Ticket,         href: '/admin/tickets', color: 'text-amber-400',    bg: 'bg-amber-500/10' },
    { label: 'News veröffentlicht', value: stats?.totalNews ?? '—',     sub: `${stats?.totalLaws ?? 0} Gesetzbücher`,       icon: Newspaper,      href: '/admin/news',    color: 'text-green-400',    bg: 'bg-green-500/10' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Willkommen zurück, <span className="text-white font-semibold">{session?.username}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}
            className="glass rounded-2xl border border-white/6 p-5 hover:border-white/12 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>
            <p className="text-2xl font-black text-white mb-0.5">{card.value}</p>
            <p className="text-xs text-slate-400 font-medium">{card.label}</p>
            <p className="text-xs text-slate-600 mt-1">{card.sub}</p>
          </Link>
        ))}
      </div>

      {/* Two-column: Quick Actions + Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Quick Actions */}
        <div className="glass rounded-2xl border border-white/6 p-5">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-light" /> Schnellzugriff
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'News schreiben',   href: '/admin/news/neu',         icon: Newspaper,     color: 'text-green-400' },
              { label: 'Benutzer',         href: '/admin/users',            icon: Users,         color: 'text-brand-light' },
              { label: 'Gesetze pflegen',  href: '/admin/gesetze',          icon: BookOpen,      color: 'text-amber-400' },
              { label: 'Tickets',          href: '/admin/tickets',          icon: Ticket,        color: 'text-red-400' },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all text-sm text-slate-300 hover:text-white">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-2xl border border-white/6 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-light" /> Letzte Aktionen
            </h2>
            <Link href="/admin/logs" className="text-xs text-brand-light hover:text-white transition-colors">
              Alle anzeigen →
            </Link>
          </div>
          {!stats?.recentLogs?.length ? (
            <p className="text-slate-500 text-sm">Noch keine Aktionen geloggt.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand/60 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-white font-medium">{log.user?.username ?? 'System'}</span>
                    {' '}
                    <span className="text-slate-400">{log.action.replace(/_/g, ' ').toLowerCase()}</span>
                  </div>
                  <span className="text-slate-600 flex-shrink-0">{formatDistanceToNow(log.createdAt.toISOString())}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
