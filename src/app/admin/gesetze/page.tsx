import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const revalidate = 0

export default async function AdminGesetzbücherPage() {
  const books = await prisma.lawBook.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { chapters: true } }, chapters: { include: { _count: { select: { paragraphs: true } } } } },
  }).catch(() => [] as never[])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-white flex items-center gap-2 mb-6">
        <BookOpen className="w-6 h-6 text-brand-light" /> Gesetzbücher
      </h1>
      <div className="glass rounded-2xl border border-white/6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6 text-left">
              {['Name', 'Kapitel', 'Paragraphen', 'Status', 'Letzte Sync', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {books.map((b) => {
              const paraCount = b.chapters.reduce((a, c) => a + c._count.paragraphs, 0)
              return (
                <tr key={b.id} className="border-b border-white/4 hover:bg-white/2">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: b.colorAccent }} />
                      <span className="text-white font-medium">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{b._count.chapters}</td>
                  <td className="px-4 py-3 text-slate-400">{paraCount}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={b.isPublished ? 'border-green-500/40 text-green-400 text-xs' : 'border-slate-600 text-slate-500 text-xs'}>
                      {b.isPublished ? 'Veröffentlicht' : 'Entwurf'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {b.lastSyncedAt ? new Date(b.lastSyncedAt).toLocaleDateString('de-DE') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/gesetze/${b.slug}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors inline-flex">
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {books.length === 0 && <div className="py-12 text-center text-slate-500">Keine Gesetzbücher.</div>}
      </div>
    </div>
  )
}
