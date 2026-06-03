import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Clock, ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'

type Props = { params: Promise<{ slug: string }> }
export const revalidate = 60

async function getGuide(slug: string) {
  try {
    return await prisma.guide.findUnique({
      where: { slug, isPublished: true },
      include: { category: true, author: { select: { username: true } } },
    })
  } catch { return null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = await getGuide(slug)
  return { title: guide?.title ?? 'Guide' }
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params
  const guide = await getGuide(slug)
  if (!guide) notFound()

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">Startseite</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/guides" className="hover:text-slate-300 transition-colors">Guides</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300 truncate max-w-[200px]">{guide.title}</span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {guide.category && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg glass-brand border border-brand/20 text-brand-light">
              {guide.category.name}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" /> {guide.estimatedReadMinutes} Min. Lesezeit
          </span>
          <span className="text-xs text-slate-500">von {guide.author.username}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-8">
          {guide.title}
        </h1>

        <div className="border-t border-white/8 mb-8" />

        {/* Content */}
        <div
          className="prose prose-invert prose-sm max-w-none
            prose-headings:font-bold prose-headings:text-white prose-headings:tracking-tight
            prose-h2:text-xl prose-h3:text-base
            prose-p:text-slate-300 prose-p:leading-relaxed
            prose-strong:text-white prose-strong:font-semibold
            prose-code:text-brand-light prose-code:bg-brand/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
            prose-a:text-brand-light prose-a:no-underline hover:prose-a:underline
            prose-ul:text-slate-300 prose-ol:text-slate-300
            prose-li:marker:text-brand-light"
          dangerouslySetInnerHTML={{ __html: guide.content }}
        />

        {/* Back */}
        <div className="mt-10 pt-6 border-t border-white/8">
          <Link href="/guides" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Zurück zu den Guides
          </Link>
        </div>
      </div>
    </div>
  )
}
