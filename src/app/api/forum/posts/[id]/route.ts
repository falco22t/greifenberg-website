import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { log, LogAction } from '@/lib/logger'
import type { UserRole } from '@prisma/client'

const ROLE_ORDER: UserRole[] = ['GUEST', 'USER', 'MOD', 'ADMIN', 'OWNER']

// DELETE /api/forum/posts/[id] — Beitrag löschen (Autor oder MOD+)
// Soft-Delete: setzt deletedAt, Inhalt bleibt erhalten, wird aber als gelöscht angezeigt.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const postId = Number(id)

    const post = await prisma.forumPost.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json({ error: 'Beitrag nicht gefunden.' }, { status: 404 })
    }

    const isMod = ROLE_ORDER.indexOf(session.role) >= ROLE_ORDER.indexOf('MOD')
    if (post.authorId !== session.userId && !isMod) {
      return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    }

    if (post.isFirstPost) {
      return NextResponse.json(
        { error: 'Der erste Beitrag kann nicht gelöscht werden. Lösche stattdessen den ganzen Thread.' },
        { status: 400 }
      )
    }

    if (post.deletedAt) {
      return NextResponse.json({ success: true })
    }

    // Soft-Delete + repliesCount dekrementieren (Antworten zählen, der erste Beitrag nicht)
    await prisma.$transaction([
      prisma.forumPost.update({
        where: { id: postId },
        data: { deletedAt: new Date() },
      }),
      prisma.forumThread.update({
        where: { id: post.threadId },
        data: { repliesCount: { decrement: 1 } },
      }),
    ])

    await log({
      userId: session.userId,
      action: LogAction.FORUM_POST_DELETE,
      entityType: 'forum_post',
      entityId: postId,
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    }
    console.error('[DELETE /api/forum/posts/[id]]', err)
    return NextResponse.json({ error: 'Fehler beim Löschen.' }, { status: 500 })
  }
}
