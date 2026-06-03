import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, MessageCircle, ExternalLink, HelpCircle, FileText } from 'lucide-react'
import SupportFAQ from '@/components/support/SupportFAQ'

export const metadata: Metadata = { title: 'Support & FAQ' }

const discordChannels = [
  { name: '#support',           desc: 'Allgemeiner Support' },
  { name: '#entbannungsantrag', desc: 'Ban-Einsprüche' },
  { name: '#bug-report',        desc: 'Bugs melden' },
  { name: '#bewerbungen',       desc: 'Fraktion beitreten' },
]

export default function SupportPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">Startseite</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300">Support & FAQ</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Support & FAQ
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Hier findest du Antworten auf die häufigsten Fragen. Für direkten Support erreichst du uns über Discord.
          </p>
        </div>

        {/* Discord CTA */}
        <div className="glass rounded-2xl border border-brand/25 p-6 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 gradient-brand-subtle pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-[#5865F2]" />
                </div>
                <h2 className="text-lg font-black text-white">Direkt-Support via Discord</h2>
              </div>
              <p className="text-slate-400 text-sm mb-3">
                Für alle Anliegen, die hier nicht beantwortet werden, erreichst du unser Support-Team direkt auf Discord.
              </p>
              <div className="flex flex-wrap gap-2">
                {discordChannels.map((ch) => (
                  <span key={ch.name} className="text-xs px-2.5 py-1 glass rounded-lg border border-white/8 text-slate-400">
                    <span className="text-[#5865F2] font-mono">{ch.name}</span>
                    {' '}· {ch.desc}
                  </span>
                ))}
              </div>
            </div>
            <a href="https://discord.gg/greifenberg" target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-white
                bg-[#5865F2] hover:bg-[#4752C4] transition-colors shadow-lg shadow-[#5865F2]/25">
              Discord beitreten <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="w-5 h-5 text-brand-light" />
            <h2 className="text-2xl font-black text-white">Häufige Fragen</h2>
          </div>
          <SupportFAQ />
        </div>

        {/* Bottom hint */}
        <div className="mt-10 p-5 glass rounded-xl border border-white/6 flex items-start gap-3">
          <FileText className="w-4 h-4 text-brand-light mt-0.5 flex-shrink-0" />
          <p className="text-slate-400 text-sm">
            Noch Fragen? Wirf einen Blick in unsere{' '}
            <Link href="/guides" className="text-brand-light hover:text-white transition-colors">Guides</Link>
            {' '}oder das{' '}
            <Link href="/regelwerk" className="text-brand-light hover:text-white transition-colors">Regelwerk</Link>
            . Für alles andere sind wir auf{' '}
            <a href="https://discord.gg/greifenberg" target="_blank" rel="noopener noreferrer"
              className="text-brand-light hover:text-white transition-colors">Discord</a>
            {' '}für dich da.
          </p>
        </div>
      </div>
    </div>
  )
}
