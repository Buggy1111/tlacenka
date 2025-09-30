import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'

export interface AdminPayload {
  username: string
  isAdmin: boolean
  iat: number
  exp: number
}

// Hash password (for future use when storing hashed passwords)
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

// Generate secure JWT token
export function generateJWT(username: string): string {
  const payload = {
    username,
    isAdmin: true,
    iat: Math.floor(Date.now() / 1000)
  }

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '8h'
  })
}

// Verify JWT token
export function verifyJWT(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload
    return decoded
  } catch (error) {
    return null
  }
}

// Authenticate admin credentials
export async function authenticateAdmin(username: string, password: string): Promise<boolean> {
  // For now, use simple comparison - in production, compare against hashed password
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

export function verifyAdminAuth(request: NextRequest): boolean {
  const authCookie = request.cookies.get('admin-auth')

  if (!authCookie) {
    return false
  }

  // Verify JWT token
  const payload = verifyJWT(authCookie.value)
  return !!(payload && payload.isAdmin)
}

export function verifyAdminAuthFromCookies(): boolean {
  const cookieStore = cookies()
  const authCookie = cookieStore.get('admin-auth')

  if (!authCookie) {
    return false
  }

  // Verify JWT token
  const payload = verifyJWT(authCookie.value)
  return !!(payload && payload.isAdmin)
}

export function createUnauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: 'Unauthorized access - admin authentication required' }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}