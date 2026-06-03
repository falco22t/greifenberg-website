import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { log, LogAction } from '@/lib/logger'

// PATCH /api/forum/threads/[id] — Thread sperren/pinnen (MOD+)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth('MOD')
    const { id } = await params
    const body = await req.json() as { isLocked?: boolean; isPinned?: boolean }

    const thread = await prisma.forumThread.update({
      where: { id: Number(id) },
      data: {
        ...(body.isLocked !== undefined && { isLocked: body.isLocked }),
        ...(body.isPinned !== undefined && { isPinned: body.isPinned }),
      },
    })

    await log({
      userId: session.userId,
      action: LogAction.FORUM_THREAD_LOCK,
      entityType: 'forum_thread',
      entityId: thread.id,
      details: body,
    })

    return NextResponse.json({ thread })
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}

// DELETE /api/forum/threads/[id] — Thread löschen (ADMIN+)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth('ADMIN')
    const { id } = await params

    await prisma.forumThread.delete({ where: { id: Number(id) } })

    await log({
      userId: session.userId,
      action: LogAction.ADMIN_DELETE,
      entityType: 'forum_thread',
      entityId: Number(id),
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}
