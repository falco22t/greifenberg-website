import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.forumCategory.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { threads: true } },
        threads: {
          orderBy: { lastPostAt: 'desc' },
          take: 1,
          select: {
            title: true,
            slug: true,
            lastPostAt: true,
            author: { select: { username: true } },
          },
        },
      },
    })

    const result = categories.map((cat) => ({
      ...cat,
      latestThread: cat.threads[0] ?? null,
      threads: undefined,
    }))

    return NextResponse.json({ categories: result })
  } catch (err) {
    console.error('[GET /api/forum/categories]', err)
    return NextResponse.json({ error: 'Fehler beim Laden der Kategorien.' }, { status: 500 })
  }
}
