import { NextRequest, NextResponse } from "next/server"
import { setAuthCookies, callBackend, normalizeRole, getTokenFromCookie } from "@/lib/auth-token"

export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookie()
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
    const { data: profile, error, status } = await callBackend<any>('/auth/profile', {
      method: 'GET',
      headers: { 'Accept-Language': locale }
    }, token)

    if (error || !profile) {
      return NextResponse.json({ message: error || "Invalid token" }, { status: status || 401 })
    }

    const user = profile.data || profile
    return NextResponse.json({ success: true, user })
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unexpected error in session GET endpoint" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const token = body?.data?.tokens?.access_token || body?.tokens?.access_token || body?.access_token || body?.accessToken

    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 400 })
    }

    // Call Laravel backend profile API using the provided token to verify it and fetch the user's role
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
    const { data: profile, error, status } = await callBackend<any>('/auth/profile', {
      method: 'GET',
      headers: { 'Accept-Language': locale }
    }, token)

    if (error || !profile) {
      return NextResponse.json({ message: error || "Invalid token" }, { status: status || 401 })
    }

    // Extract and normalize the user's role
    const user = profile.data || profile
    let role = 'user'
    if (user.roles && user.roles.length > 0) {
      const firstRole = user.roles[0]
      role = typeof firstRole === 'object' ? (firstRole.name || firstRole.role) : firstRole
    } else if (user.role) {
      role = user.role
    }

    const normalized = normalizeRole(role)

    // Set the HttpOnly cookies for access_token and user_role
    const response = NextResponse.json({ success: true, user, role: normalized })
    setAuthCookies(response, token, normalized)

    return response
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unexpected error in session endpoint" },
      { status: 500 }
    )
  }
}
