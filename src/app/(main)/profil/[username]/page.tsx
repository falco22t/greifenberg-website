import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ChevronRight, Calendar, MessageSquare, Briefcase, DollarSign, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ROLE_LABELS, ROLE_COLORS } from '@/types/forum'
import { getESXUser, getESXCharacter } from '@/lib/esx'
import { formatDate } from '@/lib/dateUtils'

type Props = { params: Promise<{ username: string }> }
export const revalidate = 60

async function getData(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: { select: { forumPosts: true, forumThreads: true } },
      teamMember: { include: { department: true } },
    },
  })
  if (!user) return null

  const recentPosts = await prisma.forumPost.findMany({
    where: { authorId: user.id, deletedAt: null, isFirstPost: false },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { thread: { include: { category: { select: { name: true, slug: true } } } } },
  })

  return { user, recentPosts }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return { title: `Profil: ${username}` }
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const [data, session] = await Promise.all([getData(username), getSession()])
  if (!data) notFound()

  const { user, recentPosts } = data
  const isOwn = session?.userId === user.id
  const isAdmin = session?.role === 'ADMIN' || session?.role === 'OWNER'

  // ESX-Daten (nur wenn Admin oder eigenes Profil)
  let esxData: { money?: number; bank?: number; job?: string; firstname?: string; lastname?: string } | null = null
  if ((isOwn || isAdmin) && user.discordId) {
    const [esxUser, esxChar] = await Promise.all([
      getESXUser(`discord:${user.discordId}`),
      getESXCharacter(`discord:${user.discordId}`),
    ])
    if (esxUser || esxChar) {
      esxData = {
        money: esxUser?.money,
        bank: esxUser?.bank,
        job: esxUser?.job,
        firstname: esxChar?.firstname,
        lastname: esxChar?.lastname,
      }
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">Startseite</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300">{user.username}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass rounded-2xl border border-white/6 p-6 text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-brand text-white text-2xl font-black">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-xl font-black text-white mb-2">{user.username}</h1>
              <Badge variant="outline" className={`border ${ROLE_COLORS[user.role]} mb-4`}>
                {ROLE_LABELS[user.role]}
              </Badge>

              {user.teamMember && (
                <div className="mt-3 pt-3 border-t border-white/6">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Team</p>
                  <p className="text-white text-sm font-semibold">{user.teamMember.position}</p>
                  {user.teamMember.department && (
                    <p className="text-xs mt-0.5" style={{ color: user.teamMember.department.color }}>
                      {user.teamMember.department.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="glass rounded-2xl border border-white/6 p-5 space-y-3">
              <h2 className="text-sm font-bold text-white">Statistiken</h2>
              {[
                { icon: Calendar, label: 'Dabei seit', value: new Date(user.createdAt).toLocaleDateString('de-DE') },
                { icon: MessageSquare, label: 'Beiträge', value: user._count.forumPosts.toString() },
                { icon: MessageSquare, label: 'Threads', value: user._count.forumThreads.toString() },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Icon className="w-3.5 h-3.5 text-slate-600" />{label}
                  </span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
            </div>

            {/* ESX Data (nur für Inhaber / Admin) */}
            {esxData && (
              <div className="glass rounded-2xl border border-brand/20 p-5 space-y-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-brand-light" />
                  Charakter-Daten
                  <Badge variant="outline" className="text-[10px] border-brand/30 text-brand-light">ESX</Badge>
                </h2>
                {esxData.firstname && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Name</span>
                    <span className="text-white font-medium">{esxData.firstname} {esxData.lastname}</span>
                  </div>
                )}
                {esxData.job && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-400"><Briefcase className="w-3.5 h-3.5 text-slate-600" />Job</span>
                    <span className="text-white font-medium capitalize">{esxData.job}</span>
                  </div>
                )}
                {esxData.money !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-400"><DollarSign className="w-3.5 h-3.5 text-slate-600" />Bargeld</span>
                    <span className="text-green-400 font-medium">{esxData.money.toLocaleString('de-DE')} $</span>
                  </div>
                )}
                {esxData.bank !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-400"><DollarSign className="w-3.5 h-3.5 text-slate-600" />Bank</span>
                    <span className="text-green-400 font-medium">{esxData.bank.toLocaleString('de-DE')} $</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl border border-white/6 p-6">
              <h2 className="font-bold text-white mb-5 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-light" /> Letzte Forum-Beiträge
              </h2>
              {recentPosts.length === 0 ? (
                <p className="text-slate-500 text-sm">Noch keine Beiträge.</p>
              ) : (
                <div className="space-y-3">
                  {recentPosts.map((post) => (
                    <Link key={post.id} href={`/forum/${post.thread.category.slug}/${post.thread.slug}#post-${post.id}`}
                      className="block p-4 rounded-xl hover:bg-white/3 border border-white/4 hover:border-white/8 transition-all group">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors truncate">
                          {post.thread.title}
                        </p>
                        <span className="text-xs text-slate-600 flex-shrink-0">{formatDate(post.createdAt.toISOString())}</span>
                      </div>
                      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{post.content.replace(/<[^>]*>/g, '').slice(0, 150)}</p>
                      <span className="text-xs text-brand-light mt-1 inline-block">{post.thread.category.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
