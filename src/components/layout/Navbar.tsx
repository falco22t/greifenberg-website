'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, ChevronDown, Users, BookOpen, Newspaper,
  HelpCircle, BookMarked, MessageSquare, Shield, LogIn,
  LogOut, User, LayoutDashboard, Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useAuth, hasRole } from '@/contexts/AuthContext'

interface LawBook { name: string; slug: string }

function buildNavLinks(lawBooks: LawBook[]) {
  const lawChildren = [
    ...lawBooks.map((b) => ({ label: b.name, href: `/gesetze/${b.slug}` })),
    { label: 'Alle Gesetzbücher →', href: '/gesetze' },
  ]

  return [
    { label: 'News',    href: '/news',    icon: Newspaper },
    { label: 'Forum',   href: '/forum',   icon: MessageSquare },
    { label: 'Gesetze', href: '/gesetze', icon: BookOpen, children: lawChildren.length > 1 ? lawChildren : undefined },
    { label: 'Regelwerk', href: '/regelwerk', icon: BookOpen },
    { label: 'Team',    href: '/team',    icon: Users },
    { label: 'Guide',   href: '/guides',  icon: BookMarked },
    { label: 'Support', href: '/support', icon: HelpCircle },
  ]
}

export default function Navbar({ lawBooks = [] }: { lawBooks?: LawBook[] }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const navLinks = buildNavLinks(lawBooks)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setOpenDropdown(null)
  }, [pathname])

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled ? 'glass border-b border-white/5 py-3' : 'bg-transparent py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg gradient-brand glow-brand-sm flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">
                <span className="text-white">Greifenberg</span>
                <span className="gradient-text-brand"> RP</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(link.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      className={cn(
                        'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                        'text-slate-300 hover:text-white hover:bg-white/5',
                        pathname.startsWith(link.href) && 'text-white bg-white/5'
                      )}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 transition-transform duration-200',
                          openDropdown === link.label && 'rotate-180'
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {openDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-2 w-56 glass rounded-xl border border-white/8 overflow-hidden shadow-xl"
                        >
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      'text-slate-300 hover:text-white hover:bg-white/5',
                      pathname === link.href && 'text-white bg-white/5'
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                )
              )}
            </div>

            {/* Auth Area */}
            <div className="hidden lg:flex items-center gap-3">
              {loading ? (
                <div className="w-24 h-9 rounded-lg bg-white/5 animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors outline-none"
                  >
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={user.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-brand text-white text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-slate-200">{user.username}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 glass border-white/8 text-slate-200"
                  >
                    <DropdownMenuItem
                      onClick={() => router.push(`/profil/${user.username}`)}
                      className="gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4" /> Mein Profil
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/support')}
                      className="gap-2 cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4" /> Meine Tickets
                    </DropdownMenuItem>
                    {hasRole(user.role, 'ADMIN') && (
                      <>
                        <DropdownMenuSeparator className="bg-white/8" />
                        <DropdownMenuItem
                          onClick={() => router.push('/admin')}
                          className="gap-2 cursor-pointer text-brand-light"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Admin-Panel
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-white/8" />
                    <DropdownMenuItem
                      onClick={() => router.push('/profil/einstellungen')}
                      className="gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4" /> Einstellungen
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={logout}
                      className="gap-2 cursor-pointer text-red-400"
                    >
                      <LogOut className="w-4 h-4" /> Abmelden
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/5 gap-2">
                      <LogIn className="w-4 h-4" /> Anmelden
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" className="gradient-brand hover:opacity-90 text-white glow-brand-sm gap-2 font-semibold">
                      Registrieren
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 lg:hidden glass flex flex-col pt-20"
          >
            <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all',
                      'text-slate-300 hover:text-white hover:bg-white/5',
                      pathname === link.href && 'text-white bg-white/5'
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="ml-12 mt-1 space-y-0.5">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            <div className="px-6 py-6 border-t border-white/5">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-brand text-white text-xs font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium text-sm">{user.username}</p>
                      <p className="text-slate-500 text-xs">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" /> Abmelden
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full border-white/10 text-slate-300 hover:text-white">
                      Anmelden
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="w-full gradient-brand text-white font-semibold">
                      Registrieren
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
