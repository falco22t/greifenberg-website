import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Routen die nur für eingeloggte User zugänglich sind
const PROTECTED_ROUTES = ['/profil']

// Routen die nur für Admins zugänglich sind
const ADMIN_ROUTES = ['/admin']

// Routen die nur für ausgeloggte User zugänglich sind (kein Redirect wenn eingeloggt)
const AUTH_ROUTES = ['/auth/login', '/auth/register']

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('grp_session')?.value
  const payload = token ? verifyToken(token) : null

  // Admin-Schutz
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!payload) {
      return NextResponse.redirect(new URL('/auth/login?redirect=' + pathname, req.url))
    }
    if (payload.role !== 'ADMIN' && payload.role !== 'OWNER') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Nutzer-Schutz
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!payload) {
      return NextResponse.redirect(new URL('/auth/login?redirect=' + pathname, req.url))
    }
  }

  // Auth-Seiten umleiten wenn bereits eingeloggt
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (payload) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profil/:path*',
    '/auth/login',
    '/auth/register',
  ],
}
