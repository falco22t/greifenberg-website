import { prisma } from '@/lib/prisma'
import { Users2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const revalidate = 0

export default async function AdminTeamPage() {
  const members = await prisma.teamMember.findMany({
    orderBy: [{ department: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    include: { department: true },
  }).catch(() => [] as never[])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Users2 className="w-6 h-6 text-brand-light" /> Team ({members.length})
        </h1>
      </div>
      <div className="glass rounded-2xl border border-white/6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6 text-left">
              {['Mitglied', 'Position', 'Abteilung', 'Discord', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-white/4 hover:bg-white/2">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-xs font-bold bg-brand/20 text-brand-light">
                        {m.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white font-medium">{m.displayName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">{m.position}</td>
                <td className="px-4 py-3">
                  {m.department ? (
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: m.department.color + '20', color: m.department.color }}>
                      {m.department.name}
                    </span>
                  ) : <span className="text-slate-600">—</span>}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs font-mono">{m.discordTag ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={m.isActive ? 'border-green-500/40 text-green-400 text-xs' : 'border-slate-600 text-slate-500 text-xs'}>
                    {m.isActive ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && <div className="py-12 text-center text-slate-500">Noch keine Teammitglieder.</div>}
      </div>
    </div>
  )
}
