'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'

interface FormState {
  username: string
  email: string
  password: string
  passwordConfirm: string
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Mindestens 8 Zeichen', ok: password.length >= 8 },
    { label: 'Großbuchstabe', ok: /[A-Z]/.test(password) },
    { label: 'Zahl oder Sonderzeichen', ok: /[\d!@#$%^&*]/.test(password) },
  ]
  if (!password) return null
  return (
    <div className="mt-2 space-y-1">
      {checks.map(({ label, ok }) => (
        <div key={label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-400' : 'text-slate-500'}`}>
          <CheckCircle2 className={`w-3 h-3 ${ok ? 'opacity-100' : 'opacity-30'}`} />
          {label}
        </div>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { refresh } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({
    username: '', email: '', password: '', passwordConfirm: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password !== form.passwordConfirm) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }
    if (form.password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Registrierung fehlgeschlagen.')
        return
      }

      await refresh()
      router.push('/')
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
      <div className="glass rounded-2xl border border-white/8 p-8 sm:p-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight mb-1.5">
            Konto erstellen
          </h1>
          <p className="text-slate-400 text-sm">
            Werde Teil der Greifenberg RP Community.
          </p>
        </div>

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

          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-slate-300 text-sm font-medium">
              Benutzername
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              minLength={3}
              maxLength={32}
              pattern="[a-zA-Z0-9_.-]+"
              title="Nur Buchstaben, Zahlen, _, . und - erlaubt"
              value={form.username}
              onChange={handleChange}
              placeholder="CooleSpieler123"
              className="bg-surface-2 border-white/8 text-white placeholder:text-slate-600
                focus:border-brand/60 h-11"
            />
            <p className="text-xs text-slate-500">3–32 Zeichen, Buchstaben, Zahlen, _ . -</p>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
              E-Mail-Adresse
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="deine@email.de"
              className="bg-surface-2 border-white/8 text-white placeholder:text-slate-600
                focus:border-brand/60 h-11"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
              Passwort
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-surface-2 border-white/8 text-white placeholder:text-slate-600
                  focus:border-brand/60 h-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrength password={form.password} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="passwordConfirm" className="text-slate-300 text-sm font-medium">
              Passwort bestätigen
            </Label>
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={form.passwordConfirm}
              onChange={handleChange}
              placeholder="••••••••"
              className={`bg-surface-2 border-white/8 text-white placeholder:text-slate-600
                focus:border-brand/60 h-11 transition-colors
                ${form.passwordConfirm && form.password !== form.passwordConfirm
                  ? 'border-red-500/40'
                  : form.passwordConfirm && form.password === form.passwordConfirm
                  ? 'border-green-500/40'
                  : ''
                }`}
            />
          </div>

          {/* Terms hint */}
          <p className="text-xs text-slate-500 leading-relaxed">
            Mit der Registrierung akzeptierst du unsere{' '}
            <Link href="/regelwerk" className="text-brand-light hover:text-white transition-colors">
              Nutzungsbedingungen
            </Link>{' '}
            und{' '}
            <Link href="/datenschutz" className="text-brand-light hover:text-white transition-colors">
              Datenschutzrichtlinie
            </Link>
            .
          </p>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 gradient-brand glow-brand-sm text-white font-semibold
              hover:opacity-90 transition-opacity rounded-xl gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Wird registriert…</>
            ) : (
              <><UserPlus className="w-4 h-4" /> Konto erstellen</>
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
              Bereits registriert?
            </span>
          </div>
        </div>

        <Link href="/auth/login">
          <Button
            variant="outline"
            className="w-full h-11 border-white/10 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl"
          >
            Anmelden
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
