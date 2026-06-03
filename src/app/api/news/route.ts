import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { log, LogAction } from '@/lib/logger'
import { z } from 'zod'

const PAGE_SIZE = 9

export async function GET(req: NextRequest) {
  const page = Number(req.nextUrl.searchParams.get('page') ?? 1)
  const category = req.nextUrl.searchParams.get('category') ?? undefined

  const where = {
    isPublished: true,
    ...(category && { category: { slug: category } }),
  }

  const [posts, total, categories] = await Promise.all([
    prisma.newsPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        author: { select: { username: true, avatarUrl: true } },
        category: true,
      },
    }),
    prisma.newsPost.count({ where }),
    prisma.newsCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  return NextResponse.json({ posts, categories, pagination: { page, total, pages: Math.ceil(total / PAGE_SIZE) } })
}

const createSchema = z.object({
  title: z.string().min(5).max(255),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  categoryId: z.number().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth('ADMIN')
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })

    const { title, ...rest } = parsed.data
    const slug = title.toLowerCase()
      .replace(/[äöüß]/g, (c) => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }[c] ?? c))
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
      + '-' + Date.now()

    const post = await prisma.newsPost.create({
      data: {
        title,
        slug,
        authorId: session.userId,
        publishedAt: rest.isPublished ? new Date() : null,
        ...rest,
        tags: rest.tags ?? [],
        thumbnailUrl: rest.thumbnailUrl || null,
        categoryId: rest.categoryId ?? null,
      },
    })

    await log({ userId: session.userId, action: LogAction.NEWS_CREATE, entityType: 'news_post', entityId: post.id })
    return NextResponse.json({ post }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}
