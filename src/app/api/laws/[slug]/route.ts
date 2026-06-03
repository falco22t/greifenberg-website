import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const book = await prisma.lawBook.findUnique({
      where: { slug, isPublished: true },
      include: {
        chapters: {
          orderBy: { sortOrder: 'asc' },
          include: {
            paragraphs: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    })

    if (!book) {
      return NextResponse.json({ error: 'Gesetzbuch nicht gefunden.' }, { status: 404 })
    }

    return NextResponse.json({ book })
  } catch (err) {
    console.error('[GET /api/laws/[slug]]', err)
    return NextResponse.json({ error: 'Fehler beim Laden des Gesetzbuches.' }, { status: 500 })
  }
}
