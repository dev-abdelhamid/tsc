import { NextRequest, NextResponse } from "next/server"

export const TOKEN_COOKIE = 'access_token'
export const ROLE_COOKIE = 'user_role'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://cv.subcodeco.com/api/v1"

export interface SessionData {
  isLoggedIn: boolean
  accessToken?: string
  locale?: string
  user?: {
    id: number
    name: string
    email: string
    role: "user" | "company" | "admin"
    avatar?: string
  }
}

// Server-side: read token from cookies() [Next.js server component]
export async function getTokenFromCookie(): Promise<string | null> {
  try {
    const { cookies } = await import("next/headers")
    const cs = await cookies()
    return cs.get(TOKEN_COOKIE)?.value || null
  } catch {
    return null
  }
}

export async function getRoleFromCookie(): Promise<string | null> {
  try {
    const { cookies } = await import("next/headers")
    const cs = await cookies()
    return cs.get(ROLE_COOKIE)?.value || null
  } catch {
    return null
  }
}

// Middleware/Route Handler: read from NextRequest
export function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get(TOKEN_COOKIE)?.value || null
}

export function getRoleFromRequest(req: NextRequest): string | null {
  return req.cookies.get(ROLE_COOKIE)?.value || null
}

// After login: set HttpOnly cookie on NextResponse
export function setAuthCookies(res: NextResponse, token: string, role: string): NextResponse {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24 * 7,   // 7 days
    path: '/'
  }
  res.cookies.set(TOKEN_COOKIE, token, options)
  res.cookies.set(ROLE_COOKIE, role, options)
  return res
}

// On logout or 401: clear cookies
export function clearAuthCookies(res: NextResponse): NextResponse {
  res.cookies.set(TOKEN_COOKIE, '', { path: '/', maxAge: 0 })
  res.cookies.set(ROLE_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}

// Compatibility helper: clearRefreshCookie
export function clearRefreshCookie(body: unknown = { success: true }, status = 200) {
  const res = NextResponse.json(body, { status })
  return clearAuthCookies(res)
}

// Compatibility helper: normalizeRole
export function normalizeRole(roleInput: any): "user" | "company" | "admin" {
  if (!roleInput) return "user"
  const r = typeof roleInput === 'string' ? roleInput : (roleInput.role || roleInput.roles?.[0]?.name || roleInput.roles?.[0] || 'user')
  const str = String(r).toLowerCase()
  if (str.includes('admin')) return 'admin'
  if (str.includes('company') || str.includes('employer')) return 'company'
  return 'user'
}

// Compatibility helper: getSession
export async function getSession(): Promise<SessionData> {
  const token = await getTokenFromCookie()
  const role = await getRoleFromCookie()
  
  if (!token) {
    return { isLoggedIn: false }
  }
  
  return {
    isLoggedIn: true,
    accessToken: token,
    user: {
      id: 0,
      name: "",
      email: "",
      role: normalizeRole(role)
    }
  }
}

// Compatibility helper: getCanonicalRole
export async function getCanonicalRole(session: any): Promise<"user" | "company" | "admin"> {
  if (session?.user?.role) return normalizeRole(session.user.role)
  const role = await getRoleFromCookie()
  return normalizeRole(role)
}

// Generic backend caller (server-side only)
export async function callBackend<T>(
  path: string, 
  options: RequestInit, 
  token?: string
): Promise<{data: T|null, error: string|null, status: number}> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Ensure content type is set for JSON bodies
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const requestUrl = `${BACKEND_URL}${normalizedPath}`

  try {
    const res = await fetch(requestUrl, {
      cache: 'no-store',
      ...options,
      headers
    })

    if (res.status === 401) {
      return { data: null, error: 'UNAUTHORIZED', status: 401 }
    }

    if (!res.ok) {
      let message = `Request failed with status ${res.status}`
      try {
        const errJson = await res.json()
        message = errJson.message || message
      } catch {}
      return { data: null, error: message, status: res.status }
    }

    const data = await res.json() as T
    return { data, error: null, status: res.status }
  } catch (err) {
    return { 
      data: null, 
      error: err instanceof Error ? err.message : 'Network error', 
      status: 0 
    }
  }
}

// ── Compat helpers ─────────────────────────────────────────────────────────────

/** Return the correct dashboard root path for a given role */
export function getDashboardPath(role: string): string {
  const r = String(role).toLowerCase()
  if (r === 'admin') return '/dashboard/admin'
  if (r === 'company' || r === 'employer') return '/dashboard/company'
  return '/dashboard/user'
}

/**
 * Alias of normalizeRole for components that import resolveUserRole.
 * Accepts a user object or a raw role string.
 */
export function resolveUserRole(userOrRole: any, fallback?: string): "user" | "company" | "admin" {
  return normalizeRole(userOrRole ?? fallback)
}

/**
 * Server-side sign-out helper (for use in Server Components / Route Handlers).
 * Redirects to the given URL after clearing auth cookies. Since Next.js redirect()
 * throws internally, callers should `await` this only when inside a try/catch or
 * when the redirect is the last action.
 */
export async function signOut(options?: { redirectTo?: string }): Promise<void> {
  const { redirect } = await import('next/navigation')
  redirect(options?.redirectTo || '/sign-in')
}

/**
 * Stub handlers object for legacy `[...nextauth]` route files.
 * The actual auth is handled by /api/auth/login and /api/auth/logout.
 */
export const handlers = {
  GET: async () => new Response(JSON.stringify({ message: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } }),
  POST: async () => new Response(JSON.stringify({ message: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } }),
}
