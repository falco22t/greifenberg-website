import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'
import { log, LogAction } from '@/lib/logger'
import { registerSchema } from '@/lib/validation'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Ungültige Eingabe'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { username, email, password } = parsed.data

    // Duplikat-Check
    // MySQL: Stringvergleiche sind standardmäßig case-insensitive
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email },
        ],
      },
    })

    if (existing) {
      const field = existing.username.toLowerCase() === username.toLowerCase()
        ? 'Dieser Benutzername'
        : 'Diese E-Mail-Adresse'
      return NextResponse.json({ error: `${field} ist bereits vergeben.` }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: { username, email, passwordHash },
    })

    // Session erstellen
    const tokenHash = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const ipAddress = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined
    const userAgent = req.headers.get('user-agent') ?? undefined

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
        expiresAt,
      },
    })

    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      sessionId: session.id,
    })

    await log({
      userId: user.id,
      action: LogAction.USER_REGISTER,
      entityType: 'user',
      entityId: user.id,
      details: { username, email },
      ipAddress: ipAddress ?? undefined,
      userAgent: userAgent ?? undefined,
    })

    const cookieStore = await cookies()
    cookieStore.set('grp_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role },
    })
  } catch (err) {
    console.error('[REGISTER]', err)
    return NextResponse.json({ error: 'Interner Serverfehler.' }, { status: 500 })
  }
}
