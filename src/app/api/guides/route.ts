import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(3).max(255),
  content: z.string().nullable().optional().transform(s => s ?? ''),
  categoryId: z.number().optional().nullable(),
  estimatedReadMinutes: z.number().min(1).max(120).default(5),
  sortOrder: z.number().default(0),
  isPublished: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth('OWNER')
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })

    const { title, ...rest } = parsed.data
    const slug = title.toLowerCase()
      .replace(/[äöüß]/g, (c) => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }[c] ?? c))
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
      + '-' + Date.now()

    const guide = await prisma.guide.create({
      data: { title, slug, authorId: session.userId, ...rest, categoryId: rest.categoryId ?? null },
    })

    revalidatePath('/guides')
    return NextResponse.json({ guide }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}
