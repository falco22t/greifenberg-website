import { prisma } from '@/lib/prisma'
import { Ticket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/dateUtils'

export const revalidate = 0

export default async function AdminTicketsPage() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' }, take: 100,
    include: { user: { select: { username: true } }, category: true, _count: { select: { messages: true } } },
  }).catch(() => [] as never[])

  const STATUS_COLORS = { OPEN: 'border-blue-500/40 text-blue-400', IN_PROGRESS: 'border-amber-500/40 text-amber-400', CLOSED: 'border-green-500/40 text-green-400' }
  const STATUS_LABELS = { OPEN: 'Offen', IN_PROGRESS: 'In Bearbeitung', CLOSED: 'Geschlossen' }
  const PRIORITY = { LOW: 'text-green-400', MEDIUM: 'text-amber-400', HIGH: 'text-red-400' }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-white flex items-center gap-2 mb-6">
        <Ticket className="w-6 h-6 text-brand-light" /> Tickets ({tickets.length})
      </h1>
      <div className="glass rounded-2xl border border-white/6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6 text-left">
              {['#', 'Betreff', 'Von', 'Kategorie', 'Priorität', 'Status', 'Nachrichten', 'Erstellt'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-slate-500 font-mono">#{t.id}</td>
                <td className="px-4 py-3 text-white font-medium max-w-[200px] truncate">{t.title}</td>
                <td className="px-4 py-3 text-slate-400">{t.user.username}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{t.category?.name ?? '—'}</td>
                <td className="px-4 py-3 text-xs font-semibold" style={{}}><span className={PRIORITY[t.priority]}>{t.priority}</span></td>
                <td className="px-4 py-3"><Badge variant="outline" className={`text-xs ${STATUS_COLORS[t.status]}`}>{STATUS_LABELS[t.status]}</Badge></td>
                <td className="px-4 py-3 text-slate-500">{t._count.messages}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(t.createdAt.toISOString())}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length === 0 && <div className="py-12 text-center text-slate-500">Keine Tickets.</div>}
      </div>
    </div>
  )
}
