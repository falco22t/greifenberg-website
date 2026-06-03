'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Save, Eye, EyeOff, Loader2, AlertCircle, Tag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import RichEditor from './RichEditor'

interface Category { id: number; name: string; color: string }
interface Props {
  categories: Category[]
  initial?: {
    id?: number; slug?: string; title?: string; excerpt?: string; content?: string
    thumbnailUrl?: string; categoryId?: number; tags?: string[]; isPublished?: boolean
  }
}

export default function NewsEditor({ categories, initial = {} }: Props) {
  const router = useRouter()
  const isEdit = !!initial.slug

  const [title, setTitle]           = useState(initial.title ?? '')
  const [excerpt, setExcerpt]       = useState(initial.excerpt ?? '')
  const [content, setContent]       = useState(initial.content ?? '')
  const [thumbnailUrl, setThumb]    = useState(initial.thumbnailUrl ?? '')
  const [categoryId, setCategoryId] = useState<number | null>(initial.categoryId ?? null)
  const [tags, setTags]             = useState<string[]>(initial.tags ?? [])
  const [tagInput, setTagInput]     = useState('')
  const [isPublished, setPublished] = useState(initial.isPublished ?? false)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags((p) => [...p, t])
      setTagInput('')
    }
  }

  const save = async (publish?: boolean) => {
    if (!title.trim()) { setError('Titel ist erforderlich.'); return }
    if (!content.replace(/<[^>]*>/g, '').trim()) { setError('Inhalt ist erforderlich.'); return }

    setSaving(true)
    setError(null)
    const pub = publish !== undefined ? publish : isPublished

    try {
      const url  = isEdit ? `/api/news/${initial.slug}` : '/api/news'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, excerpt: excerpt || null, content,
          thumbnailUrl: thumbnailUrl || null,
          categoryId, tags, isPublished: pub,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/admin/news')
      router.refresh()
    } catch {
      setError('Verbindungsfehler.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-white">
          {isEdit ? 'Beitrag bearbeiten' : 'Neuer Beitrag'}
        </h1>
        <div className="flex items-center gap-3">
          {isPublished ? (
            <button onClick={() => setPublished(false)} className="flex items-center gap-2 text-xs text-green-400 hover:text-slate-300 transition-colors">
              <Eye className="w-3.5 h-3.5" /> Veröffentlicht
            </button>
          ) : (
            <button onClick={() => setPublished(true)} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
              <EyeOff className="w-3.5 h-3.5" /> Entwurf
            </button>
          )}
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
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm font-medium">Titel *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Beitragstitel"
              className="bg-surface-2 border-white/8 text-white h-11 text-base font-semibold focus:border-brand/50" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm font-medium">Kurzbeschreibung</Label>
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Kurze Zusammenfassung (wird in der Übersicht angezeigt)"
              rows={2} maxLength={500}
              className="bg-surface-2 border-white/8 text-white focus:border-brand/50 resize-none text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm font-medium">Inhalt *</Label>
            <RichEditor content={content} onChange={setContent} placeholder="Beitragsinhalt…" maxLength={50000} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Thumbnail */}
          <div className="glass rounded-xl border border-white/6 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">Vorschaubild</h3>
            <Input value={thumbnailUrl} onChange={(e) => setThumb(e.target.value)}
              placeholder="https://…" type="url"
              className="bg-surface-2 border-white/8 text-white text-sm focus:border-brand/50" />
            {thumbnailUrl && (
              <div className="rounded-lg overflow-hidden h-32 bg-surface-2">
                <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" onError={() => setThumb('')} />
              </div>
            )}
          </div>

          {/* Category */}
          <div className="glass rounded-xl border border-white/6 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">Kategorie</h3>
            <div className="space-y-1.5">
              <button onClick={() => setCategoryId(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!categoryId ? 'bg-brand/15 text-brand-light border border-brand/30' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}>
                Keine
              </button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setCategoryId(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 border ${categoryId === cat.id ? 'border-opacity-50 text-white' : 'border-transparent text-slate-400 hover:bg-white/5'}`}
                  style={categoryId === cat.id ? { backgroundColor: cat.color + '20', borderColor: cat.color + '60', color: cat.color } : {}}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="glass rounded-xl border border-white/6 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-brand-light" /> Tags
            </h3>
            <div className="flex gap-2">
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                placeholder="Tag eingeben…"
                className="bg-surface-2 border-white/8 text-white text-sm h-8 focus:border-brand/50" />
              <Button size="sm" onClick={addTag} className="h-8 px-3 gradient-brand text-white text-xs">+</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 glass rounded-lg border border-white/10 text-slate-300">
                  {tag}
                  <button onClick={() => setTags((p) => p.filter((t) => t !== tag))} className="text-slate-500 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
