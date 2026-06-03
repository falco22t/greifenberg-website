import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    await requireAuth('ADMIN')

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalUsers, newUsersToday, newUsersWeek,
      totalThreads, totalPosts,
      openTickets, totalNews,
      recentLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.forumThread.count(),
      prisma.forumPost.count({ where: { deletedAt: null } }),
      prisma.ticket.count({ where: { status: { not: 'CLOSED' } } }),
      prisma.newsPost.count({ where: { isPublished: true } }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { username: true } } },
      }),
    ])

    return NextResponse.json({
      stats: { totalUsers, newUsersToday, newUsersWeek, totalThreads, totalPosts, openTickets, totalNews },
      recentLogs,
    })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 })
  }
}
