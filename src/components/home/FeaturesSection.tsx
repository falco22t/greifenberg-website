'use client'

import { motion } from 'framer-motion'
import {
  Shield, Users, BookOpen, Cpu, Map, Briefcase,
  Car, Building2, Scale, Siren,
} from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Professionelle Admins',
    description: 'Erfahrenes und faires Team, das rund um die Uhr für eine saubere Roleplay-Umgebung sorgt.',
    size: 'large',
  },
  {
    icon: Users,
    title: 'Aktive Community',
    description: 'Hunderte aktiver Spieler und ein lebendiges Forum für echten Austausch.',
    size: 'small',
  },
  {
    icon: Cpu,
    title: 'Custom Scripts',
    description: 'Eigens entwickelte ESX-Ressourcen für ein einzigartiges Spielerlebnis.',
    size: 'small',
  },
  {
    icon: Scale,
    title: 'Detailliertes Rechtssystem',
    description: 'Vollständiges Gesetzbuch mit StGB, StVO, PolG und mehr — direkt auf der Website einsehbar.',
    size: 'large',
  },
  {
    icon: Car,
    title: 'Fahrzeug-Vielfalt',
    description: 'Hunderte Custom-Fahrzeuge für alle Fraktionen und Zivilisten.',
    size: 'small',
  },
  {
    icon: Building2,
    title: 'Wirtschaftssystem',
    description: 'Realistische Wirtschaft mit Jobs, Unternehmen, Immobilien und Banksystem.',
    size: 'small',
  },
  {
    icon: Siren,
    title: 'Fraktionen',
    description: 'Polizei, Feuerwehr, Rettungsdienst, Justiz und viele weitere Fraktionen mit Struktur.',
    size: 'small',
  },
  {
    icon: Map,
    title: 'Custom Map',
    description: 'Erweiterte Karte mit exklusiven Locations, die nur auf Greifenberg existieren.',
    size: 'small',
  },
  {
    icon: Briefcase,
    title: 'Viele Jobs',
    description: 'Über 20 legale und illegale Jobs für jeden Spielstil.',
    size: 'small',
  },
  {
    icon: BookOpen,
    title: 'Einsteiger-Guides',
    description: 'Schritt-für-Schritt Anleitungen für neue Spieler, damit du sofort loslegen kannst.',
    size: 'small',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-brand-light font-semibold text-sm uppercase tracking-widest mb-3">
            Warum Greifenberg RP?
          </p>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Alles was du brauchst
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Wir haben jedes Detail durchdacht — von der Technik bis zur Community.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`glass rounded-2xl p-6 border border-white/5 hover:border-brand/25
                hover:bg-brand/5 transition-all duration-300 group cursor-default
                ${feature.size === 'large' ? 'lg:col-span-2' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl glass-brand flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-brand-light group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1.5 group-hover:text-brand-light transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
