import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production'

function verifyJWT(token: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return !!(decoded && decoded.isAdmin)
  } catch (error) {
    return false
  }
}

export function middleware(request: NextRequest) {
  // Ochrana admin stránek
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Vyjímka pro login stránku
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Zkontroluj JWT auth cookie
    const authCookie = request.cookies.get('admin-auth')

    if (!authCookie || !verifyJWT(authCookie.value)) {
      // Přesměruj na login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
}