import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Regelwerk' }
export const revalidate = 60

async function getData() {
  try {
    return await prisma.ruleSection.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { rules: { orderBy: { sortOrder: 'asc' } } },
    })
  } catch { return [] }
}

export default async function RegelwerkPage() {
  const sections = await getData()

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">Startseite</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300">Regelwerk</span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl glass-brand border border-brand/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-light" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Regelwerk</h1>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Das Regelwerk von Greifenberg RP gilt für alle Spieler und ist verbindlich.
            Unwissenheit schützt nicht vor Konsequenzen. Bei Fragen wende dich an unser Team.
          </p>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-10">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-amber-200/80 text-sm">
            Das Regelwerk kann jederzeit ohne Vorankündigung angepasst werden. Es liegt in deiner
            Verantwortung, es regelmäßig zu lesen.
          </p>
        </div>

        {sections.length === 0 ? (
          <div className="glass rounded-xl border border-white/6 p-12 text-center">
            <Shield className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Das Regelwerk wird gerade konfiguriert.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.id}>
                {section.title && (
                  <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-brand inline-block" />
                    {section.title}
                  </h2>
                )}
                <div className="space-y-3">
                  {section.rules.map((rule) => (
                    <div key={rule.id} className="glass rounded-xl border border-white/6 overflow-hidden">
                      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-surface-2/30">
                        <span className="font-mono text-sm font-black text-brand-light">{rule.number}</span>
                        <h3 className="font-bold text-white">{rule.title}</h3>
                      </div>
                      <div className="px-5 py-4">
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{rule.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-10 flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-green-200/80 text-sm">
            Mit dem Beitritt zum Server erkennst du dieses Regelwerk an. Bei Verstößen
            drohen Verwarnungen, temporäre oder permanente Banns.
          </p>
        </div>
      </div>
    </div>
  )
}
