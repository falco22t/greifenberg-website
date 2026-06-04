import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    await requireAuth('OWNER')
    const sections = await prisma.ruleSection.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { rules: { orderBy: { sortOrder: 'asc' } } },
    })
    return NextResponse.json({ sections })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}
