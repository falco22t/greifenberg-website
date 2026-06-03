'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users2, Plus, Pencil, Trash2, Save, X, Building2, Mail, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type UserRole = 'GUEST' | 'USER' | 'MOD' | 'ADMIN' | 'OWNER'

const ROLE_LABELS: Record<UserRole, string> = {
  GUEST: 'Gast', USER: 'Mitglied', MOD: 'Moderator', ADMIN: 'Administrator', OWNER: 'Gründer',
}
const ROLE_COLORS: Record<UserRole, string> = {
  GUEST: 'border-slate-600 text-slate-400',
  USER: 'border-slate-500 text-slate-300',
  MOD: 'border-green-600 text-green-400',
  ADMIN: 'border-brand text-brand-light',
  OWNER: 'border-amber-600 text-amber-400',
}

interface Department {
  id: number
  name: string
  color: string
  sortOrder: number
  _count?: { members: number }
}

interface TeamMember {
  id: number
  displayName: string
  position: string
  displayRole: string | null
  departmentId: number | null
  bio: string | null
  discordTag: string | null
  avatarUrl: string | null
  isActive: boolean
  sortOrder: number
  department: Department | null
  user: { id: number; username: string; email: string; role: UserRole; avatarUrl: string | null } | null
}

// ── Department form ──────────────────────────────────────────────────────────

