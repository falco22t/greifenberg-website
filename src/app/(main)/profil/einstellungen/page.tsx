'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, Save, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function ProfilEinstellungenPage() {
  const { user, loading, refresh } = useAuth()
  const router = useRouter()

  const [username, setUsername]          = useState('')
  const [email, setEmail]               = useState('')
  const [currentPassword, setCurrent]   = useState('')
  const [newPassword, setNewPw]         = useState('')
  const [confirmPassword, setConfirm]   = useState('')
  const [showPw, setShowPw]             = useState(false)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [success, setSuccess]           = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login?redirect=/profil/einstellungen')
    if (user) { setEmail(user.email); setUsername(user.username) }
  }, [user, loading, router])

  const saveUsername = async () => {
    setSaving(true); setError(null); setSuccess(null)
    try {
      const res = await fetch('/api/profil/einstellungen', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess('Benutzername erfolgreich geändert.')
      refresh()
    } catch { setError('Verbindungsfehler.') }
    finally { setSaving(false) }
  }

  const saveEmail = async () => {
    setSaving(true); setError(null); setSuccess(null)
    try {
      const res = await fetch('/api/profil/einstellungen', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess('E-Mail erfolgreich aktualisiert.')
      refresh()
    } catch { setError('Verbindungsfehler.') }
    finally { setSaving(false) }
  }

  const savePassword = async () => {
    if (newPassword !== confirmPassword) { setError('Passwörter stimmen nicht überein.'); return }
    if (newPassword.length < 8) { setError('Mindestens 8 Zeichen.'); return }
    setSaving(true); setError(null); setSuccess(null)
    try {
      const res = await fetch('/api/profil/einstellungen', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess('Passwort erfolgreich geändert.')
      setCurrent(''); setNewPw(''); setConfirm('')
    } catch { setError('Verbindungsfehler.') }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-brand-light" />
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-xl mx-auto px-4 sm:px-6">

        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">Startseite</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/profil/${user?.username}`} className="hover:text-slate-300 transition-colors">Profil</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300">Einstellungen</span>
        </div>

        <h1 className="text-3xl font-black text-white mb-8">Einstellungen</h1>

        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-6">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />{success}
          </div>
        )}

        {/* Benutzername */}
        <div className="glass rounded-2xl border border-white/6 p-6 mb-4">
          <h2 className="font-bold text-white mb-4">Benutzername</h2>
          <div className="space-y-1.5 mb-4">
            <Label className="text-slate-300 text-sm">Neuer Benutzername</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Nur Buchstaben, Zahlen und _"
              className="bg-surface-2 border-white/8 text-white focus:border-brand/50 h-11" />
            <p className="text-xs text-slate-500">3–32 Zeichen, nur Buchstaben, Zahlen und Unterstrich.</p>
          </div>
          <Button onClick={saveUsername} disabled={saving || username === user?.username || username.length < 3}
            className="gradient-brand text-white font-semibold gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Speichern
          </Button>
        </div>

        {/* E-Mail */}
        <div className="glass rounded-2xl border border-white/6 p-6 mb-4">
          <h2 className="font-bold text-white mb-4">E-Mail-Adresse</h2>
          <div className="space-y-1.5 mb-4">
            <Label className="text-slate-300 text-sm">Neue E-Mail</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
              className="bg-surface-2 border-white/8 text-white focus:border-brand/50 h-11" />
          </div>
          <Button onClick={saveEmail} disabled={saving || email === user?.email}
            className="gradient-brand text-white font-semibold gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Speichern
          </Button>
        </div>

        {/* Passwort */}
        <div className="glass rounded-2xl border border-white/6 p-6">
          <h2 className="font-bold text-white mb-4">Passwort ändern</h2>
          <div className="space-y-3 mb-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Aktuelles Passwort</Label>
              <div className="relative">
                <Input value={currentPassword} onChange={(e) => setCurrent(e.target.value)}
                  type={showPw ? 'text' : 'password'}
                  className="bg-surface-2 border-white/8 text-white focus:border-brand/50 h-11 pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Neues Passwort</Label>
              <Input value={newPassword} onChange={(e) => setNewPw(e.target.value)}
                type={showPw ? 'text' : 'password'}
                className="bg-surface-2 border-white/8 text-white focus:border-brand/50 h-11" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Passwort bestätigen</Label>
              <Input value={confirmPassword} onChange={(e) => setConfirm(e.target.value)}
                type={showPw ? 'text' : 'password'}
                className={`bg-surface-2 border-white/8 text-white focus:border-brand/50 h-11 ${confirmPassword && newPassword !== confirmPassword ? 'border-red-500/40' : ''}`} />
            </div>
          </div>
          <Button onClick={savePassword} disabled={saving || !currentPassword || !newPassword}
            className="gradient-brand text-white font-semibold gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Passwort ändern
          </Button>
        </div>
      </div>
    </div>
  )
}
