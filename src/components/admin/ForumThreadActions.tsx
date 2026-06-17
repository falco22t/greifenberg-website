'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pin, PinOff, Lock, LockOpen, Trash2, Loader2 } from 'lucide-react'

interface Props {
  threadId: number
  isPinned: boolean
  isLocked: boolean
  canDelete: boolean
}

export default function ForumThreadActions({ threadId, isPinned, isLocked, canDelete }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const patch = async (body: { isPinned?: boolean; isLocked?: boolean }) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/forum/threads/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? 'Aktion fehlgeschlagen.')
        return
      }
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!confirm('Thread wirklich unwiderruflich löschen?')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/forum/threads/${threadId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? 'Löschen fehlgeschlagen.')
        return
      }
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {busy && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />}
      <button
        onClick={() => patch({ isPinned: !isPinned })}
        disabled={busy}
        title={isPinned ? 'Anpinnen aufheben' : 'Anpinnen'}
        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-light hover:bg-white/5 transition-colors disabled:opacity-40"
      >
        {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={() => patch({ isLocked: !isLocked })}
        disabled={busy}
        title={isLocked ? 'Entsperren' : 'Sperren'}
        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-white/5 transition-colors disabled:opacity-40"
      >
        {isLocked ? <LockOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
      </button>
      {canDelete && (
        <button
          onClick={remove}
          disabled={busy}
          title="Thread löschen"
          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
