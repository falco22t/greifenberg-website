'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CTASection() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl border border-brand/20 p-12 sm:p-16 relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 gradient-brand-subtle" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand/10 rounded-full blur-3xl" />

          <div className="relative">
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Bereit für{' '}
              <span className="gradient-text-brand">Greifenberg RP</span>?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto">
              Registriere dich jetzt, lies dir unseren Einsteiger-Guide durch und tauche in die Welt von Greifenberg ein.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://discord.gg/greifenbergrp" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="gradient-brand glow-brand text-white font-bold px-8 py-6 rounded-xl gap-2 hover:opacity-90"
                >
                  Discord beitreten
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
              <Link href="/guides">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 px-8 py-6 rounded-xl gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Einsteiger-Guide
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
