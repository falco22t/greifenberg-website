import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, BookMarked, Clock, ArrowRight, Zap, Car, Users, Briefcase, Shield, MessageCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'Einsteiger-Guide' }

const guides = [
  {
    icon: Zap,
    color: '#1C559A',
    title: 'Erste Schritte',
    description: 'Wie du dem Server beitrittst, deinen Charakter erstellst und die Grundmechaniken erlernst.',
    duration: '5 min',
    steps: [
      'FiveM herunterladen und installieren',
      'Server in der Serverliste suchen: "Greifenberg RP"',
      'Direkt verbinden: F8-Konsole → connect <server-ip>',
      'Charakter erstellen und Starterausstattung erhalten',
      'Tutorial-Missionen abschließen',
    ],
  },
  {
    icon: Briefcase,
    color: '#10B981',
    title: 'Dein erster Job',
    description: 'Lerne die verschiedenen legalen Jobs kennen und wie du dein erstes Geld verdienst.',
    duration: '8 min',
    steps: [
      'Zum Arbeitsamt fahren (markiert auf der Karte)',
      'Einen Einstiegsjob wählen (z.B. Müllabfuhr, Taxifahrer)',
      'Job-Fahrzeug aus dem Depot holen',
      'Aufträge via Handy oder Blips annehmen',
      'Gehalt wird automatisch ausgezahlt',
    ],
  },
  {
    icon: Car,
    color: '#F59E0B',
    title: 'Fahrzeuge & Führerschein',
    description: 'Alles über Fahrzeuge kaufen, versichern und den Führerschein erwerben.',
    duration: '6 min',
    steps: [
      'Führerschein bei der Fahrschule machen',
      'Fahrzeug beim Händler kaufen oder mieten',
      'Fahrzeug versichern (Pflicht!)',
      'Fahrzeug im eigenen Garage einlagern',
      'Verkehrsregeln beachten (StVO)',
    ],
  },
  {
    icon: Users,
    color: '#8B5CF6',
    title: 'Fraktionen beitreten',
    description: 'Wie du dich bei Polizei, Feuerwehr, Rettungsdienst oder anderen Fraktionen bewirbst.',
    duration: '4 min',
    steps: [
      'Discord öffnen und zum Bewerbungskanal navigieren',
      'Bewerbungsformular für die gewünschte Fraktion ausfüllen',
      'Auf Rückmeldung des Fraktionsführers warten',
      'Vorstellungsgespräch im RP führen',
      'Ausbildung absolvieren',
    ],
  },
  {
    icon: Shield,
    color: '#EF4444',
    title: 'Roleplay-Grundlagen',
    description: 'Die wichtigsten RP-Regeln und wie du gutes Roleplay betreibst.',
    duration: '10 min',
    steps: [
      'FearRP: Deinen Charakter realistisch spielen',
      'NLR: Nach dem Tod alles vergessen',
      'Kein Metagaming (externe Infos nutzen)',
      'Kein RDM/VDM (sinnlose Gewalt)',
      'Charakter-Kontinuität: Gleiche Persönlichkeit behalten',
    ],
  },
  {
    icon: MessageCircle,
    color: '#5865F2',
    title: 'Community & Discord',
    description: 'Wie du unsere Community kennenlernst und wo du Hilfe bekommst.',
    duration: '3 min',
    steps: [
      'Discord beitreten: discord.gg/TspeGxXr2C',
      'Regeln im Discord lesen und akzeptieren',
      'Deinen Account verifizieren',
      'Support-Kanal für Fragen nutzen',
      'Community-Events & Ankündigungen verfolgen',
    ],
  },
]

export default function GuidesPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">Startseite</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300">Guides</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl glass-brand border border-brand/20 flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-brand-light" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Einsteiger-Guide</h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl">
            Alles was du für den Start auf Greifenberg RP wissen musst — Schritt für Schritt erklärt.
          </p>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide) => (
            <div key={guide.title} className="glass rounded-2xl border border-white/6 overflow-hidden hover:border-white/12 transition-all">
              {/* Header */}
              <div className="p-5 border-b border-white/5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: guide.color + '20', border: `1px solid ${guide.color}30` }}>
                    <guide.icon className="w-5 h-5" style={{ color: guide.color }} />
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3 h-3" /> {guide.duration}
                  </span>
                </div>
                <h2 className="font-black text-white mb-1">{guide.title}</h2>
                <p className="text-slate-400 text-sm">{guide.description}</p>
              </div>

              {/* Steps */}
              <div className="p-5">
                <ol className="space-y-2">
                  {guide.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: guide.color + '20', color: guide.color }}>
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>

        {/* Discord CTA */}
        <div className="mt-12 p-6 glass-brand rounded-2xl border border-brand/20 text-center">
          <p className="text-white font-bold mb-2">Noch Fragen?</p>
          <p className="text-slate-400 text-sm mb-4">
            Unser Team und die Community helfen dir gerne auf Discord weiter.
          </p>
          <a href="https://discord.gg/TspeGxXr2C" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white font-semibold text-sm hover:opacity-90 transition-opacity">
            Discord beitreten <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
