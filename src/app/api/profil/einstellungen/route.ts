import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getSession, hashPassword, verifyPassword, signToken } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/, 'Nur Buchstaben, Zahlen und _ erlaubt.').optional(),
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

  const { username, email, currentPassword, newPassword } = parsed.data

  // Benutzername ändern
  if (username) {
    const existing = await prisma.user.findFirst({
      where: { username, NOT: { id: session.userId } },
    })
    if (existing) return NextResponse.json({ error: 'Dieser Benutzername ist bereits vergeben.' }, { status: 409 })

    await prisma.user.update({ where: { id: session.userId }, data: { username } })

    // JWT mit neuem Benutzernamen neu ausstellen
    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (user) {
      const newToken = signToken({ userId: user.id, username: user.username, role: user.role, sessionId: session.sessionId })
      const cookieStore = await cookies()
      cookieStore.set('grp_session', newToken, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/',
      })
    }
    return NextResponse.json({ success: true })
  }

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
