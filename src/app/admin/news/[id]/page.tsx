import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import NewsEditor from '@/components/admin/NewsEditor'

export default async function AdminNewsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [post, categories] = await Promise.all([
    prisma.newsPost.findUnique({
      where: { id: Number(id) },
      include: { category: true },
    }).catch(() => null),
    prisma.newsCategory.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []),
  ])

  if (!post) notFound()

  return (
    <NewsEditor
      categories={categories}
      initial={{
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt ?? '',
        content: post.content,
        thumbnailUrl: post.thumbnailUrl ?? '',
        categoryId: post.categoryId ?? undefined,
        tags: Array.isArray(post.tags) ? (post.tags as string[]) : [],
        isPublished: post.isPublished,
      }}
    />
  )
}
