import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { log, LogAction } from '@/lib/logger'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const session = await getSession()

    if (session) {
      await prisma.session.deleteMany({
        where: { id: session.sessionId, userId: session.userId },
      })

      await log({
        userId: session.userId,
        action: LogAction.USER_LOGOUT,
      })
    }

    const cookieStore = await cookies()
    cookieStore.delete('grp_session')

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[LOGOUT]', err)
    return NextResponse.json({ error: 'Fehler beim Abmelden.' }, { status: 500 })
  }
}
