import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { log, LogAction } from '@/lib/logger'
import type { LawBook, LawChapter, LawParagraph } from '@/types/laws'

type Params = { params: Promise<{ slug: string }> }

interface ChapterPayload extends Omit<LawChapter, 'paragraphs'> {
  _new?: boolean; _deleted?: boolean; _dirty?: boolean
  paragraphs: Array<LawParagraph & { _new?: boolean; _deleted?: boolean; _dirty?: boolean }>
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth('ADMIN')
    const { slug } = await params
    const body = await req.json() as { book: LawBook; chapters: ChapterPayload[] }

    const existing = await prisma.lawBook.findUnique({ where: { slug } })
    if (!existing) return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      // Update book metadata
      await tx.lawBook.update({
        where: { slug },
        data: {
          name: body.book.name,
          description: body.book.description,
          colorAccent: body.book.colorAccent,
          googleDocsSourceUrl: body.book.googleDocsSourceUrl,
          isPublished: body.book.isPublished,
        },
      })

      for (const ch of body.chapters) {
        if (ch._deleted && ch.id > 0) {
          await tx.lawChapter.delete({ where: { id: ch.id } }).catch(() => {})
          continue
        }

        let chapterId = ch.id
        if (ch._new || ch.id < 0) {
          const newCh = await tx.lawChapter.create({
            data: { bookId: existing.id, number: ch.number, title: ch.title, sortOrder: ch.sortOrder },
          })
          chapterId = newCh.id
        } else if (ch._dirty) {
          await tx.lawChapter.update({
            where: { id: ch.id },
            data: { number: ch.number, title: ch.title, sortOrder: ch.sortOrder },
          })
        }

        for (const p of ch.paragraphs) {
          if ((p as { _deleted?: boolean })._deleted && p.id > 0) {
            await tx.lawParagraph.delete({ where: { id: p.id } }).catch(() => {})
            continue
          }
          if ((p as { _new?: boolean })._new || p.id < 0) {
            await tx.lawParagraph.create({
              data: {
                chapterId,
                bookId: existing.id,
                paragraphNumber: p.paragraphNumber,
                title: p.title,
                content: p.content,
                references: Array.isArray(p.references) ? p.references : [],
                sortOrder: p.sortOrder,
              },
            })
          } else if ((p as { _dirty?: boolean })._dirty) {
            await tx.lawParagraph.update({
              where: { id: p.id },
              data: {
                paragraphNumber: p.paragraphNumber,
                title: p.title,
                content: p.content,
                references: Array.isArray(p.references) ? p.references : [],
              },
            })
          }
        }
      }
    })

    await log({ userId: session.userId, action: LogAction.LAW_UPDATE, entityType: 'law_book', entityId: existing.id })
    revalidatePath(`/gesetze/${slug}`)
    revalidatePath('/gesetze')
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    console.error('[PUT /api/admin/laws/[slug]]', err)
    return NextResponse.json({ error: 'Fehler beim Speichern.' }, { status: 500 })
  }
}
