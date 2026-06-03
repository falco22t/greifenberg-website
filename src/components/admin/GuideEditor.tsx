'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Save, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import RichEditor from './RichEditor'

interface Category { id: number; name: string }
interface Props {
  categories: Category[]
  initial?: {
    id?: number; slug?: string; title?: string; content?: string
    categoryId?: number | null; estimatedReadMinutes?: number
    sortOrder?: number; isPublished?: boolean
  }
}

export default function GuideEditor({ categories, initial = {} }: Props) {
  const router = useRouter()
  const isEdit = !!initial.slug

  const [title, setTitle]           = useState(initial.title ?? '')
  const [content, setContent]       = useState(initial.content ?? '')
  const [categoryId, setCategoryId] = useState<number | null>(initial.categoryId ?? null)
  const [readMinutes, setReadMin]   = useState(initial.estimatedReadMinutes ?? 5)
  const [sortOrder, setSortOrder]   = useState(initial.sortOrder ?? 0)
  const [isPublished, setPublished] = useState(initial.isPublished ?? false)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const save = async (publish?: boolean) => {
    if (!title.trim()) { setError('Titel ist erforderlich.'); return }
    setSaving(true); setError(null)
    const pub = publish !== undefined ? publish : isPublished
    try {
      const url    = isEdit ? `/api/guides/${initial.id}` : '/api/guides'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, categoryId, estimatedReadMinutes: readMinutes, sortOrder, isPublished: pub }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Fehler beim Speichern.'); return }
      router.push('/admin/guides')
      router.refresh()
    } catch { setError('Verbindungsfehler.') }
    finally { setSaving(false) }
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-white">{isEdit ? 'Guide bearbeiten' : 'Neuer Guide'}</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setPublished(!isPublished)} className={`flex items-center gap-2 text-xs transition-colors ${isPublished ? 'text-green-400' : 'text-slate-500 hover:text-slate-300'}`}>
            {isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {isPublished ? 'Veröffentlicht' : 'Entwurf'}
          </button>
          <Button variant="outline" onClick={() => save(false)} disabled={saving} size="sm"
            className="border-white/10 text-slate-300 hover:text-white gap-2">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Entwurf speichern
          </Button>
          <Button onClick={() => save(true)} disabled={saving} size="sm"
            className="gradient-brand text-white font-semibold gap-2">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
            Veröffentlichen
          </Button>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm font-medium">Titel *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Guide-Titel"
              className="bg-surface-2 border-white/8 text-white h-11 text-base font-semibold focus:border-brand/50" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm font-medium">Inhalt</Label>
            <RichEditor content={content} onChange={setContent} placeholder="Guide-Inhalt…" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-xl border border-white/6 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">Einstellungen</h3>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Kategorie</Label>
              <select value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-surface-2 border border-white/8 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand/50">
                <option value="">Keine</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Lesezeit (Minuten)</Label>
              <Input type="number" min={1} max={120} value={readMinutes} onChange={(e) => setReadMin(Number(e.target.value))}
                className="bg-surface-2 border-white/8 text-white h-9 text-sm focus:border-brand/50" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Sortierung</Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))}
                className="bg-surface-2 border-white/8 text-white h-9 text-sm focus:border-brand/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
