import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { requireAuth } from '@/lib/auth'

const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function getUploadDir(): string {
  // Env-Variable hat Vorrang (auf dem Server setzen: UPLOAD_DIR=/var/www/greifenberg/public/uploads)
  if (process.env.UPLOAD_DIR) return join(process.env.UPLOAD_DIR, 'team')
  // Fallback: process.cwd() — funktioniert lokal und wenn PM2 vom Projektordner startet
  return join(process.cwd(), 'public', 'uploads', 'team')
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth('ADMIN')

    const form = await req.formData()
    const file = form.get('file') as File | null

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'Keine Datei übermittelt.' }, { status: 400 })
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Nur JPG, PNG, WebP oder GIF erlaubt.' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Maximale Dateigröße: 2 MB.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const dir = getUploadDir()

    await mkdir(dir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(join(dir, filename), buffer)

    return NextResponse.json({ url: `/uploads/team/${filename}` }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    }
    // Echter Fehler — im Log und in der Antwort sichtbar machen
    const message = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/admin/team/upload]', message)
    return NextResponse.json({ error: `Upload fehlgeschlagen: ${message}` }, { status: 500 })
  }
}
