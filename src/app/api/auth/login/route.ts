import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken } from '@/lib/auth'
import { log, LogAction } from '@/lib/logger'
import { loginSchema } from '@/lib/validation'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const GENERIC_ERROR = 'Benutzername/E-Mail oder Passwort falsch.'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 })
    }

    const { identifier, password } = parsed.data
    const ipAddress = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined
    const userAgent = req.headers.get('user-agent') ?? undefined

    // MySQL: Stringvergleiche sind standardmäßig case-insensitive
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
        ],
      },
    })

    // Timing-safe: auch wenn kein User gefunden, trotzdem hash-check simulieren
    const passwordValid = user
      ? await verifyPassword(password, user.passwordHash)
      : await verifyPassword(password, '$2a$12$placeholder.hash.to.prevent.timing.attacks.xxxx')

    if (!user || !passwordValid) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 })
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: `Dein Konto wurde gesperrt.${user.banReason ? ` Grund: ${user.banReason}` : ''}` },
        { status: 403 }
      )
    }

    // Alte Sessions bereinigen (max. 5 aktive Sessions pro User)
    const oldSessions = await prisma.session.findMany({
      where: { userId: user.id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'asc' },
    })
    if (oldSessions.length >= 5) {
      await prisma.session.delete({ where: { id: oldSessions[0].id } })
    }

    const tokenHash = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
        expiresAt,
      },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      sessionId: session.id,
    })

    await log({
      userId: user.id,
      action: LogAction.USER_LOGIN,
      entityType: 'user',
      entityId: user.id,
      ipAddress: ipAddress ?? undefined,
      userAgent: userAgent ?? undefined,
    })

    // secure-Flag am tatsächlichen Protokoll festmachen, nicht an NODE_ENV.
    // Sonst wirft der Browser das Cookie weg, wenn die Seite über HTTP läuft.
    const forwardedProto = req.headers.get('x-forwarded-proto')
    const isHttps = forwardedProto
      ? forwardedProto.split(',')[0].trim() === 'https'
      : new URL(req.url).protocol === 'https:'

    const cookieStore = await cookies()
    cookieStore.set('grp_session', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    const redirectTo = user.role === 'ADMIN' || user.role === 'OWNER' ? '/admin' : '/'

    return NextResponse.json({
      success: true,
      redirectTo,
      user: { id: user.id, username: user.username, role: user.role },
    })
  } catch (err) {
    console.error('[LOGIN]', err)
    return NextResponse.json({ error: 'Interner Serverfehler.' }, { status: 500 })
  }
}
