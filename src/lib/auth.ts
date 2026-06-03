import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import type { UserRole } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d'

export interface JwtPayload {
  userId: number
  username: string
  role: UserRole
  sessionId: number
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('grp_session')?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  const session = await prisma.session.findFirst({
    where: {
      id: payload.sessionId,
      userId: payload.userId,
      expiresAt: { gt: new Date() },
    },
  })

  return session ? payload : null
}

export async function requireAuth(minRole: UserRole = 'USER'): Promise<JwtPayload> {
  const session = await getSession()
  if (!session) throw new Error('UNAUTHORIZED')

  const roleOrder: UserRole[] = ['GUEST', 'USER', 'MOD', 'ADMIN', 'OWNER']
  const hasPermission = roleOrder.indexOf(session.role) >= roleOrder.indexOf(minRole)
  if (!hasPermission) throw new Error('FORBIDDEN')

  return session
}
