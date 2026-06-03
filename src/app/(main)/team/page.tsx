import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ChevronRight, Shield } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ROLE_COLORS, ROLE_LABELS } from '@/types/forum'

export const metadata: Metadata = { title: 'Team' }
export const revalidate = 0

async function getData() {
  try {
    const [departments, soloMembers] = await Promise.all([
      prisma.department.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
          members: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: { user: { select: { role: true } } },
          },
        },
      }),
      prisma.teamMember.findMany({
        where: { isActive: true, departmentId: null },
        orderBy: { sortOrder: 'asc' },
        include: { user: { select: { role: true } } },
      }),
    ])
    return {
      departments: departments.filter((d) => d.members.length > 0),
      soloMembers,
    }
  } catch { return { departments: [], soloMembers: [] } }
}

export default async function TeamPage() {
  const { departments, soloMembers } = await getData()
  const hasContent = departments.length > 0 || soloMembers.length > 0

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center gap-2 text-sm text-slate-500 justify-center mb-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">Startseite</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-300">Team</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">Unser Team</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Wir sind eine Gruppe leidenschaftlicher Menschen, die Greifenberg RP am Leben halten.
          </p>
        </div>

        {!hasContent ? (
          <div className="glass rounded-2xl border border-white/6 p-16 text-center">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Das Team wird gerade konfiguriert.</p>
          </div>
        ) : (
          <div className="space-y-14">
            {departments.map((dept) => (
              <div key={dept.id}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 rounded-full" style={{ backgroundColor: dept.color }} />
                  <h2 className="text-xl font-black text-white">{dept.name}</h2>
                  <span className="text-slate-500 text-sm">({dept.members.length})</span>
                </div>
                <MemberGrid members={dept.members} color={dept.color} />
              </div>
            ))}

            {soloMembers.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 rounded-full bg-slate-500" />
                  <h2 className="text-xl font-black text-white">Weitere Mitglieder</h2>
                  <span className="text-slate-500 text-sm">({soloMembers.length})</span>
                </div>
                <MemberGrid members={soloMembers} color="#64748b" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

type Member = {
  id: number
  displayName: string
  position: string
  displayRole: string | null
  bio: string | null
  avatarUrl: string | null
  discordTag: string | null
  user: { role: import('@prisma/client').UserRole } | null
}

function MemberGrid({ members, color }: { members: Member[]; color: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => (
        <div key={member.id} className="glass rounded-2xl border border-white/6 p-5 hover:border-white/12 transition-all group">
          <div className="flex items-center gap-4 mb-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={member.avatarUrl ?? undefined} />
              <AvatarFallback className="font-bold text-sm"
                style={{ backgroundColor: color + '20', color }}>
                {member.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-white">{member.displayName}</p>
              <p className="text-xs text-slate-400">{member.displayRole ?? member.position}</p>
            </div>
          </div>
          {member.bio && <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-3">{member.bio}</p>}
          <div className="flex items-center justify-between">
            {member.user && (
              <Badge variant="outline" className={`text-[10px] border ${ROLE_COLORS[member.user.role]}`}>
                {ROLE_LABELS[member.user.role]}
              </Badge>
            )}
            {member.discordTag && (
              <span className="text-xs text-slate-500">{member.discordTag}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
