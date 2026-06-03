export interface LawParagraph {
  id: number
  paragraphNumber: string
  title: string
  content: string
  references: Array<{ bookSlug: string; paragraphNumber: string; label: string }>
  sortOrder: number
  chapterId: number
  bookId: number
  createdAt: string
  updatedAt: string
}

export interface LawChapter {
  id: number
  number: string
  title: string
  sortOrder: number
  bookId: number
  paragraphs: LawParagraph[]
}

export interface LawBook {
  id: number
  name: string
  slug: string
  description: string | null
  colorAccent: string
  sortOrder: number
  isPublished: boolean
  googleDocsSourceUrl: string | null
  lastSyncedAt: string | null
  createdAt: string
  chapters: LawChapter[]
}

export interface LawBookSummary extends Omit<LawBook, 'chapters'> {
  _count: { chapters: number }
  chapters: Array<{ id: number; _count: { paragraphs: number } }>
}

export function paragraphAnchor(paragraphNumber: string): string {
  return paragraphNumber.replace(/[§\s.]/g, '').toLowerCase()
}
