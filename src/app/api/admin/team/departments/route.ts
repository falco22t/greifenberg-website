import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    await requireAuth('ADMIN')
    const departments = await prisma.department.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { members: true } } },
    })
    return NextResponse.json({ departments })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth('ADMIN')
    const { name, color, sortOrder } = await req.json() as { name: string; color?: string; sortOrder?: number }
    if (!name?.trim()) return NextResponse.json({ error: 'Name fehlt.' }, { status: 400 })

    const count = await prisma.department.count()
    const dept = await prisma.department.create({
      data: { name: name.trim(), color: color ?? '#1C559A', sortOrder: sortOrder ?? count },
    })
    return NextResponse.json({ dept }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}
