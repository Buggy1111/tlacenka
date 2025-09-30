import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'secure-jwt-secret-key-change-in-production-very-long-and-random-123456789'
const secret = new TextEncoder().encode(JWT_SECRET)

async function verifyJWT(token: string): Promise<boolean> {
  try {
    console.log('Middleware: Verifying token:', token.substring(0, 20) + '...')
    const { payload } = await jwtVerify(token, secret)
    console.log('Middleware: Token decoded:', { username: payload.username, isAdmin: payload.isAdmin })
    return !!(payload && payload.isAdmin)
  } catch (error) {
    console.log('Middleware: JWT verification failed:', error instanceof Error ? error.message : String(error))
    return false
  }
}

export async function middleware(request: NextRequest) {
  // Ochrana admin stránek
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('Middleware: Admin path accessed:', request.nextUrl.pathname)

    // Vyjímka pro login stránku
    if (request.nextUrl.pathname === '/admin/login') {
      console.log('Middleware: Login page, allowing access')
      return NextResponse.next()
    }

    // Zkontroluj JWT auth cookie
    const authCookie = request.cookies.get('admin-auth')
    console.log('Middleware: Cookie found:', !!authCookie)

    if (!authCookie || !(await verifyJWT(authCookie.value))) {
      console.log('Middleware: No valid auth, redirecting to login')
      // Přesměruj na login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    console.log('Middleware: Auth valid, allowing access')
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
}