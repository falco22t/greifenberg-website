import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, BookOpen, RefreshCw } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import LawBookView from '@/components/laws/LawBookView'
import type { LawBook } from '@/types/laws'

export const revalidate = 0

interface Props {
  params: Promise<{ slug: string }>
}

async function getBook(slug: string): Promise<LawBook | null> {
  try {
    const book = await prisma.lawBook.findUnique({
      where: { slug, isPublished: true },
      include: {
        chapters: {
          orderBy: { sortOrder: 'asc' },
          include: {
            paragraphs: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    })
    return book as unknown as LawBook | null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const book = await getBook(slug)
  if (!book) return { title: 'Nicht gefunden' }
  return {
    title: book.name,
    description: book.description ?? `${book.name} — Greifenberg RP Gesetzbuch`,
  }
}

export async function generateStaticParams() {
  try {
    const books = await prisma.lawBook.findMany({
      where: { isPublished: true },
      select: { slug: true },
    })
    return books.map((b) => ({ slug: b.slug }))
  } catch {
    return []
  }
}

export default async function LawBookPage({ params }: Props) {
  const { slug } = await params
  const book = await getBook(slug)

  if (!book) notFound()

  const paragraphCount = book.chapters.reduce(
    (acc, ch) => acc + ch.paragraphs.length, 0
  )

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">Startseite</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/gesetze" className="hover:text-slate-300 transition-colors">Gesetzbücher</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300">{book.name}</span>
        </div>

        {/* Book Header */}
        <div className="mb-10 pb-8 border-b border-white/8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: book.colorAccent + '15',
                  border: `1px solid ${book.colorAccent}35`
                }}
              >
                <BookOpen className="w-7 h-7" style={{ color: book.colorAccent }} />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {book.name}
                </h1>
                {book.description && (
                  <p className="text-slate-400 mt-1 max-w-2xl">{book.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Badge variant="outline" className="border-white/10 text-slate-400 text-xs">
                {book.chapters.length} Kapitel
              </Badge>
              <Badge variant="outline" className="border-white/10 text-slate-400 text-xs">
                {paragraphCount} §§
              </Badge>
              {book.lastSyncedAt && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <RefreshCw className="w-3 h-3" />
                  {new Date(book.lastSyncedAt).toLocaleDateString('de-DE')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Book View: Sidebar + Content */}
        <LawBookView book={book} />
      </div>
    </div>
  )
}
