'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, AlertCircle, Bold, Italic, Code, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface Props {
  threadSlug: string
  categorySlug: string
  isLocked: boolean
  onPosted: (post: unknown) => void
}

function insertMarkdown(
  ta: HTMLTextAreaElement,
  before: string,
  after = '',
  placeholder = 'Text'
) {
  const { selectionStart: s, selectionEnd: e, value } = ta
  const selected = value.slice(s, e) || placeholder
  const newVal = value.slice(0, s) + before + selected + after + value.slice(e)
  const pos = s + before.length + selected.length + after.length
  // simulate change
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set?.call(ta, newVal)
  ta.setSelectionRange(pos, pos)
  ta.dispatchEvent(new Event('input', { bubbles: true }))
}

export default function ReplyComposer({ threadSlug, categorySlug, isLocked, onPosted }: Props) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const remaining = 10000 - content.length

  const format = (type: 'bold' | 'italic' | 'code' | 'list') => {
    if (!taRef.current) return
    const actions = {
      bold:   () => insertMarkdown(taRef.current!, '**', '**', 'Fettgedruckt'),
      italic: () => insertMarkdown(taRef.current!, '_', '_', 'Kursiv'),
      code:   () => insertMarkdown(taRef.current!, '`', '`', 'Code'),
      list:   () => insertMarkdown(taRef.current!, '\n- ', '', 'Listenpunkt'),
    }
    actions[type]()
    taRef.current.focus()
  }

  const submit = async () => {
    if (!content.trim() || content.length < 10) {
      setError('Der Beitrag muss mindestens 10 Zeichen lang sein.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/forum/${categorySlug}/${threadSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setContent('')
      onPosted(data.post)
    } catch {
      setError('Verbindungsfehler.')
    } finally {
      setLoading(false)
    }
  }

  if (isLocked) {
    return (
      <div className="glass rounded-2xl border border-white/6 p-6 text-center text-slate-400 text-sm">
        🔒 Dieser Thread ist gesperrt. Keine weiteren Antworten möglich.
      </div>
    )
  }

  if (!user) {
    return (
      <div className="glass rounded-2xl border border-white/6 p-6 text-center">
        <p className="text-slate-400 text-sm mb-4">Melde dich an, um zu antworten.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/auth/login">
            <Button size="sm" className="gradient-brand text-white">Anmelden</Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm" variant="outline" className="border-white/10 text-slate-300">Registrieren</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl border border-white/6 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2.5 border-b border-white/6 bg-surface-2/40">
        <span className="text-xs text-slate-500 mr-2">Antwort verfassen:</span>
        {[
          { icon: Bold,   action: 'bold'   as const, title: 'Fett' },
          { icon: Italic, action: 'italic' as const, title: 'Kursiv' },
          { icon: Code,   action: 'code'   as const, title: 'Code' },
          { icon: List,   action: 'list'   as const, title: 'Liste' },
        ].map(({ icon: Icon, action, title }) => (
          <button
            key={action}
            type="button"
            onClick={() => format(action)}
            title={title}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-colors"
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="p-4">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-red-400 text-xs mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <Textarea
          ref={taRef}
          value={content}
          onChange={(e) => { setContent(e.target.value); setError(null) }}
          onKeyDown={(e) => { if (e.ctrlKey && e.key === 'Enter') submit() }}
          placeholder="Schreibe deine Antwort… (Markdown wird unterstützt)"
          rows={5}
          maxLength={10000}
          className="bg-surface-2 border-white/8 text-white placeholder:text-slate-600 focus:border-brand/50 resize-none text-sm"
        />

        <div className="flex items-center justify-between mt-3">
          <span className={`text-xs ${remaining < 200 ? 'text-amber-400' : 'text-slate-600'}`}>
            {remaining.toLocaleString()} Zeichen übrig
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600 hidden sm:block">Strg+Enter zum Senden</span>
            <Button
              onClick={submit}
              disabled={loading || content.length < 10}
              size="sm"
              className="gradient-brand text-white gap-2 font-semibold disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Antworten
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
