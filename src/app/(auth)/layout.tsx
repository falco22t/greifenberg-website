import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: { default: 'Anmelden', template: '%s | Greifenberg RP' },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      {/* Minimal Header */}
      <header className="px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight">
            <span className="text-white">Greifenberg</span>
            <span className="gradient-text-brand"> RP</span>
          </span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      <footer className="px-6 py-4 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} Greifenberg RP ·{' '}
        <Link href="/datenschutz" className="hover:text-slate-400 transition-colors">Datenschutz</Link>
        {' '}·{' '}
        <Link href="/impressum" className="hover:text-slate-400 transition-colors">Impressum</Link>
      </footer>
    </div>
  )
}
