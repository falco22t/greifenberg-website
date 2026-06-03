'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ExternalLink, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LawBook, LawChapter, LawParagraph } from '@/types/laws'
import { paragraphAnchor } from '@/types/laws'

interface Props {
  book: LawBook
  searchQuery: string
  onAnchorChange: (anchor: string | null) => void
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-brand/30 text-white rounded px-0.5">{part}</mark>
      : part
  )
}

function matchesParagraph(para: LawParagraph, query: string): boolean {
  if (!query.trim()) return true
  const q = query.toLowerCase()
  return (
    para.paragraphNumber.toLowerCase().includes(q) ||
    para.title.toLowerCase().includes(q) ||
    para.content.toLowerCase().includes(q)
  )
}

export default function LawContent({ book, searchQuery, onAnchorChange }: Props) {
  const observerRef = useRef<IntersectionObserver | null>(null)

  const initObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible) onAnchorChange(visible.target.id)
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )
    document.querySelectorAll('[data-para-anchor]').forEach((el) => {
      observerRef.current?.observe(el)
    })
  }, [onAnchorChange])

  useEffect(() => {
    initObserver()
    return () => observerRef.current?.disconnect()
  }, [initObserver])

  const filteredChapters = book.chapters
    .map((ch) => ({
      ...ch,
      paragraphs: ch.paragraphs.filter((p) => matchesParagraph(p, searchQuery)),
    }))
    .filter((ch) => ch.paragraphs.length > 0)

  const copyAnchorLink = (anchor: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${anchor}`
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="flex-1 min-w-0">
      {/* Search result count */}
      <AnimatePresence>
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 px-4 py-2.5 glass-brand rounded-xl text-sm text-brand-light border border-brand/20"
          >
            {filteredChapters.reduce((a, c) => a + c.paragraphs.length, 0)} Treffer für „{searchQuery}"
          </motion.div>
        )}
      </AnimatePresence>

      {filteredChapters.length === 0 ? (
        <div className="glass rounded-2xl border border-white/6 p-12 text-center">
          <p className="text-slate-400">Keine Paragraphen gefunden für „{searchQuery}"</p>
        </div>
      ) : (
        <div className="space-y-10">
          {filteredChapters.map((chapter: LawChapter) => (
            <div key={chapter.id}>
              {/* Chapter heading */}
              <div
                className="flex items-center gap-3 mb-5 pb-3 border-b border-white/8"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{
                    backgroundColor: book.colorAccent + '15',
                    color: book.colorAccent,
                    border: `1px solid ${book.colorAccent}30`
                  }}
                >
                  {chapter.number}
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Kapitel {chapter.number}</p>
                  <h2 className="text-base font-bold text-white">{chapter.title}</h2>
                </div>
              </div>

              {/* Paragraphs */}
              <div className="space-y-4">
                {chapter.paragraphs.map((para: LawParagraph) => {
                  const anchor = paragraphAnchor(para.paragraphNumber)
                  return (
                    <motion.div
                      key={para.id}
                      id={anchor}
                      data-para-anchor
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      className="glass rounded-xl border border-white/6 overflow-hidden
                        hover:border-white/10 transition-colors scroll-mt-28"
                    >
                      {/* Paragraph header */}
                      <div
                        className="flex items-center justify-between px-5 py-3.5 border-b border-white/6"
                        style={{ borderLeftColor: book.colorAccent, borderLeftWidth: 3 }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="font-mono text-sm font-black"
                            style={{ color: book.colorAccent }}
                          >
                            {para.paragraphNumber}
                          </span>
                          <h3 className="font-bold text-white text-sm">
                            {highlightText(para.title, searchQuery)}
                          </h3>
                        </div>
                        <button
                          onClick={() => copyAnchorLink(anchor)}
                          title="Link kopieren"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300
                            hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Hash className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Paragraph content */}
                      <div className="px-5 py-4">
                        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                          {highlightText(para.content, searchQuery)}
                        </div>

                        {/* Cross-references */}
                        {Array.isArray(para.references) && para.references.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-white/5">
                            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">
                              Verweise
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(para.references as Array<{ bookSlug: string; paragraphNumber: string; label: string }>)
                                .map((ref, i) => (
                                  <Link
                                    key={i}
                                    href={`/gesetze/${ref.bookSlug}#${paragraphAnchor(ref.paragraphNumber)}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                                      glass-brand border border-brand/20 text-brand-light text-xs
                                      hover:text-white hover:border-brand/40 transition-colors"
                                  >
                                    {ref.label || ref.paragraphNumber}
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
