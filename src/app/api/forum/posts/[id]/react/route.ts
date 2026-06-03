import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'
import type { ReactionType } from '@prisma/client'

const schema = z.object({ type: z.enum(['LIKE', 'HELPFUL', 'FUNNY']) })

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })

    const { id } = await params
    const postId = Number(id)
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Ungültiger Reaktionstyp.' }, { status: 400 })

    const type = parsed.data.type as ReactionType

    const existing = await prisma.forumReaction.findUnique({
      where: { postId_userId_type: { postId, userId: session.userId, type } },
    })

    if (existing) {
      await prisma.forumReaction.delete({ where: { id: existing.id } })
      return NextResponse.json({ action: 'removed', type })
    }

    await prisma.forumReaction.create({ data: { postId, userId: session.userId, type } })
    return NextResponse.json({ action: 'added', type })
  } catch (err) {
    console.error('[POST /api/forum/posts/[id]/react]', err)
    return NextResponse.json({ error: 'Fehler beim Reagieren.' }, { status: 500 })
  }
}
