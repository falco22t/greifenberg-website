import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Newspaper, Plus, Pencil, Eye, EyeOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const revalidate = 0

async function getPosts() {
  try {
    return await prisma.newsPost.findMany({
      orderBy: { createdAt: 'desc' }, take: 50,
      include: { author: { select: { username: true } }, category: true },
    })
  } catch { return [] }
}

export default async function AdminNewsPage() {
  const posts = await getPosts()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-brand-light" /> News
          </h1>
          <p className="text-slate-400 text-sm mt-1">{posts.length} Beiträge</p>
        </div>
        <Link href="/admin/news/neu">
          <Button className="gradient-brand text-white gap-2 font-semibold">
            <Plus className="w-4 h-4" /> Neuer Beitrag
          </Button>
        </Link>
      </div>

      <div className="glass rounded-2xl border border-white/6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6 text-left">
              {['Titel', 'Kategorie', 'Autor', 'Status', 'Datum', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-white font-medium line-clamp-1">{post.title}</span>
                </td>
                <td className="px-4 py-3">
                  {post.category ? (
                    <span className="text-xs px-2 py-0.5 rounded"
                      style={{ backgroundColor: post.category.color + '20', color: post.category.color }}>
                      {post.category.name}
                    </span>
                  ) : <span className="text-slate-600">—</span>}
                </td>
                <td className="px-4 py-3 text-slate-400">{post.author.username}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={post.isPublished ? 'border-green-500/40 text-green-400 text-xs' : 'border-slate-600 text-slate-500 text-xs'}>
                    {post.isPublished ? <><Eye className="w-3 h-3 mr-1" />Veröffentlicht</> : <><EyeOff className="w-3 h-3 mr-1" />Entwurf</>}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {new Date(post.createdAt).toLocaleDateString('de-DE')}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/news/${post.id}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors inline-flex">
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && <div className="py-12 text-center text-slate-500">Noch keine News.</div>}
      </div>
    </div>
  )
}
