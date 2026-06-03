import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// Tickets sind intern — nur Admins/Mods können die Übersicht sehen.
// Nutzer erstellen Tickets über Discord.

export async function GET() {
  try {
    const session = await requireAuth('MOD')

    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { username: true, avatarUrl: true } },
        category: true,
        _count: { select: { messages: true } },
      },
    })

    return NextResponse.json({ tickets })
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}

// POST ist deaktiviert — Tickets laufen über Discord
export async function POST() {
  return NextResponse.json(
    { error: 'Tickets werden über Discord erstellt. Bitte besuche unseren Discord-Server.' },
    { status: 405 }
  )
}
