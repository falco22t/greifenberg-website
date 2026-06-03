import { prisma } from '@/lib/prisma'
import { MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const revalidate = 0

export default async function AdminForumPage() {
  const threads = await prisma.forumThread.findMany({
    orderBy: { createdAt: 'desc' }, take: 50,
    include: { author: { select: { username: true } }, category: { select: { name: true } } },
  }).catch(() => [] as never[])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-white flex items-center gap-2 mb-6">
        <MessageSquare className="w-6 h-6 text-brand-light" /> Forum-Moderation
      </h1>
      <div className="glass rounded-2xl border border-white/6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6 text-left">
              {['Thread', 'Kategorie', 'Von', 'Antworten', 'Status', 'Erstellt'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {threads.map((t) => (
              <tr key={t.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-white font-medium max-w-[250px] truncate">{t.title}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{t.category.name}</td>
                <td className="px-4 py-3 text-slate-400">{t.author.username}</td>
                <td className="px-4 py-3 text-slate-400">{t.repliesCount}</td>
                <td className="px-4 py-3 flex gap-1">
                  {t.isPinned && <Badge variant="outline" className="text-[10px] border-brand/30 text-brand-light">Angepinnt</Badge>}
                  {t.isLocked && <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-500">Gesperrt</Badge>}
                  {!t.isPinned && !t.isLocked && <span className="text-slate-600 text-xs">Normal</span>}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString('de-DE')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {threads.length === 0 && <div className="py-12 text-center text-slate-500">Keine Threads.</div>}
      </div>
    </div>
  )
}
