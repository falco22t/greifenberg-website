import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ChevronRight, Calendar, User, ArrowLeft, Tag } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type Props = { params: Promise<{ slug: string }> }
export const revalidate = 0

async function getPost(slug: string) {
  try {
    return await prisma.newsPost.findUnique({
      where: { slug, isPublished: true },
      include: { author: { select: { username: true, avatarUrl: true, role: true } }, category: true },
    })
  } catch { return null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Nicht gefunden' }
  return { title: post.title, description: post.excerpt ?? undefined }
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const tags = Array.isArray(post.tags) ? (post.tags as string[]) : []

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">Startseite</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/news" className="hover:text-slate-300 transition-colors">News</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300 truncate max-w-[200px]">{post.title}</span>
        </div>

        {/* Hero image */}
        {post.thumbnailUrl && (
          <div className="mb-8 rounded-2xl overflow-hidden h-64 sm:h-80">
            <img src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Category + Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {post.category && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: post.category.color + '20', color: post.category.color }}>
              {post.category.name}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <User className="w-3.5 h-3.5" />
            {post.author.username}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-4">
          {post.title}
        </h1>
        {post.excerpt && <p className="text-lg text-slate-400 mb-8 leading-relaxed">{post.excerpt}</p>}

        {/* Divider */}
        <div className="border-t border-white/8 mb-8" />

        {/* Content */}
        <div className="prose prose-invert prose-sm max-w-none
          prose-headings:font-bold prose-headings:text-white
          prose-p:text-slate-300 prose-p:leading-relaxed
          prose-strong:text-white
          prose-code:text-brand-light prose-code:bg-brand/10 prose-code:px-1 prose-code:rounded
          prose-a:text-brand-light prose-a:no-underline hover:prose-a:underline
          prose-blockquote:border-brand/40 prose-blockquote:text-slate-400
          whitespace-pre-wrap text-slate-300 leading-relaxed text-sm"
        >
          {post.content}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/8">
            <Tag className="w-4 h-4 text-slate-500 mt-0.5" />
            {tags.map((tag: string) => (
              <span key={tag} className="text-xs px-2.5 py-1 glass rounded-lg border border-white/8 text-slate-400">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Back */}
        <div className="mt-10">
          <Link href="/news" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Zurück zur Übersicht
          </Link>
        </div>
      </div>
    </div>
  )
}
