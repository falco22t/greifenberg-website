import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'Regelwerk' }

const rules = [
  {
    number: '§ 1',
    title: 'Allgemeines Verhalten',
    content: 'Jeder Spieler hat sich respektvoll gegenüber anderen Spielern und dem Team zu verhalten. Beleidigungen, Diskriminierung oder Hassrede sind nicht toleriert und führen zu sofortigem Bann.',
  },
  {
    number: '§ 2',
    title: 'Roleplay-Pflicht (FearRP)',
    content: 'Jeder Spieler ist verpflichtet, sein Rollenspiel realistisch zu gestalten. FearRP (Angst vor dem Tod) muss eingehalten werden. Dein Charakter muss in gefährlichen Situationen lebenserhaltend handeln.',
  },
  {
    number: '§ 3',
    title: 'RDM & VDM',
    content: 'Random Deathmatch (RDM) — das grundlose Töten anderer Spieler — ist verboten. Vehicle Deathmatch (VDM) — das absichtliche Überfahren von Spielern — ist ebenfalls verboten. Beide Verstöße werden mit einem Bann geahndet.',
  },
  {
    number: '§ 4',
    title: 'Powergaming',
    content: 'Powergaming — das Erzwingen von Aktionen auf andere Spieler ohne deren Möglichkeit zur Reaktion oder das Ausnutzen von Spielmechaniken auf unrealistische Weise — ist untersagt.',
  },
  {
    number: '§ 5',
    title: 'Metagaming',
    content: 'Die Nutzung von Informationen außerhalb des Rollenspiels (z.B. Discord, Streams) für ingame-Vorteile ist verboten. Informationen die dein Charakter nicht wissen kann, dürfen nicht genutzt werden.',
  },
  {
    number: '§ 6',
    title: 'Combat Logging',
    content: 'Das absichtliche Verlassen des Servers während einer aktiven Roleplay-Situation (insbesondere Kämpfen oder Festnahmen) ist nicht erlaubt und wird sanktioniert.',
  },
  {
    number: '§ 7',
    title: 'New Life Rule (NLR)',
    content: 'Nach dem Tod deines Charakters vergisst dieser alle Ereignisse, die zu seinem Tod geführt haben. Du darfst nicht sofort an den Ort des Todes zurückkehren oder Rache an den Verursachern nehmen.',
  },
  {
    number: '§ 8',
    title: 'Bug-Nutzung & Cheating',
    content: 'Das bewusste Ausnutzen von Bugs, Exploits oder die Nutzung von Cheats, Mods oder Third-Party-Software führt zu einem permanenten Bann ohne Möglichkeit auf Entbannung.',
  },
  {
    number: '§ 9',
    title: 'Kommunikation',
    content: 'Belästigung, Stalking oder unerwünschter Kontakt gegenüber anderen Spielern oder Teammitgliedern — sei es ingame oder auf externen Plattformen — ist streng verboten.',
  },
  {
    number: '§ 10',
    title: 'Team-Entscheidungen',
    content: 'Entscheidungen des Teams sind zu respektieren. Bei Uneinigkeit steht der offizielle Beschwerdeweg über Discord zur Verfügung. Öffentliches Diskreditieren von Team-Entscheidungen ist nicht erlaubt.',
  },
]

export default function RegelwerkPage() {
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

        {/* Rules */}
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.number} className="glass rounded-xl border border-white/6 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-surface-2/30">
                <span className="font-mono text-sm font-black text-brand-light">{rule.number}</span>
                <h2 className="font-bold text-white">{rule.title}</h2>
              </div>
              <div className="px-5 py-4">
                <p className="text-slate-300 text-sm leading-relaxed">{rule.content}</p>
              </div>
            </div>
          ))}
        </div>

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
