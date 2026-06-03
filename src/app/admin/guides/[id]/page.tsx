import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import GuideEditor from '@/components/admin/GuideEditor'

export default async function AdminGuideEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [guide, categories] = await Promise.all([
    prisma.guide.findUnique({ where: { id: Number(id) } }).catch(() => null),
    prisma.guideCategory.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []),
  ])
  if (!guide) notFound()
  return <GuideEditor categories={categories} initial={{ ...guide, id: guide.id, slug: guide.slug }} />
}
