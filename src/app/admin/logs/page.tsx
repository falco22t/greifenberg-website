import { prisma } from '@/lib/prisma'
import { FileText, Search } from 'lucide-react'
import { formatDate } from '@/lib/dateUtils'

export const revalidate = 0

async function getLogs(page: number) {
  try {
    const PAGE = 50
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE,
        take: PAGE,
        include: { user: { select: { username: true } } },
      }),
      prisma.activityLog.count(),
    ])
    return { logs, total, pages: Math.ceil(total / PAGE) }
  } catch { return { logs: [], total: 0, pages: 0 } }
}

export default async function AdminLogsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))
  const { logs, total } = await getLogs(page)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-light" /> Activity Logs
        </h1>
        <p className="text-slate-400 text-sm mt-1">{total.toLocaleString()} Einträge gesamt</p>
      </div>

      <div className="glass rounded-2xl border border-white/6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/6 text-left">
                {['Zeit', 'Benutzer', 'Aktion', 'Entität', 'ID', 'IP'].map((h) => (
                  <th key={h} className="px-4 py-3 text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{formatDate(log.createdAt.toISOString())}</td>
                  <td className="px-4 py-2.5 text-white font-medium">{log.user?.username ?? <span className="text-slate-600">System</span>}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded bg-brand/10 text-brand-light font-mono">{log.action}</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-400">{log.entityType ?? '—'}</td>
                  <td className="px-4 py-2.5 text-slate-600">{log.entityId ?? '—'}</td>
                  <td className="px-4 py-2.5 text-slate-600 font-mono">{log.ipAddress ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <div className="py-12 text-center text-slate-500">Noch keine Logs.</div>}
        </div>
      </div>
    </div>
  )
}
