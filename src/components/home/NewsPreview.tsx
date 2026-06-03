import Link from 'next/link'
import { ArrowRight, Calendar, Tag } from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getLatestNews() {
  try {
    return await prisma.newsPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      include: {
        author: { select: { username: true } },
        category: true,
      },
    })
  } catch { return [] }
}

export default async function NewsPreview() {
  const posts = await getLatestNews()

  if (posts.length === 0) return null

  return (
    <section className="py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-brand-light font-semibold text-sm uppercase tracking-widest mb-3">Aktuelles</p>
            <h2 className="text-4xl font-black text-white tracking-tight">Neuigkeiten</h2>
          </div>
          <Link href="/news" className="hidden sm:flex items-center gap-2 text-brand-light hover:text-white text-sm font-medium transition-colors group">
            Alle News <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/news/${post.slug}`}
              className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-brand/25 transition-all duration-300 group">
              <div className="h-44 border-b border-white/5 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${post.category?.color ?? '#1C559A'}20, transparent)` }}>
                {post.thumbnailUrl
                  ? <img src={post.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  : <Tag className="w-8 h-8 text-white/10" />
                }
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  {post.category && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ backgroundColor: post.category.color + '20', color: post.category.color }}>
                      {post.category.name}
                    </span>
                  )}
                  <span className="text-slate-500 text-xs flex items-center gap-1 ml-auto">
                    <Calendar className="w-3 h-3" />
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('de-DE') : ''}
                  </span>
                </div>
                <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-brand-light transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && <p className="text-slate-400 text-sm line-clamp-2">{post.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
