import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import type { UserRole } from '@prisma/client'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAuth('OWNER')
    const { id } = await params
    const body = await req.json() as {
      email?: string | null
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

    // Account-Verknüpfung ändern
    let newUserId: number | null | undefined = undefined
    if (body.email !== undefined) {
      if (!body.email) {
        // E-Mail leer → Account trennen
        newUserId = null
      } else {
        const user = await prisma.user.findUnique({ where: { email: body.email } })
        if (!user) return NextResponse.json({ error: 'Kein Nutzer mit dieser E-Mail gefunden.' }, { status: 404 })

        // Prüfen ob dieser User bereits ein anderes Teammitglied ist
        const conflict = await prisma.teamMember.findFirst({
          where: { userId: user.id, id: { not: Number(id) } },
        })
        if (conflict) return NextResponse.json({ error: 'Dieser Account ist bereits einem anderen Teammitglied zugeordnet.' }, { status: 409 })

        newUserId = user.id

        // Berechtigungs-Rolle setzen + Sessions löschen (neue Rolle wirkt sofort beim nächsten Login)
        if (body.userRole) {
          await prisma.user.update({ where: { id: user.id }, data: { role: body.userRole } })
          await prisma.session.deleteMany({ where: { userId: user.id } })
        }
      }
    } else if (body.userRole && member.userId) {
      // Nur Rolle aktualisieren + Sessions löschen
      await prisma.user.update({ where: { id: member.userId }, data: { role: body.userRole } })
      await prisma.session.deleteMany({ where: { userId: member.userId } })
    }

    const updated = await prisma.teamMember.update({
      where: { id: Number(id) },
      data: {
        ...(newUserId !== undefined && { userId: newUserId }),
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
    const msg = err instanceof Error ? err.message : 'Fehler.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAuth('OWNER')
    const { id } = await params
    await prisma.teamMember.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}
