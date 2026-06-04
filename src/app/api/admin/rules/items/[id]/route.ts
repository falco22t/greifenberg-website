import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAuth('OWNER')
    const { id } = await params
    const body = await req.json() as { number?: string; title?: string; content?: string; sortOrder?: number; sectionId?: number }
    const rule = await prisma.rule.update({
      where: { id: Number(id) },
      data: {
        ...(body.number !== undefined && { number: body.number.trim() }),
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.content !== undefined && { content: body.content.trim() }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.sectionId !== undefined && { sectionId: body.sectionId }),
      },
    })
    return NextResponse.json({ rule })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAuth('OWNER')
    const { id } = await params
    await prisma.rule.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}
