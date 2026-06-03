import { prisma } from '@/lib/prisma'
import NewsEditor from '@/components/admin/NewsEditor'

export default async function AdminNewsNewPage() {
  const categories = await prisma.newsCategory.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => [])
  return <NewsEditor categories={categories} />
}
