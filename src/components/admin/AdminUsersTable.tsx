'use client'

import { useState } from 'react'
import { Search, Shield, Ban, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ROLE_LABELS, ROLE_COLORS } from '@/types/forum'
import { formatDate } from '@/lib/dateUtils'
import type { UserRole } from '@prisma/client'

interface User {
  id: number; username: string; email: string; role: UserRole
  isBanned: boolean; createdAt: Date; lastLoginAt: Date | null
}

const ROLES: UserRole[] = ['GUEST', 'USER', 'MOD', 'ADMIN', 'OWNER']

export default function AdminUsersTable({ users: initial }: { users: User[] }) {
  const [users, setUsers] = useState(initial)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<number | null>(null)

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const updateUser = async (id: number, data: Partial<{ role: UserRole; isBanned: boolean; banReason: string }>) => {
    setLoading(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      if (res.ok) {
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...data } : u))
      }
    } finally { setLoading(null) }
  }

  const toggleBan = async (user: User) => {
    if (!user.isBanned) {
      const reason = prompt('Grund für die Sperre (optional):') ?? ''
      await updateUser(user.id, { isBanned: true, banReason: reason })
    } else {
      await updateUser(user.id, { isBanned: false, banReason: '' })
    }
  }

  return (
    <div className="glass rounded-2xl border border-white/6 overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-white/6">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suche nach Name oder E-Mail…"
            className="pl-9 bg-surface-2 border-white/8 text-white h-9 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6 text-left">
              {['Benutzer', 'E-Mail', 'Rolle', 'Status', 'Registriert', 'Letzter Login', 'Aktionen'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                {/* User */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="bg-brand/20 text-brand-light text-xs font-bold">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white font-medium">{user.username}</span>
                  </div>
                </td>
                {/* Email */}
                <td className="px-4 py-3 text-slate-400">{user.email}</td>
                {/* Role */}
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    disabled={loading === user.id}
                    onChange={(e) => updateUser(user.id, { role: e.target.value as UserRole })}
                    className="bg-surface-3 border border-white/8 text-sm rounded-lg px-2 py-1 text-white focus:outline-none focus:border-brand/50 disabled:opacity-50"
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </td>
                {/* Status */}
                <td className="px-4 py-3">
                  <Badge variant="outline" className={user.isBanned ? 'border-red-500/40 text-red-400 text-xs' : 'border-green-500/40 text-green-400 text-xs'}>
                    {user.isBanned ? 'Gesperrt' : 'Aktiv'}
                  </Badge>
                </td>
                {/* Created */}
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(user.createdAt).toLocaleDateString('de-DE')}</td>
                {/* Last Login */}
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('de-DE') : '—'}
                </td>
                {/* Actions */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleBan(user)}
                    disabled={loading === user.id}
                    className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${user.isBanned ? 'text-green-400 hover:bg-green-500/10' : 'text-red-400 hover:bg-red-500/10'}`}
                    title={user.isBanned ? 'Sperre aufheben' : 'Sperren'}
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-500">Keine Benutzer gefunden.</div>
        )}
      </div>
    </div>
  )
}
