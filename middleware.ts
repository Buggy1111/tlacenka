import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Ochrana admin stránek
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Vyjímka pro login stránku
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Zkontroluj auth cookie
    const authCookie = request.cookies.get('admin-auth')

    if (!authCookie || !authCookie.value.startsWith('admin-authenticated-')) {
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