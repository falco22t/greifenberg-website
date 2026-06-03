import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ChevronRight, Calendar, Tag, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'News' }
export const revalidate = 60

async function getData(page: number, category?: string) {
  try {
    const where = { isPublished: true, ...(category ? { category: { slug: category } } : {}) }
    const [posts, total, categories] = await Promise.all([
      prisma.newsPost.findMany({
        where, orderBy: { publishedAt: 'desc' }, skip: (page - 1) * 9, take: 9,
        include: { author: { select: { username: true } }, category: true },
      }),
      prisma.newsPost.count({ where }),
      prisma.newsCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
    ])
    return { posts, total, categories, pages: Math.ceil(total / 9) }
  } catch { return { posts: [], total: 0, categories: [], pages: 0 } }
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>
}) {
  const { page: pageStr, category } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))
  const { posts, total, categories, pages } = await getData(page, category)

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">Startseite</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-300">News</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Neuigkeiten</h1>
              <p className="text-slate-400 mt-1">{total} Beiträge</p>
            </div>
            {/* Category filter */}
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Link href="/news">
                  <Badge variant="outline" className={`cursor-pointer transition-all ${!category ? 'border-brand/50 text-brand-light bg-brand/10' : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
                    Alle
                  </Badge>
                </Link>
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/news?category=${cat.slug}`}>
                    <Badge variant="outline" className={`cursor-pointer transition-all ${category === cat.slug ? 'border-brand/50 text-brand-light bg-brand/10' : 'border-white/10 text-slate-400 hover:border-white/20'}`}
                      style={category === cat.slug ? { borderColor: cat.color + '60', color: cat.color, backgroundColor: cat.color + '15' } : {}}>
                      {cat.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        {posts.length === 0 ? (
          <div className="glass rounded-2xl border border-white/6 p-16 text-center">
            <p className="text-slate-400">Noch keine News vorhanden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className={`group glass rounded-2xl border border-white/6 overflow-hidden hover:border-white/15 transition-all duration-300 flex flex-col ${i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                {/* Thumbnail */}
                <div className="h-44 overflow-hidden relative flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${post.category?.color ?? '#1C559A'}20, ${post.category?.color ?? '#1C559A'}05)` }}>
                  {post.thumbnailUrl
                    ? <img src={post.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center"><Tag className="w-8 h-8 text-white/10" /></div>
                  }
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2.5 mb-3">
                    {post.category && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: post.category.color + '20', color: post.category.color }}>
                        {post.category.name}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto">
                      <Calendar className="w-3 h-3" />
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('de-DE') : 'Entwurf'}
                    </span>
                  </div>
                  <h2 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-brand-light transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && <p className="text-slate-400 text-sm line-clamp-3 flex-1">{post.excerpt}</p>}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <span className="text-xs text-slate-500">{post.author.username}</span>
                    <span className="text-xs text-brand-light flex items-center gap-1 group-hover:gap-2 transition-all">
                      Lesen <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Link key={p} href={`/news?page=${p}${category ? '&category=' + category : ''}`}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${p === page ? 'gradient-brand text-white' : 'glass border border-white/8 text-slate-400 hover:text-white'}`}>
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
