import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAuth('ADMIN')
    const { id } = await params
    const body = await req.json() as { name?: string; color?: string; sortOrder?: number }
    const dept = await prisma.department.update({
      where: { id: Number(id) },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    })
    return NextResponse.json({ dept })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAuth('ADMIN')
    const { id } = await params
    await prisma.department.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}
