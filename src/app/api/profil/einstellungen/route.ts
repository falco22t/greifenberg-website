import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, hashPassword, verifyPassword } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
})

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })

  const { email, currentPassword, newPassword } = parsed.data

  // E-Mail ändern
  if (email) {
    const existing = await prisma.user.findFirst({
      where: { email, NOT: { id: session.userId } },
    })
    if (existing) return NextResponse.json({ error: 'Diese E-Mail ist bereits vergeben.' }, { status: 409 })

    await prisma.user.update({ where: { id: session.userId }, data: { email } })
    return NextResponse.json({ success: true })
  }

  // Passwort ändern
  if (currentPassword && newPassword) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user) return NextResponse.json({ error: 'Benutzer nicht gefunden.' }, { status: 404 })

    const valid = await verifyPassword(currentPassword, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Aktuelles Passwort ist falsch.' }, { status: 401 })

    const passwordHash = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: session.userId }, data: { passwordHash } })

    // Alle anderen Sessions ungültig machen
    await prisma.session.deleteMany({
      where: { userId: session.userId, NOT: { id: session.sessionId } },
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Keine Änderung angegeben.' }, { status: 400 })
}
