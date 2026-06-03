import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Pin, Lock, MessageSquare, Plus, Clock, Eye } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from '@/lib/dateUtils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const revalidate = 15

interface Props {
  params: Promise<{ category: string }>
  searchParams: Promise<{ page?: string }>
}

const PAGE_SIZE = 20

async function getData(slug: string, page: number) {
  try {
    const category = await prisma.forumCategory.findUnique({ where: { slug } })
    if (!category || !category.isVisible) return null

    const [threads, total] = await Promise.all([
      prisma.forumThread.findMany({
        where: { categoryId: category.id },
        orderBy: [{ isPinned: 'desc' }, { lastPostAt: 'desc' }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          author: { select: { id: true, username: true, avatarUrl: true, role: true } },
        },
      }),
      prisma.forumThread.count({ where: { categoryId: category.id } }),
    ])
    return { category, threads, total, pages: Math.ceil(total / PAGE_SIZE) }
  } catch { return null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params
  const data = await getData(slug, 1)
  return { title: data?.category.name ?? 'Forum' }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params
  const { page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))

  const data = await getData(slug, page)
  if (!data) notFound()

  const { category, threads, total, pages } = data

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb + Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">Startseite</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/forum" className="hover:text-slate-300 transition-colors">Forum</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-300">{category.name}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">{category.name}</h1>
              {category.description && (
                <p className="text-slate-400 mt-1">{category.description}</p>
              )}
            </div>
            <Link
              href={`/forum/${slug}/neu`}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl
                gradient-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Neuer Thread
            </Link>
          </div>
        </div>

        {/* Threads */}
        {threads.length === 0 ? (
          <div className="glass rounded-2xl border border-white/6 p-16 text-center">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">Noch keine Threads</p>
            <p className="text-slate-400 text-sm">Sei der Erste und erstelle einen Thread!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/forum/${slug}/${thread.slug}`}
                className="group flex items-center gap-4 glass rounded-xl border border-white/6
                  hover:border-white/12 transition-all p-4"
              >
                {/* Status icons */}
                <div className="flex flex-col items-center gap-1 w-5 flex-shrink-0">
                  {thread.isPinned && <Pin className="w-3.5 h-3.5 text-brand-light" />}
                  {thread.isLocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                  {!thread.isPinned && !thread.isLocked && (
                    <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>

                {/* Author avatar */}
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarImage src={thread.author.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-surface-3 text-slate-400 text-xs font-bold">
                    {thread.author.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Thread info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    {thread.isPinned && (
                      <Badge variant="outline" className="text-[10px] border-brand/30 text-brand-light px-1.5 py-0">Angepinnt</Badge>
                    )}
                    {thread.isLocked && (
                      <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-500 px-1.5 py-0">Gesperrt</Badge>
                    )}
                    <span className="font-semibold text-white text-sm group-hover:text-brand-light transition-colors truncate">
                      {thread.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    von <span className="text-slate-400">{thread.author.username}</span>
                  </p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-5 text-xs text-slate-500 flex-shrink-0">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />{thread.repliesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />{thread.viewsCount}
                  </span>
                  <span className="flex items-center gap-1 text-right min-w-[80px] justify-end">
                    <Clock className="w-3.5 h-3.5" />{formatDistanceToNow(thread.lastPostAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/forum/${slug}?page=${p}`}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all
                  ${p === page
                    ? 'gradient-brand text-white'
                    : 'glass border border-white/8 text-slate-400 hover:text-white hover:border-white/15'
                  }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}

        <p className="text-center text-slate-600 text-xs mt-4">{total} Threads insgesamt</p>
      </div>
    </div>
  )
}
