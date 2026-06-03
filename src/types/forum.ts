import type { UserRole } from '@prisma/client'

export interface ForumAuthor {
  id: number
  username: string
  avatarUrl: string | null
  role: UserRole
  createdAt: string
}

export interface ForumReaction {
  type: 'LIKE' | 'HELPFUL' | 'FUNNY'
  _count: number
  userReacted: boolean
}

export interface ForumPost {
  id: number
  content: string
  isFirstPost: boolean
  isEdited: boolean
  editedAt: string | null
  createdAt: string
  deletedAt: string | null
  author: ForumAuthor
  reactions: ForumReaction[]
}

export interface ForumThread {
  id: number
  title: string
  slug: string
  isPinned: boolean
  isLocked: boolean
  viewsCount: number
  repliesCount: number
  createdAt: string
  updatedAt: string
  lastPostAt: string
  author: ForumAuthor
  category: { id: number; name: string; slug: string }
  firstPost?: ForumPost
}

export interface ForumCategory {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  requiredRole: UserRole
  sortOrder: number
  isVisible: boolean
  _count: { threads: number }
  latestThread?: {
    title: string
    slug: string
    lastPostAt: string
    author: { username: string }
  } | null
}

export const ROLE_LABELS: Record<UserRole, string> = {
  GUEST:  'Gast',
  USER:   'Mitglied',
  MOD:    'Moderator',
  ADMIN:  'Administrator',
  OWNER:  'Gründer',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  GUEST:  'text-slate-400 border-slate-600',
  USER:   'text-slate-300 border-slate-500',
  MOD:    'text-green-400 border-green-600',
  ADMIN:  'text-brand-light border-brand',
  OWNER:  'text-amber-400 border-amber-600',
}

export const REACTION_EMOJIS = { LIKE: '👍', HELPFUL: '💡', FUNNY: '😄' } as const
