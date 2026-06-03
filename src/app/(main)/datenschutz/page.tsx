import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = { title: 'Datenschutz' }

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">Startseite</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300">Datenschutz</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-8">Datenschutzerklärung</h1>

        <div className="glass rounded-2xl border border-white/6 p-8 space-y-8 text-slate-300 text-sm leading-relaxed">
          <div>
            <h2 className="text-white font-bold mb-3">1. Verantwortlicher</h2>
            <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist der Betreiber von Greifenberg RP.
            Kontakt: admin@greifenberg-rp.de</p>
          </div>

          <div>
            <h2 className="text-white font-bold mb-3">2. Welche Daten wir erheben</h2>
            <ul className="space-y-1 list-disc list-inside">
              <li>Benutzername und E-Mail-Adresse bei Registrierung</li>
              <li>IP-Adressen (für Sicherheit und Logging)</li>
              <li>Inhalte die du selbst erstellst (Forum-Beiträge, Tickets)</li>
              <li>Discord-ID (optional, bei Verknüpfung)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-bold mb-3">3. Zweck der Verarbeitung</h2>
            <ul className="space-y-1 list-disc list-inside">
              <li>Bereitstellung der Website-Funktionen (Forum, Profil etc.)</li>
              <li>Sicherheit und Missbrauchsprävention</li>
              <li>Kommunikation bei Support-Anfragen</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-bold mb-3">4. Datenweitergabe</h2>
            <p>Deine Daten werden nicht an Dritte verkauft oder weitergegeben,
            außer wenn dies zur Bereitstellung des Dienstes notwendig ist oder
            eine gesetzliche Verpflichtung besteht.</p>
          </div>

          <div>
            <h2 className="text-white font-bold mb-3">5. Datenspeicherung & Löschung</h2>
            <p>Deine Daten werden auf unserem Server in Deutschland gespeichert.
            Du kannst jederzeit die Löschung deines Accounts und aller damit
            verbundenen Daten beantragen per E-Mail an admin@greifenberg-rp.de.</p>
          </div>

          <div>
            <h2 className="text-white font-bold mb-3">6. Cookies</h2>
            <p>Diese Website verwendet ausschließlich technisch notwendige Cookies
            für die Authentifizierung (Session-Cookie). Es werden keine
            Tracking- oder Marketing-Cookies eingesetzt.</p>
          </div>

          <div>
            <h2 className="text-white font-bold mb-3">7. Deine Rechte</h2>
            <p>Du hast das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung
            der Verarbeitung deiner Daten. Wende dich dafür an admin@greifenberg-rp.de.</p>
          </div>

          <p className="text-slate-500 text-xs">Stand: Juni 2026</p>
        </div>
      </div>
    </div>
  )
}
