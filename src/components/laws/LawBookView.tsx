'use client'

import { useState, useCallback } from 'react'
import LawSidebar from './LawSidebar'
import LawContent from './LawContent'
import type { LawBook } from '@/types/laws'

interface Props {
  book: LawBook
}

export default function LawBookView({ book }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null)

  const handleSearch = useCallback((q: string) => setSearchQuery(q), [])
  const handleAnchorChange = useCallback((a: string | null) => setActiveAnchor(a), [])

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <LawSidebar
        book={book}
        onSearch={handleSearch}
        activeAnchor={activeAnchor}
      />
      <LawContent
        book={book}
        searchQuery={searchQuery}
        onAnchorChange={handleAnchorChange}
      />
    </div>
  )
}
