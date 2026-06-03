import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { log, LogAction } from '@/lib/logger'
import type { UserRole } from '@prisma/client'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth('ADMIN')
    const { id } = await params
    const body = await req.json() as { role?: UserRole; isBanned?: boolean; banReason?: string }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...(body.role !== undefined && { role: body.role }),
        ...(body.isBanned !== undefined && { isBanned: body.isBanned }),
        ...(body.banReason !== undefined && { banReason: body.banReason }),
      },
    })

    await log({
      userId: session.userId,
      action: LogAction.ADMIN_EDIT,
      entityType: 'user',
      entityId: user.id,
      details: body,
    })

    return NextResponse.json({ user })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}
