'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Send, Loader2, AlertCircle, Bold, Italic, Code, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'

export default function NewThreadPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = use(params)
  const router = useRouter()
  const { user, loading } = useAuth()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!loading && !user) {
    router.replace('/auth/login?redirect=/forum/' + categorySlug + '/neu')
    return null
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (title.length < 5) { setError('Der Titel muss mindestens 5 Zeichen haben.'); return }
    if (content.length < 20) { setError('Der Inhalt muss mindestens 20 Zeichen haben.'); return }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/forum/${categorySlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push(`/forum/${categorySlug}/${data.thread.slug}`)
    } catch {
      setError('Verbindungsfehler.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/forum" className="hover:text-slate-300 transition-colors">Forum</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/forum/${categorySlug}`} className="hover:text-slate-300 transition-colors capitalize">
            {categorySlug}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300">Neuer Thread</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-white/8 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-white/6 gradient-brand-subtle">
            <h1 className="text-xl font-black text-white">Neuen Thread erstellen</h1>
          </div>

          <form onSubmit={submit} className="p-6 space-y-6">
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm font-medium">Titel</Label>
              <Input
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(null) }}
                placeholder="Worum geht es in deinem Thread?"
                maxLength={200}
                required
                className="bg-surface-2 border-white/8 text-white placeholder:text-slate-600 focus:border-brand/50 h-11"
              />
              <p className="text-xs text-slate-500 text-right">{title.length}/200</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm font-medium">Inhalt</Label>
              <div className="glass rounded-xl border border-white/8 overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center gap-1 px-3 py-2 border-b border-white/6 bg-surface-2/40">
                  {[
                    { icon: Bold, label: 'Fett', wrap: ['**', '**'] },
                    { icon: Italic, label: 'Kursiv', wrap: ['_', '_'] },
                    { icon: Code, label: 'Code', wrap: ['`', '`'] },
                    { icon: List, label: 'Liste', wrap: ['\n- ', ''] },
                  ].map(({ icon: Icon, label }) => (
                    <button type="button" key={label} title={label}
                      className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-white/8 transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => { setContent(e.target.value); setError(null) }}
                  placeholder="Schreibe deinen Beitrag… (Markdown wird unterstützt)"
                  rows={8}
                  maxLength={10000}
                  required
                  className="border-0 bg-transparent text-white placeholder:text-slate-600 focus:ring-0 text-sm resize-none rounded-none"
                />
              </div>
              <p className="text-xs text-slate-500 text-right">{content.length}/10.000</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link href={`/forum/${categorySlug}`}>
                <Button type="button" variant="outline" className="border-white/10 text-slate-300 hover:text-white">
                  Abbrechen
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting}
                className="gradient-brand text-white font-semibold gap-2 hover:opacity-90"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Thread erstellen
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
