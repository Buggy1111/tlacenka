import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateAuthInput } from '@/lib/validation'
import { authenticateAdmin, generateJWT } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate and sanitize input
    const validation = validateAuthInput(body)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Invalid input data',
          details: validation.errors
        },
        { status: 400 }
      )
    }

    const { username, password } = validation.sanitizedData!

    // Authenticate using the stronger auth system
    const isAuthenticated = await authenticateAdmin(username, password)

    if (isAuthenticated) {
      // Generate secure JWT token
      const authToken = await generateJWT(username)

      // Set secure cookie
      const response = NextResponse.json({ success: true })
      response.cookies.set('admin-auth', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 8, // 8 hours
        path: '/'
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