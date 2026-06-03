import { prisma } from '@/lib/prisma'
import GuideEditor from '@/components/admin/GuideEditor'

export default async function AdminGuideNewPage() {
  const categories = await prisma.guideCategory.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => [])
  return <GuideEditor categories={categories} />
}
