'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ identifier: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Anmeldung fehlgeschlagen.')
        return
      }

      router.push(data.redirectTo ?? '/')
      router.refresh()
    } catch {
      setError('Verbindungsfehler. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      {/* Card */}
      <div className="glass rounded-2xl border border-white/8 p-8 sm:p-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight mb-1.5">
            Willkommen zurück
          </h1>
          <p className="text-slate-400 text-sm">
            Melde dich mit deinem Konto an.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Identifier */}
          <div className="space-y-1.5">
            <Label htmlFor="identifier" className="text-slate-300 text-sm font-medium">
              Benutzername oder E-Mail
            </Label>
            <Input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              required
              value={form.identifier}
              onChange={handleChange}
              placeholder="dein.name oder dein@email.de"
              className="bg-surface-2 border-white/8 text-white placeholder:text-slate-600
                focus:border-brand/60 focus:ring-brand/20 h-11"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                Passwort
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-brand-light hover:text-white transition-colors"
              >
                Passwort vergessen?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-surface-2 border-white/8 text-white placeholder:text-slate-600
                  focus:border-brand/60 focus:ring-brand/20 h-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 gradient-brand glow-brand-sm text-white font-semibold
              hover:opacity-90 transition-opacity rounded-xl gap-2 mt-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Wird angemeldet…</>
            ) : (
              <><LogIn className="w-4 h-4" /> Anmelden</>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/6" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-[#0E0F11] text-slate-500">
              Noch kein Konto?
            </span>
          </div>
        </div>

        <Link href="/auth/register">
          <Button
            variant="outline"
            className="w-full h-11 border-white/10 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl"
          >
            Jetzt registrieren
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
