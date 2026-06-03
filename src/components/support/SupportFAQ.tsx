'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Zap, Book, Search, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQ_ITEMS = [
  {
    category: 'Erste Schritte',
    icon: Zap,
    color: '#1C559A',
    questions: [
      { q: 'Wie trete ich dem Server bei?', a: 'Starte FiveM, klicke auf "Server suchen" und gib "Greifenberg RP" ein oder nutze die direkte Verbindung via F8-Konsole. Stelle sicher, dass du registriert bist.' },
      { q: 'Wo finde ich den Einsteiger-Guide?', a: 'Den vollständigen Einsteiger-Guide findest du unter /guides auf dieser Website. Dort werden alle grundlegenden Mechaniken Schritt für Schritt erklärt.' },
      { q: 'Muss ich mich registrieren?', a: 'Ja, eine Registrierung auf dieser Website ist erforderlich, um am Forum teilzunehmen und Servervorteile zu nutzen. Den Server selbst kannst du auch ohne Registrierung besuchen.' },
    ],
  },
  {
    category: 'Regelwerk',
    icon: Book,
    color: '#F59E0B',
    questions: [
      { q: 'Wo finde ich das Regelwerk?', a: 'Das vollständige Regelwerk ist unter /regelwerk einsehbar. Bitte lies es vollständig durch, bevor du dem Server beitrittst.' },
      { q: 'Was ist RDM und VDM?', a: 'RDM (Random Death Match) bedeutet, jemanden ohne Roleplay-Grund zu töten. VDM (Vehicle Death Match) bedeutet, jemanden absichtlich mit einem Fahrzeug zu überfahren. Beides ist verboten.' },
      { q: 'Was passiert bei einem Regelverstoß?', a: 'Je nach Schwere des Verstoßes: Verwarnung, temporärer Bann oder permanenter Bann. Bei Einsprüchen wende dich über unseren Discord an das Team.' },
    ],
  },
  {
    category: 'Technische Probleme',
    icon: Search,
    color: '#8B5CF6',
    questions: [
      { q: 'Der Server lädt nicht / ich habe Lag', a: 'Überprüfe deine Internetverbindung und stelle sicher, dass FiveM auf dem neuesten Stand ist. Lösche den Cache unter %localappdata%\\FiveM\\FiveM.app\\data\\cache. Bei anhaltenden Problemen melde dich im Discord.' },
      { q: 'Mein Charakter ist fehlerhaft / Daten verloren', a: 'Wende dich sofort über unseren Discord an das Support-Team. Bitte notiere deinen Benutzernamen, den Zeitpunkt des Problems und was genau passiert ist.' },
      { q: 'Ich wurde fälschlicherweise gebannt', a: 'Erstelle einen Entbannungsantrag in unserem Discord unter dem entsprechenden Channel. Das Team prüft deinen Fall innerhalb von 48 Stunden.' },
    ],
  },
  {
    category: 'Fraktionen & Jobs',
    icon: Shield,
    color: '#10B981',
    questions: [
      { q: 'Wie bewerbe ich mich bei einer Fraktion?', a: 'Bewerbungen für Fraktionen (Polizei, Feuerwehr etc.) laufen über unseren Discord. Dort findest du die jeweiligen Bewerbungskanäle und Anforderungen.' },
      { q: 'Welche Jobs gibt es auf dem Server?', a: 'Wir bieten über 20 verschiedene Jobs an: Taxifahrer, Mechaniker, Müllabfuhr, Koch, Farmer und viele mehr. Eine vollständige Liste findest du im Einsteiger-Guide.' },
    ],
  },
]

export default function SupportFAQ() {
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {FAQ_ITEMS.map((cat) => (
        <div key={cat.category}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: cat.color + '20' }}>
              <cat.icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
            </div>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">{cat.category}</h3>
          </div>
          <div className="space-y-2">
            {cat.questions.map((item, i) => {
              const key = `${cat.category}-${i}`
              const isOpen = openKey === key
              return (
                <div key={key} className={cn('glass rounded-xl border transition-colors duration-200',
                  isOpen ? 'border-white/12' : 'border-white/6 hover:border-white/10')}>
                  <button onClick={() => setOpenKey(isOpen ? null : key)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left gap-4">
                    <span className={cn('text-sm font-semibold transition-colors', isOpen ? 'text-white' : 'text-slate-300')}>
                      {item.q}
                    </span>
                    <ChevronDown className={cn('w-4 h-4 flex-shrink-0 transition-transform duration-300 text-slate-500', isOpen && 'rotate-180 text-brand-light')} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="px-5 pb-4 border-t border-white/6">
                          <p className="text-slate-400 text-sm leading-relaxed pt-3">{item.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
