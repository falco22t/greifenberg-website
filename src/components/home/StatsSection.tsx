'use client'

import { motion } from 'framer-motion'
import { Clock, MessageSquare, BookOpen, Users } from 'lucide-react'

const stats = [
  { icon: Clock,         value: '24/7',   label: 'Server online',         color: 'text-green-400'  },
  { icon: Users,         value: 'FiveM',  label: 'Roleplay Server',        color: 'text-brand-light' },
  { icon: BookOpen,      value: '6',      label: 'Gesetzbücher',           color: 'text-amber-400'  },
  { icon: MessageSquare, value: 'Aktiv',  label: 'Community & Forum',      color: 'text-purple-400' },
]

export default function StatsSection() {
  return (
    <section className="relative py-16 border-y border-white/5">
      <div className="absolute inset-0 gradient-brand-subtle" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 text-center hover:border-brand/20 transition-colors"
            >
              <div className="inline-flex p-3 rounded-xl bg-white/5 mb-3">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
