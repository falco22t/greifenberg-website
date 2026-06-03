import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const books = await prisma.lawBook.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { chapters: true } },
        chapters: {
          include: { _count: { select: { paragraphs: true } } },
        },
      },
    })

    return NextResponse.json({ books })
  } catch (err) {
    console.error('[GET /api/laws]', err)
    return NextResponse.json({ error: 'Fehler beim Laden der Gesetzbücher.' }, { status: 500 })
  }
}