function DeptForm({ initial, onSave, onCancel }: {
  initial?: Department
  onSave: (d: { name: string; color: string }) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? '#1C559A')
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-2 border border-white/8">
      <input type="color" value={color} onChange={e => setColor(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Kategorien-Name (z.B. Führungsebene)"
        className="h-8 text-sm bg-transparent border-white/10 flex-1" />
      <Button size="sm" className="gradient-brand text-white h-8 px-3" onClick={() => onSave({ name, color })}>
        <Save className="w-3.5 h-3.5" />
      </Button>
      <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-400 hover:text-white" onClick={onCancel}>
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}

// ── Member form ──────────────────────────────────────────────────────────────

function MemberForm({ initial, departments, onSave, onCancel }: {
  initial?: TeamMember
  departments: Department[]
  onSave: (d: Record<string, unknown>) => void
  onCancel: () => void
}) {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState(initial?.displayName ?? '')
  const [position, setPosition] = useState(initial?.position ?? '')
  const [displayRole, setDisplayRole] = useState(initial?.displayRole ?? '')
  const [deptId, setDeptId] = useState<string>(initial?.departmentId?.toString() ?? '')
  const [bio, setBio] = useState(initial?.bio ?? '')
  const [discordTag, setDiscordTag] = useState(initial?.discordTag ?? '')
  const [userRole, setUserRole] = useState<UserRole>(initial?.user?.role ?? 'USER')

  const isNew = !initial

  return (
    <div className="p-5 rounded-xl bg-surface-2 border border-white/8 space-y-4">
      <h3 className="font-bold text-white text-sm">{isNew ? 'Neues Teammitglied' : 'Mitglied bearbeiten'}</h3>

      {isNew && (
        <div>
          <label className="text-xs text-slate-400 mb-1 block">E-Mail-Adresse des Nutzers (optional — verknüpft einen Account)</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="spieler@beispiel.de"
              className="h-8 text-sm bg-transparent border-white/10 pl-8" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Anzeigename *</label>
          <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Max Mustermann"
            className="h-8 text-sm bg-transparent border-white/10" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Position *</label>
          <Input value={position} onChange={e => setPosition(e.target.value)} placeholder="z.B. Serverleiter"
            className="h-8 text-sm bg-transparent border-white/10" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Anzeige-Rolle (öffentlich sichtbar)</label>
          <Input value={displayRole} onChange={e => setDisplayRole(e.target.value)} placeholder="z.B. Gründer, Support"
            className="h-8 text-sm bg-transparent border-white/10" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Discord-Tag</label>
          <Input value={discordTag} onChange={e => setDiscordTag(e.target.value)} placeholder="Name#0000"
            className="h-8 text-sm bg-transparent border-white/10" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Kategorie</label>
          <select value={deptId} onChange={e => setDeptId(e.target.value)}
            className="w-full h-8 rounded-lg bg-surface-1 border border-white/10 text-white text-sm px-2 focus:outline-none focus:border-brand/50">
            <option value="">— keine —</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Berechtigungs-Rolle
          </label>
          <select value={userRole} onChange={e => setUserRole(e.target.value as UserRole)}
            className="w-full h-8 rounded-lg bg-surface-1 border border-white/10 text-white text-sm px-2 focus:outline-none focus:border-brand/50">
            {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">Bio</label>
        <textarea value={bio} onChange={e => setBio(e.target.value)}
          placeholder="Kurze Beschreibung..."
          className="w-full min-h-[70px] resize-y rounded-lg bg-transparent border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand/50" />
      </div>

      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" className="h-8 text-slate-400 hover:text-white" onClick={onCancel}>Abbrechen</Button>
        <Button size="sm" className="gradient-brand text-white h-8 px-4"
          onClick={() => onSave({
            ...(isNew && { email: email || undefined }),
            displayName, position,
            displayRole: displayRole || undefined,
            departmentId: deptId ? Number(deptId) : null,
            bio: bio || undefined,
            discordTag: discordTag || undefined,
            userRole,
          })}>
          Speichern
        </Button>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

type Tab = 'members' | 'categories'

export default function AdminTeamPage() {
  const [tab, setTab] = useState<Tab>('members')
  const [members, setMembers] = useState<TeamMember[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [addingDept, setAddingDept] = useState(false)
  const [editingDept, setEditingDept] = useState<number | null>(null)
  const [addingMember, setAddingMember] = useState(false)
  const [editingMember, setEditingMember] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [mRes, dRes] = await Promise.all([
        fetch('/api/admin/team/members'),
        fetch('/api/admin/team/departments'),
      ])
      const [mData, dData] = await Promise.all([mRes.json(), dRes.json()]) as [
        { members: TeamMember[] }, { departments: Department[] }
      ]
      setMembers(mData.members ?? [])
      setDepartments(dData.departments ?? [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function saveDept(id: number | null, data: { name: string; color: string }) {
    setError(null)
    const res = id
      ? await fetch(`/api/admin/team/departments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      : await fetch('/api/admin/team/departments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (!res.ok) { const d = await res.json() as { error: string }; setError(d.error); return }
    setAddingDept(false)
    setEditingDept(null)
    await load()
  }

  async function deleteDept(id: number) {
    if (!confirm('Diese Kategorie wirklich löschen? Mitglieder werden keiner Kategorie zugeordnet.')) return
    await fetch(`/api/admin/team/departments/${id}`, { method: 'DELETE' })
    await load()
  }

  async function saveMember(id: number | null, data: Record<string, unknown>) {
    setError(null)
    const res = id
      ? await fetch(`/api/admin/team/members/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      : await fetch('/api/admin/team/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (!res.ok) { const d = await res.json() as { error: string }; setError(d.error); return }
    setAddingMember(false)
    setEditingMember(null)
    await load()
  }

  async function deleteMember(id: number) {
    if (!confirm('Dieses Teammitglied wirklich entfernen?')) return
    await fetch(`/api/admin/team/members/${id}`, { method: 'DELETE' })
    await load()
  }

  async function toggleActive(m: TeamMember) {
    await fetch(`/api/admin/team/members/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !m.isActive }),
    })
    await load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Users2 className="w-6 h-6 text-brand-light" /> Team-Verwaltung
        </h1>
        <div className="flex gap-2">
          {tab === 'categories' ? (
            <Button size="sm" className="gradient-brand text-white gap-1.5" onClick={() => setAddingDept(true)}>
              <Plus className="w-4 h-4" /> Kategorie
            </Button>
          ) : (
            <Button size="sm" className="gradient-brand text-white gap-1.5" onClick={() => setAddingMember(true)}>
              <Plus className="w-4 h-4" /> Mitglied hinzufügen
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-1 rounded-xl p-1 w-fit">
        {(['members', 'categories'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-brand text-white' : 'text-slate-400 hover:text-white'}`}>
            {t === 'members' ? `Mitglieder (${members.length})` : `Kategorien (${departments.length})`}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="glass rounded-xl border border-white/6 h-16 animate-pulse" />)}
        </div>
      ) : tab === 'categories' ? (
        /* ── Categories tab ── */
        <div className="space-y-3">
          {addingDept && (
            <DeptForm onSave={d => saveDept(null, d)} onCancel={() => setAddingDept(false)} />
          )}
          {departments.map(dept => (
            <div key={dept.id} className="glass rounded-xl border border-white/6 p-4">
              {editingDept === dept.id ? (
                <DeptForm initial={dept} onSave={d => saveDept(dept.id, d)} onCancel={() => setEditingDept(null)} />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: dept.color }} />
                  <span className="font-bold text-white flex-1">{dept.name}</span>
                  <span className="text-xs text-slate-500">{dept._count?.members ?? 0} Mitglieder</span>
                  <button onClick={() => setEditingDept(dept.id)}
                    className="p-1.5 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteDept(dept.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
          {departments.length === 0 && !addingDept && (
            <div className="glass rounded-xl border border-white/6 p-12 text-center">
              <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">Noch keine Kategorien. Erstelle z.B. „Führungsebene" oder „Support".</p>
              <Button size="sm" className="gradient-brand text-white gap-1.5" onClick={() => setAddingDept(true)}>
                <Plus className="w-4 h-4" /> Erste Kategorie
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* ── Members tab ── */
        <div className="space-y-3">
          {addingMember && (
            <MemberForm departments={departments} onSave={d => saveMember(null, d)} onCancel={() => setAddingMember(false)} />
          )}

          <div className="glass rounded-2xl border border-white/6 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/6 text-left">
                  {['Mitglied', 'Position / Anzeige-Rolle', 'Kategorie', 'Berechtigungs-Rolle', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <>
                    {editingMember === m.id ? (
                      <tr key={`edit-${m.id}`}>
                        <td colSpan={6} className="px-4 py-3">
                          <MemberForm
                            initial={m}
                            departments={departments}
                            onSave={d => saveMember(m.id, d)}
                            onCancel={() => setEditingMember(null)}
                          />
                        </td>
                      </tr>
                    ) : (
                      <tr key={m.id} className="border-b border-white/4 hover:bg-white/2 group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-7 h-7">
                              <AvatarFallback className="text-xs font-bold bg-brand/20 text-brand-light">
                                {m.displayName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white font-medium leading-tight">{m.displayName}</p>
                              {m.user && <p className="text-[10px] text-slate-500">{m.user.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-300 text-xs">{m.position}</p>
                          {m.displayRole && <p className="text-slate-500 text-xs">{m.displayRole}</p>}
                        </td>
                        <td className="px-4 py-3">
                          {m.department ? (
                            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: m.department.color + '20', color: m.department.color }}>
                              {m.department.name}
                            </span>
                          ) : <span className="text-slate-600 text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {m.user ? (
                            <Badge variant="outline" className={`text-[10px] border ${ROLE_COLORS[m.user.role]}`}>
                              {ROLE_LABELS[m.user.role]}
                            </Badge>
                          ) : <span className="text-slate-600 text-xs">kein Account</span>}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleActive(m)}>
                            <Badge variant="outline" className={m.isActive ? 'border-green-500/40 text-green-400 text-xs cursor-pointer' : 'border-slate-600 text-slate-500 text-xs cursor-pointer'}>
                              {m.isActive ? 'Aktiv' : 'Inaktiv'}
                            </Badge>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingMember(m.id)}
                              className="p-1.5 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteMember(m.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
            {members.length === 0 && !addingMember && (
              <div className="py-12 text-center">
                <Users2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">Noch keine Teammitglieder.</p>
                <Button size="sm" className="gradient-brand text-white gap-1.5" onClick={() => setAddingMember(true)}>
                  <Plus className="w-4 h-4" /> Erstes Mitglied hinzufügen
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
