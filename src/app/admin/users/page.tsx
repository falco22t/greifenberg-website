import { prisma } from '@/lib/prisma'
import { Users } from 'lucide-react'
import AdminUsersTable from '@/components/admin/AdminUsersTable'

export const revalidate = 0

async function getUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, username: true, email: true, role: true, isBanned: true, createdAt: true, lastLoginAt: true },
    })
  } catch { return [] }
}

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-light" /> Benutzer
          </h1>
          <p className="text-slate-400 text-sm mt-1">{users.length} Accounts gesamt</p>
        </div>
      </div>
      <AdminUsersTable users={users} />
    </div>
  )
}
