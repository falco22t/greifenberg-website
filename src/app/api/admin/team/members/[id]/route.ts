import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import type { UserRole } from '@prisma/client'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAuth('ADMIN')
    const { id } = await params
    const body = await req.json() as {
      displayName?: string
      position?: string
      displayRole?: string
      badgeColor?: string
      departmentId?: number | null
      bio?: string
      discordTag?: string
      avatarUrl?: string
      isActive?: boolean
      sortOrder?: number
      userRole?: UserRole
    }

    const member = await prisma.teamMember.findUnique({ where: { id: Number(id) } })
    if (!member) return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 })

    // Update permission role on the linked user
    if (body.userRole && member.userId) {
      await prisma.user.update({ where: { id: member.userId }, data: { role: body.userRole } })
    }

    const updated = await prisma.teamMember.update({
      where: { id: Number(id) },
      data: {
        ...(body.displayName !== undefined && { displayName: body.displayName.trim() }),
        ...(body.position !== undefined && { position: body.position.trim() }),
        ...(body.displayRole !== undefined && { displayRole: body.displayRole?.trim() || null }),
        ...(body.badgeColor !== undefined && { badgeColor: body.badgeColor }),
        ...(body.departmentId !== undefined && { departmentId: body.departmentId }),
        ...(body.bio !== undefined && { bio: body.bio?.trim() || null }),
        ...(body.discordTag !== undefined && { discordTag: body.discordTag?.trim() || null }),
        ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl?.trim() || null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
      include: {
        department: true,
        user: { select: { id: true, username: true, email: true, role: true, avatarUrl: true } },
      },
    })
    return NextResponse.json({ member: updated })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAuth('ADMIN')
    const { id } = await params
    await prisma.teamMember.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}
