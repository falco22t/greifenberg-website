import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { log, LogAction } from '@/lib/logger'
import type { LawBook, LawChapter, LawParagraph } from '@/types/laws'

type Params = { params: Promise<{ slug: string }> }

interface ChapterPayload extends Omit<LawChapter, 'paragraphs'> {
  _deleted?: boolean
  paragraphs: Array<LawParagraph & { _deleted?: boolean }>
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth('ADMIN')
    const { slug } = await params
    const body = await req.json() as { book: LawBook; chapters: ChapterPayload[] }

    const existing = await prisma.lawBook.findUnique({ where: { slug } })
    if (!existing) return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      // Buchmetadaten aktualisieren
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
        // Kapitel löschen
        if (ch._deleted) {
          if (ch.id > 0) await tx.lawChapter.delete({ where: { id: ch.id } }).catch(() => {})
          continue
        }

        let chapterId: number

        if (ch.id < 0) {
          // Negative ID = neues Kapitel anlegen
          const newCh = await tx.lawChapter.create({
            data: { bookId: existing.id, number: ch.number, title: ch.title, sortOrder: ch.sortOrder },
          })
          chapterId = newCh.id
        } else {
          // Positive ID = immer aktualisieren (kein Duplikat möglich)
          await tx.lawChapter.update({
            where: { id: ch.id },
            data: { number: ch.number, title: ch.title, sortOrder: ch.sortOrder },
          }).catch(() => {}) // Fehler ignorieren falls Kapitel fehlt
          chapterId = ch.id
        }

        // Paragraphen verarbeiten
        for (const p of ch.paragraphs) {
          if (p._deleted) {
            if (p.id > 0) await tx.lawParagraph.delete({ where: { id: p.id } }).catch(() => {})
            continue
          }

          if (p.id < 0) {
            // Negative ID = neuen Paragraphen anlegen
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
          } else {
            // Positive ID = immer aktualisieren
            await tx.lawParagraph.update({
              where: { id: p.id },
              data: {
                paragraphNumber: p.paragraphNumber,
                title: p.title,
                content: p.content,
                references: Array.isArray(p.references) ? p.references : [],
                sortOrder: p.sortOrder,
              },
            }).catch(() => {})
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
