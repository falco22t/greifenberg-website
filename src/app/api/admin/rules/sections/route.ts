import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth('OWNER')
    const { title, sortOrder } = await req.json() as { title: string; sortOrder?: number }
    if (!title?.trim()) return NextResponse.json({ error: 'Titel fehlt.' }, { status: 400 })

    const count = await prisma.ruleSection.count()
    const section = await prisma.ruleSection.create({
      data: { title: title.trim(), sortOrder: sortOrder ?? count },
    })
    return NextResponse.json({ section }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}
