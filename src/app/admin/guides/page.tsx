import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookMarked, Plus, Pencil, Eye, EyeOff, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const revalidate = 0

export default async function AdminGuidesPage() {
  const guides = await prisma.guide.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: { category: true },
  }).catch(() => [])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-brand-light" /> Guides
          </h1>
          <p className="text-slate-400 text-sm mt-1">{guides.length} Guides</p>
        </div>
        <Link href="/admin/guides/neu">
          <Button className="gradient-brand text-white gap-2 font-semibold">
            <Plus className="w-4 h-4" /> Neuer Guide
          </Button>
        </Link>
      </div>

      <div className="glass rounded-2xl border border-white/6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6 text-left">
              {['Titel', 'Kategorie', 'Lesezeit', 'Status', 'Sortierung', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guides.map((g) => (
              <tr key={g.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-white font-medium max-w-[250px] truncate">{g.title}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{g.category?.name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-400 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />{g.estimatedReadMinutes} min
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={g.isPublished ? 'border-green-500/40 text-green-400 text-xs' : 'border-slate-600 text-slate-500 text-xs'}>
                    {g.isPublished ? <><Eye className="w-3 h-3 mr-1" />Veröffentlicht</> : <><EyeOff className="w-3 h-3 mr-1" />Entwurf</>}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{g.sortOrder}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/guides/${g.id}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors inline-flex">
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {guides.length === 0 && <div className="py-12 text-center text-slate-500">Noch keine Guides.</div>}
      </div>
    </div>
  )
}
