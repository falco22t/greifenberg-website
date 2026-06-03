import Link from 'next/link'
import { ArrowRight, Calendar, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Placeholder — wird später durch Datenbank-Daten ersetzt
const placeholderNews = [
  {
    id: 1,
    title: 'Server-Update v2.5 — Neue Fahrzeuge & Jobs',
    excerpt: 'Mit dem neuesten Update bringen wir über 30 neue Fahrzeuge, drei neue Jobs und zahlreiche Bug-Fixes.',
    category: 'Update',
    categoryColor: 'bg-brand/20 text-brand-light border-brand/30',
    date: '2. Juni 2026',
    slug: 'update-v2-5',
  },
  {
    id: 2,
    title: 'Neuer Fraktions-Event: Die Große Razzia',
    excerpt: 'Am kommenden Wochenende findet ein serverweiter Event statt, bei dem Polizei und Kriminelle aufeinandertreffen.',
    category: 'Event',
    categoryColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    date: '1. Juni 2026',
    slug: 'event-grosse-razzia',
  },
  {
    id: 3,
    title: 'Neues Teammitglied: Willkommen im Team!',
    excerpt: 'Wir freuen uns, unser Team mit einem neuen Senior-Administrator zu verstärken.',
    category: 'Team',
    categoryColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    date: '30. Mai 2026',
    slug: 'neues-teammitglied',
  },
]

export default function NewsPreview() {
  return (
    <section className="py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-brand-light font-semibold text-sm uppercase tracking-widest mb-3">
              Aktuelles
            </p>
            <h2 className="text-4xl font-black text-white tracking-tight">Neuigkeiten</h2>
          </div>
          <Link
            href="/news"
            className="hidden sm:flex items-center gap-2 text-brand-light hover:text-white text-sm font-medium transition-colors group"
          >
            Alle News
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {placeholderNews.map((post) => (
            <Link
              key={post.id}
              href={`/news/${post.slug}`}
              className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-brand/25 transition-all duration-300 group"
            >
              {/* Thumbnail Placeholder */}
              <div className="h-44 gradient-brand-subtle border-b border-white/5 flex items-center justify-center">
                <Tag className="w-8 h-8 text-brand/40" />
              </div>

              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-0.5 ${post.categoryColor}`}
                  >
                    {post.category}
                  </Badge>
                  <span className="text-slate-500 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                </div>
                <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-brand-light transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="sm:hidden mt-8 text-center">
          <Link href="/news" className="text-brand-light text-sm font-medium hover:text-white transition-colors">
            Alle News anzeigen →
          </Link>
        </div>
      </div>
    </section>
  )
}
