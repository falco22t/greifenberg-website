import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import type { UserRole } from '@prisma/client'

export async function GET() {
  try {
    await requireAuth('OWNER')
    const members = await prisma.teamMember.findMany({
      orderBy: [{ department: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      include: {
        department: true,
        user: { select: { id: true, username: true, email: true, role: true, avatarUrl: true } },
      },
    })
    return NextResponse.json({ members })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth('OWNER')
    const {
      email, displayName, position, displayRole,
      badgeColor, departmentId, bio, discordTag, avatarUrl,
      userRole, sortOrder,
    } = await req.json() as {
      email?: string
      displayName: string
      position: string
      displayRole?: string
      badgeColor?: string
      departmentId?: number
      bio?: string
      discordTag?: string
      avatarUrl?: string
      userRole?: UserRole
      sortOrder?: number
    }

    if (!displayName?.trim() || !position?.trim()) {
      return NextResponse.json({ error: 'Anzeigename und Position sind Pflicht.' }, { status: 400 })
    }

    let userId: number | undefined
    if (email) {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) return NextResponse.json({ error: 'Kein Nutzer mit dieser E-Mail gefunden.' }, { status: 404 })

      // Check not already a team member
      const existing = await prisma.teamMember.findUnique({ where: { userId: user.id } })
      if (existing) return NextResponse.json({ error: 'Dieser Nutzer ist bereits Teammitglied.' }, { status: 409 })

      userId = user.id

      // Update user's permission role if provided + Sessions löschen (neue Rolle wirkt sofort)
      if (userRole) {
        await prisma.user.update({ where: { id: user.id }, data: { role: userRole } })
        await prisma.session.deleteMany({ where: { userId: user.id } })
      }
    }

    const count = await prisma.teamMember.count()
    const member = await prisma.teamMember.create({
      data: {
        displayName: displayName.trim(),
        position: position.trim(),
        displayRole: displayRole?.trim() ?? null,
        badgeColor: badgeColor ?? '#1C559A',
        departmentId: departmentId ?? null,
        bio: bio?.trim() ?? null,
        discordTag: discordTag?.trim() ?? null,
        avatarUrl: avatarUrl?.trim() ?? null,
        sortOrder: sortOrder ?? count,
        userId: userId ?? null,
      },
      include: {
        department: true,
        user: { select: { id: true, username: true, email: true, role: true, avatarUrl: true } },
      },
    })

    return NextResponse.json({ member }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    const msg = err instanceof Error ? err.message : 'Unbekannter Fehler'
    console.error('[POST /api/admin/team/members]', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
