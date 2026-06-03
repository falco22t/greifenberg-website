import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = { title: 'Impressum' }

export default function ImpressumPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">Startseite</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300">Impressum</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-8">Impressum</h1>

        <div className="glass rounded-2xl border border-white/6 p-8 space-y-6 text-slate-300 text-sm leading-relaxed">
          <div>
            <h2 className="text-white font-bold mb-2">Angaben gemäß § 5 TMG</h2>
            <p>Greifenberg RP<br />
            Betreiber: [Name eintragen]<br />
            [Straße und Hausnummer]<br />
            [PLZ Ort]</p>
          </div>

          <div>
            <h2 className="text-white font-bold mb-2">Kontakt</h2>
            <p>E-Mail: admin@greifenberg-rp.de<br />
            Discord: <a href="https://discord.gg/TspeGxXr2C" target="_blank" rel="noopener noreferrer" className="text-brand-light hover:text-white transition-colors">discord.gg/TspeGxXr2C</a></p>
          </div>

          <div>
            <h2 className="text-white font-bold mb-2">Hinweis</h2>
            <p>Greifenberg RP ist ein privates, nicht-kommerzielles FiveM Roleplay-Projekt.
            Es besteht keine Verbindung zu Rockstar Games oder Take-Two Interactive.</p>
          </div>

          <div>
            <h2 className="text-white font-bold mb-2">Haftungsausschluss</h2>
            <p>Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt.
            Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen
            wir jedoch keine Gewähr. Als Diensteanbieter sind wir für eigene Inhalte
            auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
