import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await requireAuth('OWNER')
    const { sectionId, number, title, content, sortOrder } = await req.json() as {
      sectionId: number; number: string; title: string; content: string; sortOrder?: number
    }
    if (!sectionId || !number?.trim() || !title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 })
    }
    const count = await prisma.rule.count({ where: { sectionId } })
    const rule = await prisma.rule.create({
      data: { sectionId, number: number.trim(), title: title.trim(), content: content.trim(), sortOrder: sortOrder ?? count },
    })
    return NextResponse.json({ rule }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}
