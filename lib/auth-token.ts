import { NextRequest, NextResponse } from "next/server"
import { cache } from "react"

export const TOKEN_COOKIE = 'access_token'
export const ROLE_COOKIE = 'user_role'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://cv.subcodeco.com/api/v1"

export interface SessionData {
  isLoggedIn: boolean
  accessToken: string | null
  locale?: string
  role?: "user" | "company" | "admin" | null
  user?: {
    id: number
    name: string
    email: string
    role: "user" | "company" | "admin"
    avatar?: string
    company?: any
    company_profile?: any
    companyProfile?: any
  } | null
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
    // Use 'lax' during development to avoid sameSite blocking when ports
    // differ (dev servers may run on 3000/3001). Keep 'strict' in production.
    sameSite: process.env.NODE_ENV === 'production' ? ('strict' as const) : ('lax' as const),
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
export function normalizeRole(roleInput: unknown): "user" | "company" | "admin" {
  if (!roleInput) return "user"

  // If caller passed a simple string role, handle quickly
  if (typeof roleInput === 'string') {
    const s = roleInput.toLowerCase()
    if (s.includes('admin')) return 'admin'
    if (s.includes('company') || s.includes('employer')) return 'company'
    return 'user'
  }

  // If an object was passed, prefer explicit role fields instead of
  // stringifying the whole object (which can contain unrelated values
  // like company names that falsely match).
  try {
    const obj = roleInput as Record<string, unknown>
    const candidates: string[] = []

    if (obj == null || typeof obj !== 'object') return 'user'

    if (typeof obj.role === 'string') candidates.push(obj.role)
    if (typeof obj.type === 'string') candidates.push(obj.type)
    if (typeof obj.name === 'string') candidates.push(obj.name)

    if (obj.roles) {
      if (Array.isArray(obj.roles)) {
        for (const r of obj.roles) {
          if (typeof r === 'string') candidates.push(r)
          else if (r && typeof r.name === 'string') candidates.push(r.name)
        }
      } else if (typeof obj.roles === 'string') {
        candidates.push(obj.roles)
      } else if (typeof obj.roles === 'object' && obj.roles !== null) {
        const rolesObj = obj.roles as Record<string, unknown>
        if (typeof rolesObj.name === 'string') candidates.push(rolesObj.name)
      }
    }

    for (const c of candidates) {
      const s = String(c || '').toLowerCase()
      if (s.includes('admin')) return 'admin'
      if (s.includes('company') || s.includes('employer')) return 'company'
    }
  } catch {
    // ignore and fallthrough to user
  }

  return 'user'
}

// Compatibility helper: getSession
export const getSession = cache(async (): Promise<SessionData> => {
  const token = await getTokenFromCookie()
  // const role intentionally not read here; server will attempt an
  // upstream profile fetch when a token exists and fall back to
  // returning a minimal session if the profile call fails.
  
  if (!token) {
    return { isLoggedIn: false, accessToken: null, user: null, role: null }
  }
  // Try to fetch a server-side profile for richer SSR state. If the
  // upstream profile call fails (network / 401 / etc.) return a minimal
  // session object with `isLoggedIn: true` and the `accessToken` so
  // server-side callers can still call the backend directly. We avoid
  // returning a stub user with `id: 0` since `0` is falsey and causes
  // downstream UI mismatches during hydration.
  try {
    // Propagate the request locale when calling the upstream API so the
    // backend can validate/resolve localized resources correctly.
    let acceptLang = 'ar'
    try {
      const { headers } = await import('next/headers')
      const h = await headers()
      acceptLang = h.get('accept-language')?.split(',')[0] || acceptLang
    } catch {}

    const { data: profile, error, status } = await callBackend<Record<string, unknown>>('/auth/profile', { method: 'GET', headers: { 'Accept-Language': acceptLang } }, token)
    if (!error && profile) {
        const userRaw = (profile && (profile.data || profile)) || null
        if (userRaw) {
          const ur = userRaw as unknown as { id?: number; name?: string; username?: string; email?: string; avatar?: string; avatar_url?: string; role?: string }

          if (typeof ur.id === 'number' && !Number.isNaN(ur.id) && ur.id > 0) {
            const r = normalizeRole(ur)
            const cp = (ur as any).companyProfile || (ur as any).company_profile || (ur as any).company
            const companyLogo = cp ? (cp.logoUrl || cp.logo || cp.logo_url || cp.avatar || cp.avatar_url) : undefined
            const resolvedAvatar = (r === 'company' && companyLogo) ? companyLogo : (ur.avatar || ur.avatar_url || undefined)

            return {
              isLoggedIn: true,
              accessToken: token,
              role: r,
              user: {
                id: ur.id,
                name: ur.name || ur.username || "",
                email: ur.email || "",
                role: r,
                avatar: resolvedAvatar,
                company: (ur as any).company || undefined,
                company_profile: (ur as any).company_profile || undefined,
                companyProfile: (ur as any).companyProfile || undefined,
              }
            }
          }
        }
    }
  } catch {
    // best-effort; fall back below
  }

  // If we could not validate the token by fetching the upstream profile
  // treat the session as unauthenticated. Do NOT return a stub user.
  return { isLoggedIn: false, accessToken: null, user: null, role: null }
})

// Compatibility helper: getCanonicalRole
export async function getCanonicalRole(session: SessionData | undefined): Promise<"user" | "company" | "admin"> {
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
export function resolveUserRole(userOrRole: unknown, fallback?: string): "user" | "company" | "admin" {
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
