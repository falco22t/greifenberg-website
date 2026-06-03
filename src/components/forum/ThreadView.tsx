'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Pin, Lock, Eye, MessageSquare, ArrowLeft, ArrowUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import ForumPostCard from './ForumPostCard'
import ReplyComposer from './ReplyComposer'
import { formatDate } from '@/lib/dateUtils'
import type { ForumThread, ForumPost } from '@/types/forum'

interface Props {
  thread: ForumThread
  posts: ForumPost[]
  categorySlug: string
  pagination: { page: number; total: number; pages: number; pageSize: number }
}

export default function ThreadView({ thread, posts: initialPosts, categorySlug, pagination }: Props) {
  const [posts, setPosts] = useState<ForumPost[]>(initialPosts)

  const handlePosted = (newPost: unknown) => {
    setPosts((prev) => [...prev, newPost as ForumPost])
    setTimeout(() => {
      const el = document.getElementById(`post-${(newPost as ForumPost).id}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const handleDelete = async (postId: number) => {
    if (!confirm('Beitrag wirklich löschen?')) return
    // Soft-delete: content ersetzen (via API — hier nur UI-Update)
    setPosts((prev) =>
      prev.map((p) => p.id === postId ? { ...p, deletedAt: new Date().toISOString() } : p)
    )
  }

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-slate-300 transition-colors">Startseite</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/forum" className="hover:text-slate-300 transition-colors">Forum</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/forum/${categorySlug}`} className="hover:text-slate-300 transition-colors">
            {thread.category.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300 truncate max-w-[200px]">{thread.title}</span>
        </div>

        {/* Thread Header */}
        <div className="mb-8 pb-6 border-b border-white/8">
          <div className="flex items-start gap-3 mb-3">
            {thread.isPinned && (
              <Badge variant="outline" className="border-brand/30 text-brand-light text-xs flex-shrink-0">
                <Pin className="w-3 h-3 mr-1" />Angepinnt
              </Badge>
            )}
            {thread.isLocked && (
              <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs flex-shrink-0">
                <Lock className="w-3 h-3 mr-1" />Gesperrt
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
            {thread.title}
          </h1>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <span>von <span className="text-slate-300 font-medium">{thread.author.username}</span></span>
            <span>{formatDate(thread.createdAt)}</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{pagination.total} Beiträge</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{thread.viewsCount} Aufrufe</span>
          </div>
        </div>

        {/* Pagination top */}
        {pagination.pages > 1 && (
          <div className="flex items-center gap-2 mb-6">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/forum/${categorySlug}/${thread.slug}?page=${p}`}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all
                  ${p === pagination.page
                    ? 'gradient-brand text-white'
                    : 'glass border border-white/8 text-slate-400 hover:text-white'
                  }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}

        {/* Posts */}
        <div className="space-y-4 mb-8">
          {posts.map((post, i) => (
            <ForumPostCard
              key={post.id}
              post={post}
              postNumber={(pagination.page - 1) * pagination.pageSize + i + 1}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Reply */}
        <ReplyComposer
          threadSlug={thread.slug}
          categorySlug={categorySlug}
          isLocked={thread.isLocked}
          onPosted={handlePosted}
        />

        {/* Back / Top buttons */}
        <div className="flex items-center justify-between mt-8">
          <Link
            href={`/forum/${categorySlug}`}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Zurück zur Kategorie
          </Link>
          <button
            onClick={scrollTop}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            Nach oben <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
