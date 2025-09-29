import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Simple admin credentials - v produkci by bylo hašované
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Vytvoř simple auth token
      const authToken = 'admin-authenticated-' + Date.now()

      // Nastav cookie
      const response = NextResponse.json({ success: true })
      response.cookies.set('admin-auth', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 8 // 8 hodin
      })

      return response
    } else {
      return NextResponse.json(
        { error: 'Nesprávné přihlašovací údaje' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

// Logout endpoint
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin-auth')
  return response
}