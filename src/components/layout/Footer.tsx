import Link from 'next/link'
import { Shield, ExternalLink } from 'lucide-react'

const footerLinks = {
  'Navigation': [
    { label: 'Startseite', href: '/' },
    { label: 'News', href: '/news' },
    { label: 'Forum', href: '/forum' },
    { label: 'Team', href: '/team' },
  ],
  'Gesetze': [
    { label: 'Strafgesetzbuch', href: '/gesetze/stgb' },
    { label: 'Straßenverkehrsordnung', href: '/gesetze/stvo' },
    { label: 'Polizeigesetz', href: '/gesetze/polg' },
    { label: 'Alle Gesetzbücher', href: '/gesetze' },
  ],
  'Support': [
    { label: 'Guide für Einsteiger', href: '/guides' },
    { label: 'Support-Tickets', href: '/support' },
    { label: 'Regelwerk', href: '/regelwerk' },
    { label: 'Discord', href: 'https://discord.gg/greifenberg', external: true },
  ],
}

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 mt-auto">
      <div className="absolute inset-0 gradient-brand-subtle pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">
                <span className="text-white">Greifenberg</span>
                <span className="gradient-text-brand"> RP</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Authentisches, immersives FiveM Roleplay auf höchstem Niveau.
              Werde Teil unserer Community.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={'external' in link && link.external ? '_blank' : undefined}
                      rel={'external' in link && link.external ? 'noopener noreferrer' : undefined}
                      className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-1.5 group"
                    >
                      {link.label}
                      {'external' in link && link.external && (
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Greifenberg RP. Alle Rechte vorbehalten.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/datenschutz" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Datenschutz
            </Link>
            <Link href="/impressum" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Impressum
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
