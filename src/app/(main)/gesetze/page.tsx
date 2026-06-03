import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Scale, ChevronRight, FileText } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Gesetzbücher' }
export const revalidate = 60

const BOOK_ICONS: Record<string, React.ElementType> = {
  stgb: Scale,
  stvo: FileText,
  default: BookOpen,
}

async function getBooks() {
  try {
    return await prisma.lawBook.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { chapters: true } },
        chapters: {
          include: { _count: { select: { paragraphs: true } } },
        },
      },
    })
  } catch {
    return []
  }
}

export default async function GesetzeOverviewPage() {
  const books = await getBooks()

  const totalParagraphs = books.reduce(
    (acc, b) => acc + b.chapters.reduce((a, c) => a + c._count.paragraphs, 0),
    0
  )

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">Startseite</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-300">Gesetzbücher</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Gesetzbücher
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Alle geltenden Gesetze und Verordnungen auf Greifenberg RP. Durchsuchbar, verlinkbar und stets aktuell.
          </p>

          {books.length > 0 && (
            <div className="flex items-center gap-6 mt-6 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-light" />
                <strong className="text-white">{books.length}</strong> Gesetzbücher
              </span>
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-light" />
                <strong className="text-white">{totalParagraphs}</strong> Paragraphen
              </span>
            </div>
          )}
        </div>

        {/* Books Grid */}
        {books.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {books.map((book) => {
              const Icon = BOOK_ICONS[book.slug] ?? BOOK_ICONS.default
              const paragraphCount = book.chapters.reduce(
                (a, c) => a + c._count.paragraphs, 0
              )

              return (
                <Link
                  key={book.id}
                  href={`/gesetze/${book.slug}`}
                  className="group glass rounded-2xl border border-white/6 p-6 hover:border-white/15
                    transition-all duration-300 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: book.colorAccent + '20', border: `1px solid ${book.colorAccent}40` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: book.colorAccent }} />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs border-white/10 text-slate-400"
                    >
                      {book._count.chapters} Kapitel
                    </Badge>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white mb-1.5 group-hover:text-brand-light transition-colors">
                      {book.name}
                    </h2>
                    {book.description && (
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                        {book.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/5">
                    <span>{paragraphCount} Paragraphen</span>
                    <span className="flex items-center gap-1 text-brand-light group-hover:gap-2 transition-all">
                      Öffnen <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="glass rounded-2xl border border-white/6 p-16 text-center">
      <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
      <h3 className="text-white font-bold text-lg mb-2">Noch keine Gesetzbücher</h3>
      <p className="text-slate-400 text-sm">
        Die Gesetzbücher werden über das Admin-Panel gepflegt.
      </p>
    </div>
  )
}
