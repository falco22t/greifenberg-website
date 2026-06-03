import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { log, LogAction } from '@/lib/logger'
import { z } from 'zod'

const PAGE_SIZE = 20

// GET /api/forum/[category] — Threads einer Kategorie
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category: slug } = await params
    const page = Number(req.nextUrl.searchParams.get('page') ?? 1)

    const category = await prisma.forumCategory.findUnique({ where: { slug } })
    if (!category || !category.isVisible) {
      return NextResponse.json({ error: 'Kategorie nicht gefunden.' }, { status: 404 })
    }

    const [threads, total] = await Promise.all([
      prisma.forumThread.findMany({
        where: { categoryId: category.id },
        orderBy: [{ isPinned: 'desc' }, { lastPostAt: 'desc' }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          author: { select: { id: true, username: true, avatarUrl: true, role: true, createdAt: true } },
          posts: {
            where: { isFirstPost: true, deletedAt: null },
            take: 1,
            select: { content: true },
          },
        },
      }),
      prisma.forumThread.count({ where: { categoryId: category.id } }),
    ])

    return NextResponse.json({
      category,
      threads: threads.map((t) => ({ ...t, excerpt: t.posts[0]?.content.slice(0, 200) ?? '', posts: undefined })),
      pagination: { page, total, pages: Math.ceil(total / PAGE_SIZE), pageSize: PAGE_SIZE },
    })
  } catch (err) {
    console.error('[GET /api/forum/[category]]', err)
    return NextResponse.json({ error: 'Fehler beim Laden der Threads.' }, { status: 500 })
  }
}

const newThreadSchema = z.object({
  title: z.string().min(5, 'Mindestens 5 Zeichen').max(200, 'Maximal 200 Zeichen'),
  content: z.string().min(20, 'Mindestens 20 Zeichen').max(10000, 'Maximal 10.000 Zeichen'),
})

// POST /api/forum/[category] — Neuen Thread erstellen
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })

    const { category: slug } = await params
    const body = await req.json()
    const parsed = newThreadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    }

    const category = await prisma.forumCategory.findUnique({ where: { slug } })
    if (!category) return NextResponse.json({ error: 'Kategorie nicht gefunden.' }, { status: 404 })

    const { title, content } = parsed.data

    // Slug generieren (unique)
    const baseSlug = title.toLowerCase()
      .replace(/[äöüß]/g, (c) => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }[c] ?? c))
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
    const uniqueSlug = `${baseSlug}-${Date.now()}`

    const thread = await prisma.forumThread.create({
      data: {
        categoryId: category.id,
        authorId: session.userId,
        title,
        slug: uniqueSlug,
        lastPostAt: new Date(),
        posts: {
          create: {
            authorId: session.userId,
            content,
            isFirstPost: true,
          },
        },
      },
    })

    await log({
      userId: session.userId,
      action: LogAction.FORUM_THREAD_CREATE,
      entityType: 'forum_thread',
      entityId: thread.id,
      details: { title, categorySlug: slug },
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    })

    return NextResponse.json({ thread: { id: thread.id, slug: thread.slug } }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/forum/[category]]', err)
    return NextResponse.json({ error: 'Fehler beim Erstellen des Threads.' }, { status: 500 })
  }
}
