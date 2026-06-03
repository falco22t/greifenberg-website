import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, BookMarked, Clock, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Guides' }
export const revalidate = 0

async function getData() {
  try {
    const [categories, guides] = await Promise.all([
      prisma.guideCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.guide.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: { category: true },
      }),
    ])
    return { categories, guides }
  } catch { return { categories: [], guides: [] } }
}

export default async function GuidesPage() {
  const { categories, guides } = await getData()

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">Startseite</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300">Guides</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl glass-brand border border-brand/20 flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-brand-light" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Guides</h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl">
            Alles was du für Greifenberg RP wissen musst — von den Admins gepflegt und stets aktuell.
          </p>
        </div>

        {guides.length === 0 ? (
          <div className="glass rounded-2xl border border-white/6 p-16 text-center">
            <BookMarked className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-white font-semibold mb-1">Noch keine Guides vorhanden</p>
            <p className="text-slate-400 text-sm">Guides werden über das Admin-Panel gepflegt.</p>
          </div>
        ) : categories.length > 0 ? (
          /* Nach Kategorien gruppiert */
          <div className="space-y-12">
            {categories.map((cat) => {
              const catGuides = guides.filter((g) => g.categoryId === cat.id)
              if (catGuides.length === 0) return null
              return (
                <div key={cat.id}>
                  <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-brand inline-block" />
                    {cat.name}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {catGuides.map((guide) => (
                      <GuideCard key={guide.id} guide={guide} />
                    ))}
                  </div>
                </div>
              )
            })}
            {/* Guides ohne Kategorie */}
            {guides.filter((g) => !g.categoryId).length > 0 && (
              <div>
                <h2 className="text-lg font-black text-white mb-4">Sonstiges</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {guides.filter((g) => !g.categoryId).map((guide) => (
                    <GuideCard key={guide.id} guide={guide} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Flat list ohne Kategorien */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guides.map((guide) => <GuideCard key={guide.id} guide={guide} />)}
          </div>
        )}

        {/* Discord CTA */}
        <div className="mt-12 p-6 glass-brand rounded-2xl border border-brand/20 text-center">
          <p className="text-white font-bold mb-1">Noch Fragen?</p>
          <p className="text-slate-400 text-sm mb-4">Unser Team hilft dir auf Discord weiter.</p>
          <a href="https://discord.gg/TspeGxXr2C" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white font-semibold text-sm hover:opacity-90 transition-opacity">
            Discord beitreten <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

function GuideCard({ guide }: { guide: { id: number; slug: string; title: string; content: string; estimatedReadMinutes: number; category: { name: string; color?: string | null } | null } }) {
  const excerpt = guide.content.replace(/<[^>]*>/g, '').slice(0, 120)
  return (
    <Link href={`/guides/${guide.slug}`}
      className="glass rounded-xl border border-white/6 p-5 hover:border-brand/25 transition-all group">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-white text-sm group-hover:text-brand-light transition-colors leading-snug flex-1 pr-3">
          {guide.title}
        </h3>
        <span className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
          <Clock className="w-3 h-3" /> {guide.estimatedReadMinutes} min
        </span>
      </div>
      {excerpt && <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{excerpt}…</p>}
      {guide.category && (
        <span className="mt-3 inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold"
          style={{ backgroundColor: '#1C559A20', color: '#2E6EC5' }}>
          {guide.category.name}
        </span>
      )}
    </Link>
  )
}
