import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ThreadView from '@/components/forum/ThreadView'

interface Props {
  params: Promise<{ category: string; thread: string }>
  searchParams: Promise<{ page?: string }>
}

const PAGE_SIZE = 15

async function getData(threadSlug: string, page: number) {
  try {
    const thread = await prisma.forumThread.findUnique({
      where: { slug: threadSlug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, username: true, avatarUrl: true, role: true, createdAt: true } },
      },
    })
    if (!thread) return null

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where: { threadId: thread.id },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          author: { select: { id: true, username: true, avatarUrl: true, role: true, createdAt: true } },
          reactions: { select: { type: true, userId: true } },
        },
      }),
      prisma.forumPost.count({ where: { threadId: thread.id } }),
    ])

    // Views erhöhen
    prisma.forumThread.update({
      where: { id: thread.id },
      data: { viewsCount: { increment: 1 } },
    }).catch(() => {})

    const postsWithReactions = posts.map((p) => {
      const grouped: Record<string, { count: number }> = {}
      for (const r of p.reactions) {
        grouped[r.type] = { count: (grouped[r.type]?.count ?? 0) + 1 }
      }
      return {
        ...p,
        reactions: Object.entries(grouped).map(([type, d]) => ({ type, _count: d.count, userReacted: false })),
      }
    })

    return { thread, posts: postsWithReactions, total, pages: Math.ceil(total / PAGE_SIZE) }
  } catch { return null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { thread: slug } = await params
  const data = await getData(slug, 1)
  return { title: data?.thread.title ?? 'Thread' }
}

export default async function ThreadPage({ params, searchParams }: Props) {
  const { thread: threadSlug, category: categorySlug } = await params
  const { page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))

  const data = await getData(threadSlug, page)
  if (!data) notFound()

  return (
    <ThreadView
      thread={data.thread as unknown as Parameters<typeof ThreadView>[0]['thread']}
      posts={data.posts as unknown as Parameters<typeof ThreadView>[0]['posts']}
      categorySlug={categorySlug}
      pagination={{ page, total: data.total, pages: data.pages, pageSize: PAGE_SIZE }}
    />
  )
}
