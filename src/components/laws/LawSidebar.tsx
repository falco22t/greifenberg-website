'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LawBook, LawChapter } from '@/types/laws'
import { paragraphAnchor } from '@/types/laws'

interface Props {
  book: LawBook
  onSearch: (query: string) => void
  activeAnchor: string | null
}

export default function LawSidebar({ book, onSearch, activeAnchor }: Props) {
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())

  const handleSearch = useCallback((val: string) => {
    setQuery(val)
    onSearch(val)
  }, [onSearch])

  const toggleChapter = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const scrollTo = (anchor: string) => {
    const el = document.getElementById(anchor)
    if (el) {
      const offset = 96
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="lg:sticky lg:top-24 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Paragraph suchen…"
            className="w-full bg-surface-2 border border-white/8 rounded-xl pl-9 pr-9 py-2.5
              text-sm text-white placeholder:text-slate-600
              focus:outline-none focus:border-brand/50 transition-colors"
          />
          {query && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* TOC */}
        <nav className="glass rounded-xl border border-white/6 overflow-hidden">
          <div
            className="px-4 py-3 border-b border-white/6 flex items-center gap-2"
            style={{ borderLeftColor: book.colorAccent, borderLeftWidth: 3 }}
          >
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">
              Inhaltsverzeichnis
            </span>
          </div>

          <div className="max-h-[calc(100vh-280px)] overflow-y-auto py-2">
            {book.chapters.map((chapter: LawChapter) => {
              const isCollapsed = collapsed.has(chapter.id)
              return (
                <div key={chapter.id}>
                  {/* Chapter header */}
                  <button
                    onClick={() => toggleChapter(chapter.id)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold
                      text-slate-400 hover:text-white hover:bg-white/3 transition-colors text-left"
                  >
                    {isCollapsed
                      ? <ChevronRight className="w-3 h-3 flex-shrink-0" />
                      : <ChevronDown className="w-3 h-3 flex-shrink-0" />
                    }
                    <span className="uppercase tracking-wider">
                      Kapitel {chapter.number} · {chapter.title}
                    </span>
                  </button>

                  {/* Paragraphs */}
                  {!isCollapsed && (
                    <div className="ml-4 border-l border-white/6">
                      {chapter.paragraphs.map((para) => {
                        const anchor = paragraphAnchor(para.paragraphNumber)
                        const isActive = activeAnchor === anchor
                        return (
                          <button
                            key={para.id}
                            onClick={() => scrollTo(anchor)}
                            className={cn(
                              'w-full text-left px-3 py-1.5 text-xs transition-all rounded-r-lg',
                              'flex items-center gap-2 hover:bg-white/5',
                              isActive
                                ? 'text-white font-semibold bg-brand/10 border-l-2 -ml-px pl-[13px]'
                                : 'text-slate-500 hover:text-slate-300'
                            )}
                            style={isActive ? { borderLeftColor: book.colorAccent } : {}}
                          >
                            <span className="font-mono text-[10px] font-bold flex-shrink-0"
                              style={{ color: isActive ? book.colorAccent : undefined }}>
                              {para.paragraphNumber}
                            </span>
                            <span className="truncate">{para.title}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </nav>
      </div>
    </aside>
  )
}
