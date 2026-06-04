'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Plus, Trash2, Save, Loader2, AlertCircle, GripVertical, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { LawBook, LawChapter, LawParagraph } from '@/types/laws'

interface Props { book: LawBook }

interface EditState {
  chapters: Array<LawChapter & { _dirty?: boolean; _new?: boolean; _deleted?: boolean }>
}

export default function LawEditor({ book: initialBook }: Props) {
  const [book, setBook] = useState(initialBook)
  const [state, setState] = useState<EditState>({ chapters: initialBook.chapters as LawChapter[] })
  const [openChapter, setOpenChapter] = useState<number | null>(state.chapters[0]?.id ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const updateBook = (key: keyof typeof book, value: string | boolean) =>
    setBook((b) => ({ ...b, [key]: value }))

  const addChapter = () => {
    const newId = -(Date.now())
    setState((s) => ({
      chapters: [...s.chapters, {
        id: newId, bookId: book.id, number: String(s.chapters.length + 1),
        title: 'Neues Kapitel', sortOrder: s.chapters.length, paragraphs: [], _new: true,
      }],
    }))
    setOpenChapter(newId)
  }

  const updateChapter = (id: number, key: string, value: string) =>
    setState((s) => ({
      chapters: s.chapters.map((c) => c.id === id ? { ...c, [key]: value, _dirty: true } : c),
    }))

  const deleteChapter = (id: number) =>
    setState((s) => ({
      chapters: s.chapters.map((c) => c.id === id ? { ...c, _deleted: true } : c),
    }))

  const addParagraph = (chapterId: number) =>
    setState((s) => ({
      chapters: s.chapters.map((ch) =>
        ch.id === chapterId ? {
          ...ch, paragraphs: [...ch.paragraphs, {
            id: -(Date.now()), chapterId, bookId: book.id,
            paragraphNumber: `§ ${ch.paragraphs.length + 1}`,
            title: 'Neuer Paragraph', content: '', references: [],
            sortOrder: ch.paragraphs.length, createdAt: '', updatedAt: '', _new: true,
          } as LawParagraph & { _new: boolean }],
        } : ch
      ),
    }))

  const updateParagraph = (chapterId: number, paraId: number, key: string, value: string) =>
    setState((s) => ({
      chapters: s.chapters.map((ch) =>
        ch.id === chapterId ? {
          ...ch,
          paragraphs: ch.paragraphs.map((p) =>
            p.id === paraId ? { ...p, [key]: value, _dirty: true } : p
          ),
        } : ch
      ),
    }))

  const deleteParagraph = (chapterId: number, paraId: number) =>
    setState((s) => ({
      chapters: s.chapters.map((ch) =>
        ch.id === chapterId ? {
          ...ch,
          paragraphs: ch.paragraphs.map((p) =>
            p.id === paraId ? { ...p, _deleted: true } : p
          ),
        } : ch
      ),
    }))

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/laws/${book.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book, chapters: state.chapters }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      // Seite neu laden damit alle _new/_dirty-Flags und negativen IDs
      // durch echte DB-IDs ersetzt werden → kein doppeltes Anlegen mehr
      window.location.reload()
    } catch { setError('Verbindungsfehler.') }
    finally { setSaving(false) }
  }

  const syncFromDocs = async () => {
    if (!book.googleDocsSourceUrl) return
    setSyncing(true)
    try {
      const res = await fetch(`/api/admin/laws/${book.slug}/sync`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      window.location.reload()
    } catch { setError('Sync fehlgeschlagen.') }
    finally { setSyncing(false) }
  }

  const visibleChapters = state.chapters.filter((c) => !(c as { _deleted?: boolean })._deleted)

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">{book.name}</h1>
          <p className="text-slate-400 text-sm mt-1">Gesetzbuch bearbeiten</p>
        </div>
        <div className="flex items-center gap-3">
          {book.googleDocsSourceUrl && (
            <Button variant="outline" size="sm" onClick={syncFromDocs} disabled={syncing}
              className="border-white/10 text-slate-300 hover:text-white gap-2">
              <RefreshCw className={cn('w-3.5 h-3.5', syncing && 'animate-spin')} />
              Von Google Docs sync
            </Button>
          )}
          <Button onClick={save} disabled={saving} className="gradient-brand text-white font-semibold gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Speichern
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-6">
          ✓ Erfolgreich gespeichert.
        </div>
      )}

      {/* Book metadata */}
      <div className="glass rounded-xl border border-white/6 p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm">Name</Label>
          <Input value={book.name} onChange={(e) => updateBook('name', e.target.value)}
            className="bg-surface-2 border-white/8 text-white focus:border-brand/50" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm">Akzentfarbe</Label>
          <div className="flex gap-2">
            <input type="color" value={book.colorAccent}
              onChange={(e) => updateBook('colorAccent', e.target.value)}
              className="w-11 h-10 rounded-lg border border-white/8 bg-surface-2 cursor-pointer p-1" />
            <Input value={book.colorAccent} onChange={(e) => updateBook('colorAccent', e.target.value)}
              className="bg-surface-2 border-white/8 text-white focus:border-brand/50 font-mono" />
          </div>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-slate-300 text-sm">Beschreibung</Label>
          <Textarea value={book.description ?? ''} onChange={(e) => updateBook('description', e.target.value)}
            rows={2} className="bg-surface-2 border-white/8 text-white resize-none text-sm focus:border-brand/50" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-slate-300 text-sm">Google Docs URL (für Sync)</Label>
          <Input value={book.googleDocsSourceUrl ?? ''} onChange={(e) => updateBook('googleDocsSourceUrl', e.target.value)}
            placeholder="https://docs.google.com/document/d/…"
            className="bg-surface-2 border-white/8 text-white text-sm focus:border-brand/50" />
        </div>
      </div>

      {/* Chapters */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-white">Kapitel ({visibleChapters.length})</h2>
        <Button size="sm" onClick={addChapter} className="gradient-brand text-white gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Kapitel
        </Button>
      </div>

      <div className="space-y-3">
        {visibleChapters.map((chapter) => {
          const isOpen = openChapter === chapter.id
          const visibleParas = chapter.paragraphs.filter((p) => !(p as { _deleted?: boolean })._deleted)
          return (
            <div key={chapter.id} className="glass rounded-xl border border-white/6 overflow-hidden">
              {/* Chapter header */}
              <div className="flex items-center gap-3 p-4">
                <GripVertical className="w-4 h-4 text-slate-600 cursor-grab flex-shrink-0" />
                <button onClick={() => setOpenChapter(isOpen ? null : chapter.id)} className="flex items-center gap-2 flex-1 min-w-0">
                  {isOpen ? <ChevronDown className="w-4 h-4 text-brand-light flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                  <span className="text-xs font-mono text-brand-light font-bold">{chapter.number}.</span>
                  <span className="text-white font-semibold text-sm truncate">{chapter.title}</span>
                  <span className="text-slate-600 text-xs flex-shrink-0">({visibleParas.length} §§)</span>
                </button>
                <button onClick={() => deleteChapter(chapter.id)} className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chapter fields + Paragraphs */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="border-t border-white/6 p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-slate-400 text-xs">Nr.</Label>
                          <Input value={chapter.number} onChange={(e) => updateChapter(chapter.id, 'number', e.target.value)}
                            className="bg-surface-2 border-white/8 text-white h-8 text-sm focus:border-brand/50" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-slate-400 text-xs">Titel</Label>
                          <Input value={chapter.title} onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                            className="bg-surface-2 border-white/8 text-white h-8 text-sm focus:border-brand/50" />
                        </div>
                      </div>

                      {/* Paragraphs */}
                      <div className="space-y-2 mt-2">
                        {visibleParas.map((para) => (
                          <div key={para.id} className="bg-surface-2/50 rounded-lg border border-white/5 p-3 space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <Label className="text-slate-500 text-xs">§-Nummer</Label>
                                <Input value={para.paragraphNumber}
                                  onChange={(e) => updateParagraph(chapter.id, para.id, 'paragraphNumber', e.target.value)}
                                  className="bg-surface-3 border-white/6 text-white h-7 text-xs focus:border-brand/50 font-mono" />
                              </div>
                              <div className="col-span-2 space-y-1">
                                <Label className="text-slate-500 text-xs">Titel</Label>
                                <div className="flex gap-1">
                                  <Input value={para.title}
                                    onChange={(e) => updateParagraph(chapter.id, para.id, 'title', e.target.value)}
                                    className="bg-surface-3 border-white/6 text-white h-7 text-xs focus:border-brand/50" />
                                  <button onClick={() => deleteParagraph(chapter.id, para.id)}
                                    className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors flex-shrink-0">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <Textarea value={para.content}
                              onChange={(e) => updateParagraph(chapter.id, para.id, 'content', e.target.value)}
                              placeholder="Gesetzestext…"
                              rows={3}
                              className="bg-surface-3 border-white/6 text-white text-xs resize-none focus:border-brand/50 leading-relaxed" />
                          </div>
                        ))}
                        <button onClick={() => addParagraph(chapter.id)}
                          className="w-full py-2 rounded-lg border border-dashed border-white/10 text-slate-500 hover:text-white hover:border-white/20 text-xs transition-all flex items-center justify-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" /> Paragraph hinzufügen
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
