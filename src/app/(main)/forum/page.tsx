import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageSquare, ChevronRight, Clock, Pin, Lock } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from '@/lib/dateUtils'
import type { ForumCategory } from '@/types/forum'

export const metadata: Metadata = { title: 'Forum' }
export const revalidate = 30

async function getCategories(): Promise<ForumCategory[]> {
  try {
    const cats = await prisma.forumCategory.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { threads: true } },
        threads: {
          orderBy: { lastPostAt: 'desc' },
          take: 1,
          select: {
            title: true, slug: true, lastPostAt: true,
            author: { select: { username: true } },
          },
        },
      },
    })
    return cats.map((c) => ({ ...c, latestThread: c.threads[0] ?? null, threads: undefined })) as unknown as ForumCategory[]
  } catch { return [] }
}

export default async function ForumPage() {
  const categories = await getCategories()

  const totalThreads = categories.reduce((a, c) => a + c._count.threads, 0)

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">Startseite</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-300">Forum</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight mb-1">Forum</h1>
              <p className="text-slate-400">
                {categories.length} Kategorien · {totalThreads} Threads
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        {categories.length === 0 ? (
          <div className="glass rounded-2xl border border-white/6 p-16 text-center">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Noch keine Kategorien vorhanden.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/forum/${cat.slug}`}
                className="group block glass rounded-2xl border border-white/6 hover:border-white/12 transition-all duration-200"
              >
                <div className="flex items-center gap-4 p-5">
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl glass-brand border border-brand/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-brand-light" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-white group-hover:text-brand-light transition-colors mb-0.5">
                      {cat.name}
                    </h2>
                    {cat.description && (
                      <p className="text-slate-400 text-sm truncate">{cat.description}</p>
                    )}
                  </div>

                  {/* Latest thread */}
                  {cat.latestThread && (
                    <div className="hidden md:block text-right min-w-0 max-w-[200px]">
                      <p className="text-white text-xs font-medium truncate">{cat.latestThread.title}</p>
                      <p className="text-slate-500 text-xs flex items-center justify-end gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(cat.latestThread.lastPostAt)}
                      </p>
                    </div>
                  )}

                  {/* Count */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-white text-sm font-bold">{cat._count.threads}</p>
                    <p className="text-slate-500 text-xs">Threads</p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-brand-light group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Forum Rules hint */}
        <div className="mt-8 p-4 glass-brand rounded-xl border border-brand/15 text-sm text-slate-400 flex items-start gap-3">
          <Lock className="w-4 h-4 text-brand-light mt-0.5 flex-shrink-0" />
          <span>
            Bitte halte dich an das{' '}
            <Link href="/regelwerk" className="text-brand-light hover:text-white transition-colors">Regelwerk</Link>
            . Bei Verstößen können Beiträge gelöscht und Accounts gesperrt werden.
          </span>
        </div>
      </div>
    </div>
  )
}
