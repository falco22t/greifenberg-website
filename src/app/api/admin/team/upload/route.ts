import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { requireAuth } from '@/lib/auth'

const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  try {
    await requireAuth('ADMIN')

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Keine Datei.' }, { status: 400 })
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Nur JPG, PNG, WebP oder GIF erlaubt.' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Maximale Dateigröße: 2 MB.' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const dir = join(process.cwd(), 'public', 'uploads', 'team')
    await mkdir(dir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(join(dir, filename), buffer)

    return NextResponse.json({ url: `/uploads/team/${filename}` }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    console.error('[POST /api/admin/team/upload]', err)
    return NextResponse.json({ error: 'Upload fehlgeschlagen.' }, { status: 500 })
  }
}
