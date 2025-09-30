import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

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
export async function generateJWT(username: string): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)

  const jwt = await new SignJWT({
    username,
    isAdmin: true,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret)

  return jwt
}

// Verify JWT token
export async function verifyJWT(token: string): Promise<AdminPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as AdminPayload
  } catch (error) {
    return null
  }
}

// Authenticate admin credentials
export async function authenticateAdmin(username: string, password: string): Promise<boolean> {
  // For now, use simple comparison - in production, compare against hashed password
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

export async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  const authCookie = request.cookies.get('admin-auth')

  if (!authCookie) {
    return false
  }

  // Verify JWT token
  const payload = await verifyJWT(authCookie.value)
  return !!(payload && payload.isAdmin)
}

export async function verifyAdminAuthFromCookies(): Promise<boolean> {
  const cookieStore = cookies()
  const authCookie = cookieStore.get('admin-auth')

  if (!authCookie) {
    return false
  }

  // Verify JWT token
  const payload = await verifyJWT(authCookie.value)
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