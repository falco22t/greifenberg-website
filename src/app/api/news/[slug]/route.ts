import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { log, LogAction } from '@/lib/logger'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params
  const post = await prisma.newsPost.findUnique({
    where: { slug, isPublished: true },
    include: { author: { select: { username: true, avatarUrl: true, role: true } }, category: true },
  })
  if (!post) return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 })
  return NextResponse.json({ post })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth('OWNER')
    const { slug } = await params
    const body = await req.json()

    const existing = await prisma.newsPost.findUnique({ where: { slug } })
    if (!existing) return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 })

    const post = await prisma.newsPost.update({
      where: { slug },
      data: {
        ...body,
        publishedAt: body.isPublished && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    })

    await log({ userId: session.userId, action: LogAction.NEWS_UPDATE, entityType: 'news_post', entityId: post.id })
    return NextResponse.json({ post })
  } catch { return NextResponse.json({ error: 'Fehler.' }, { status: 500 }) }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth('OWNER')
    const { slug } = await params
    const post = await prisma.newsPost.findUnique({ where: { slug } })
    if (!post) return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 })
    await prisma.newsPost.delete({ where: { slug } })
    await log({ userId: session.userId, action: LogAction.NEWS_DELETE, entityType: 'news_post', entityId: post.id })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Fehler.' }, { status: 500 }) }
}
