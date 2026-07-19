'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Play, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video Placeholder / Overlay */}
      <div className="absolute inset-0 bg-surface-0">
        {/* Animated gradient background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-light/15 rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(28,85,154,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(28,85,154,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-0/50 via-transparent to-surface-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-sm border-brand/40 text-brand-light bg-brand/10 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 animate-pulse inline-block" />
            Server Online · FiveM Roleplay
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight mb-6 leading-[1.05]"
        >
          <span className="text-white">Willkommen in</span>
          <br />
          <span className="gradient-text-brand text-glow-brand">Greifenberg</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Tauche ein in das führende deutschsprachige FiveM Roleplay-Erlebnis.
          Realistische Mechaniken, aktive Community, professionelles Team.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a href="https://discord.gg/greifenbergrp" target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="gradient-brand glow-brand text-white font-bold px-8 py-6 text-base rounded-xl hover:opacity-90 transition-opacity gap-2"
            >
              Jetzt beitreten
              <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
          <Link href="/guides">
            <Button
              size="lg"
              variant="outline"
              className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 px-8 py-6 text-base rounded-xl gap-2 backdrop-blur-sm"
            >
              <Play className="w-5 h-5" />
              Einsteiger-Guide
            </Button>
          </Link>
        </motion.div>

      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-0 to-transparent pointer-events-none" />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <span className="text-xs text-slate-500">Scrollen</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-px h-8 bg-gradient-to-b from-brand/50 to-transparent"
        />
      </motion.div>
    </section>
  )
}
