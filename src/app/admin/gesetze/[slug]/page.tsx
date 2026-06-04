import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import LawEditor from '@/components/admin/LawEditor'
import type { LawBook } from '@/types/laws'

export const dynamic = 'force-dynamic'

export default async function AdminLawEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const book = await prisma.lawBook.findUnique({
    where: { slug },
    include: {
      chapters: {
        orderBy: { sortOrder: 'asc' },
        include: { paragraphs: { orderBy: { sortOrder: 'asc' } } },
      },
    },
  }).catch(() => null)

  if (!book) notFound()
  return <LawEditor book={book as unknown as LawBook} />
}
