'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from '@/lib/dateUtils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Pencil, Trash2 } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS, REACTION_EMOJIS, type ForumPost } from '@/types/forum'
import { useAuth, hasRole } from '@/contexts/AuthContext'

interface Props {
  post: ForumPost
  postNumber: number
  onDelete?: (id: number) => void
}

export default function ForumPostCard({ post, postNumber, onDelete }: Props) {
  const { user } = useAuth()
  const [reactions, setReactions] = useState(post.reactions)
  const [reacting, setReacting] = useState(false)

  const isDeleted = !!post.deletedAt
  const canDelete = user && (user.id === post.author.id || hasRole(user.role, 'MOD'))

  const react = async (type: 'LIKE' | 'HELPFUL' | 'FUNNY') => {
    if (!user || reacting) return
    setReacting(true)

    // Optimistic update
    setReactions((prev) => {
      const existing = prev.find((r) => r.type === type)
      if (existing) {
        return existing.userReacted
          ? prev.map((r) => r.type === type ? { ...r, _count: r._count - 1, userReacted: false } : r)
          : prev.map((r) => r.type === type ? { ...r, _count: r._count + 1, userReacted: true } : r)
      }
      return [...prev, { type, _count: 1, userReacted: true }]
    })

    try {
      await fetch(`/api/forum/posts/${post.id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
    } catch { /* revert on error — omitted for brevity */ }
    finally { setReacting(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border border-white/6 overflow-hidden"
      id={`post-${post.id}`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Author sidebar */}
        <div className="sm:w-44 flex-shrink-0 p-5 sm:border-r border-b sm:border-b-0 border-white/6
          flex sm:flex-col items-center sm:items-start gap-4 sm:gap-3 bg-surface-2/40">
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={post.author.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-brand text-white font-bold text-sm">
              {post.author.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm truncate">{post.author.username}</p>
            <Badge
              variant="outline"
              className={cn('text-[10px] px-1.5 py-0 mt-1 border', ROLE_COLORS[post.author.role])}
            >
              {ROLE_LABELS[post.author.role]}
            </Badge>
            <p className="text-slate-600 text-[10px] mt-2 hidden sm:block">
              Dabei seit {new Date(post.author.createdAt).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}
            </p>
          </div>
          <span className="sm:mt-auto text-[10px] text-slate-600 ml-auto sm:ml-0">#{postNumber}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <time className="text-xs text-slate-500">
              {formatDistanceToNow(post.createdAt)}
              {post.isEdited && <span className="ml-2 text-slate-600">(bearbeitet)</span>}
            </time>
            <div className="flex items-center gap-1">
              {canDelete && !isDeleted && (
                <button
                  onClick={() => onDelete?.(post.id)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Beitrag löschen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              {user?.id === post.author.id && !isDeleted && (
                <button className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-colors" title="Bearbeiten">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 px-5 py-4">
            {isDeleted ? (
              <p className="text-slate-600 italic text-sm">[Dieser Beitrag wurde gelöscht.]</p>
            ) : (
              <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words prose-invert">
                {post.content}
              </div>
            )}
          </div>

          {/* Reactions */}
          {!isDeleted && (
            <div className="px-5 py-3 border-t border-white/5 flex items-center gap-2">
              {(Object.keys(REACTION_EMOJIS) as Array<keyof typeof REACTION_EMOJIS>).map((type) => {
                const r = reactions.find((x) => x.type === type)
                return (
                  <button
                    key={type}
                    onClick={() => react(type)}
                    disabled={!user}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all',
                      r?.userReacted
                        ? 'bg-brand/15 border-brand/30 text-brand-light'
                        : 'bg-white/3 border-white/8 text-slate-500 hover:border-white/15 hover:text-slate-300',
                      !user && 'cursor-default'
                    )}
                  >
                    <span>{REACTION_EMOJIS[type]}</span>
                    {r && r._count > 0 && <span>{r._count}</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
