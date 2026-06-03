import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { log, LogAction } from '@/lib/logger'
import { z } from 'zod'

const PAGE_SIZE = 15

type RouteParams = { params: Promise<{ category: string; thread: string }> }

// GET /api/forum/[category]/[thread] — Thread mit Posts
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { thread: threadSlug } = await params
    const page = Number(req.nextUrl.searchParams.get('page') ?? 1)
    const session = await getSession()

    const thread = await prisma.forumThread.findUnique({
      where: { slug: threadSlug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, username: true, avatarUrl: true, role: true, createdAt: true } },
      },
    })
    if (!thread) return NextResponse.json({ error: 'Thread nicht gefunden.' }, { status: 404 })

    // Views erhöhen (nicht await um Response nicht zu blockieren)
    prisma.forumThread.update({
      where: { id: thread.id },
      data: { viewsCount: { increment: 1 } },
    }).catch(() => {})

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where: { threadId: thread.id },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          author: { select: { id: true, username: true, avatarUrl: true, role: true, createdAt: true } },
          reactions: {
            select: { type: true, userId: true },
          },
        },
      }),
      prisma.forumPost.count({ where: { threadId: thread.id } }),
    ])

    // Reactions aggregieren
    const postsWithReactions = posts.map((post) => {
      const grouped: Record<string, { count: number; userReacted: boolean }> = {}
      for (const r of post.reactions) {
        if (!grouped[r.type]) grouped[r.type] = { count: 0, userReacted: false }
        grouped[r.type].count++
        if (session && r.userId === session.userId) grouped[r.type].userReacted = true
      }
      return {
        ...post,
        reactions: Object.entries(grouped).map(([type, data]) => ({
          type, _count: data.count, userReacted: data.userReacted,
        })),
      }
    })

    return NextResponse.json({
      thread,
      posts: postsWithReactions,
      pagination: { page, total, pages: Math.ceil(total / PAGE_SIZE), pageSize: PAGE_SIZE },
    })
  } catch (err) {
    console.error('[GET /api/forum/[category]/[thread]]', err)
    return NextResponse.json({ error: 'Fehler beim Laden des Threads.' }, { status: 500 })
  }
}

const replySchema = z.object({
  content: z.string().min(10, 'Mindestens 10 Zeichen').max(10000, 'Maximal 10.000 Zeichen'),
})

// POST /api/forum/[category]/[thread] — Antwort schreiben
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })

    const { thread: threadSlug } = await params
    const body = await req.json()
    const parsed = replySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    }

    const thread = await prisma.forumThread.findUnique({ where: { slug: threadSlug } })
    if (!thread) return NextResponse.json({ error: 'Thread nicht gefunden.' }, { status: 404 })
    if (thread.isLocked) return NextResponse.json({ error: 'Dieser Thread ist gesperrt.' }, { status: 403 })

    const [post] = await prisma.$transaction([
      prisma.forumPost.create({
        data: { threadId: thread.id, authorId: session.userId, content: parsed.data.content },
        include: {
          author: { select: { id: true, username: true, avatarUrl: true, role: true, createdAt: true } },
        },
      }),
      prisma.forumThread.update({
        where: { id: thread.id },
        data: { repliesCount: { increment: 1 }, lastPostAt: new Date() },
      }),
    ])

    await log({
      userId: session.userId,
      action: LogAction.FORUM_POST_CREATE,
      entityType: 'forum_post',
      entityId: post.id,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    })

    return NextResponse.json({ post: { ...post, reactions: [] } }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/forum/[category]/[thread]]', err)
    return NextResponse.json({ error: 'Fehler beim Erstellen der Antwort.' }, { status: 500 })
  }
}
