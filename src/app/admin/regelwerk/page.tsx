'use client'

import { useState, useEffect, useCallback } from 'react'
import { Shield, Plus, Pencil, Trash2, ChevronDown, ChevronUp, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Rule {
  id: number
  number: string
  title: string
  content: string
  sortOrder: number
  sectionId: number
}

interface RuleSection {
  id: number
  title: string
  sortOrder: number
  rules: Rule[]
}

type EditTarget = { type: 'section'; id: number } | { type: 'rule'; id: number }

function SectionForm({ initial, onSave, onCancel }: {
  initial?: { title: string }
  onSave: (data: { title: string }) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-2 border border-white/8">
      <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Abschnitts-Titel"
        className="h-8 text-sm bg-transparent border-white/10" onKeyDown={e => e.key === 'Enter' && onSave({ title })} />
      <Button size="sm" className="gradient-brand text-white h-8 px-3" onClick={() => onSave({ title })}>
        <Save className="w-3.5 h-3.5" />
      </Button>
      <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-400 hover:text-white" onClick={onCancel}>
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}

function RuleForm({ initial, sectionId, onSave, onCancel }: {
  initial?: Rule
  sectionId: number
  onSave: (data: { number: string; title: string; content: string; sectionId: number }) => void
  onCancel: () => void
}) {
  const [num, setNum] = useState(initial?.number ?? '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  return (
    <div className="p-4 rounded-xl bg-surface-2 border border-white/8 space-y-3">
      <div className="flex gap-2">
        <Input value={num} onChange={e => setNum(e.target.value)} placeholder="§ 1"
          className="h-8 text-sm bg-transparent border-white/10 w-24" />
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titel der Regel"
          className="h-8 text-sm bg-transparent border-white/10 flex-1" />
      </div>
      <textarea value={content} onChange={e => setContent(e.target.value)}
        placeholder="Inhalt der Regel..."
        className="w-full min-h-[100px] resize-y rounded-lg bg-transparent border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand/50" />
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" className="h-8 text-slate-400 hover:text-white" onClick={onCancel}>Abbrechen</Button>
        <Button size="sm" className="gradient-brand text-white h-8 px-4"
          onClick={() => onSave({ number: num, title, content, sectionId })}>
          Speichern
        </Button>
      </div>
    </div>
  )
}

export default function AdminRegelwerkPage() {
  const [sections, setSections] = useState<RuleSection[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())
  const [addingSection, setAddingSection] = useState(false)
  const [addingRuleInSection, setAddingRuleInSection] = useState<number | null>(null)
  const [editing, setEditing] = useState<EditTarget | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/rules')
      const data = await res.json() as { sections: RuleSection[] }
      setSections(data.sections ?? [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function toggleCollapse(id: number) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function createSection(data: { title: string }) {
    await fetch('/api/admin/rules/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setAddingSection(false)
    await load()
  }

  async function updateSection(id: number, data: { title: string }) {
    await fetch(`/api/admin/rules/sections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setEditing(null)
    await load()
  }

  async function deleteSection(id: number) {
    if (!confirm('Diesen Abschnitt und alle Regeln darin wirklich löschen?')) return
    await fetch(`/api/admin/rules/sections/${id}`, { method: 'DELETE' })
    await load()
  }

  async function createRule(data: { number: string; title: string; content: string; sectionId: number }) {
    await fetch('/api/admin/rules/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setAddingRuleInSection(null)
    await load()
  }

  async function updateRule(id: number, data: Partial<Rule>) {
    await fetch(`/api/admin/rules/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setEditing(null)
    await load()
  }

  async function deleteRule(id: number) {
    if (!confirm('Diese Regel wirklich löschen?')) return
    await fetch(`/api/admin/rules/items/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-brand-light" /> Regelwerk
        </h1>
        <Button size="sm" className="gradient-brand text-white gap-1.5" onClick={() => setAddingSection(true)}>
          <Plus className="w-4 h-4" /> Abschnitt hinzufügen
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-xl border border-white/6 h-16 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {addingSection && (
            <SectionForm onSave={createSection} onCancel={() => setAddingSection(false)} />
          )}

          {sections.map((section) => (
            <div key={section.id} className="glass rounded-xl border border-white/6 overflow-hidden">
              {/* Section header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-surface-2/40 border-b border-white/5">
                <button onClick={() => toggleCollapse(section.id)} className="text-slate-400 hover:text-white transition-colors">
                  {collapsed.has(section.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>

                {editing?.type === 'section' && editing.id === section.id ? (
                  <div className="flex-1">
                    <SectionForm
                      initial={{ title: section.title }}
                      onSave={(d) => updateSection(section.id, d)}
                      onCancel={() => setEditing(null)}
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="flex-1 font-bold text-white">{section.title}</h2>
                    <span className="text-xs text-slate-500">{section.rules.length} Regeln</span>
                    <button onClick={() => setEditing({ type: 'section', id: section.id })}
                      className="p-1.5 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteSection(section.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* Rules */}
              {!collapsed.has(section.id) && (
                <div className="divide-y divide-white/4">
                  {section.rules.map((rule) => (
                    <div key={rule.id} className="px-4 py-3">
                      {editing?.type === 'rule' && editing.id === rule.id ? (
                        <RuleForm
                          initial={rule}
                          sectionId={section.id}
                          onSave={(d) => updateRule(rule.id, d)}
                          onCancel={() => setEditing(null)}
                        />
                      ) : (
                        <div className="flex items-start gap-3 group">
                          <span className="font-mono text-xs text-brand-light font-black pt-0.5 w-10 flex-shrink-0">{rule.number}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm">{rule.title}</p>
                            <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">{rule.content}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button onClick={() => setEditing({ type: 'rule', id: rule.id })}
                              className="p-1.5 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteRule(rule.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add rule form or button */}
                  <div className="px-4 py-3">
                    {addingRuleInSection === section.id ? (
                      <RuleForm
                        sectionId={section.id}
                        onSave={createRule}
                        onCancel={() => setAddingRuleInSection(null)}
                      />
                    ) : (
                      <button
                        onClick={() => setAddingRuleInSection(section.id)}
                        className="flex items-center gap-2 text-xs text-slate-500 hover:text-brand-light transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Regel hinzufügen
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {sections.length === 0 && !addingSection && (
            <div className="glass rounded-xl border border-white/6 p-12 text-center">
              <Shield className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">Noch keine Abschnitte. Erstelle den ersten Abschnitt.</p>
              <Button size="sm" className="gradient-brand text-white gap-1.5" onClick={() => setAddingSection(true)}>
                <Plus className="w-4 h-4" /> Abschnitt erstellen
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
