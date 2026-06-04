// lib/session.ts
import { getIronSession, type SessionOptions } from "iron-session"
import { cookies } from "next/headers"

export interface SessionData {
  user?: {
    id: number
    name: string
    email: string
    role: "user" | "company" | "admin"
    avatar?: string
  }
  accessToken?: string
  refreshToken?: string
  locale?: string
  isLoggedIn: boolean
}

export const sessionOptions: SessionOptions = {
  password: process.env.AUTH_SECRET || "default-secret-key-min-32-characters-long!!!!",
  cookieName: "talent_seeker_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}

import { refreshToken as refreshTokenService } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"

export async function getSession() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
  if (!session.isLoggedIn) {
    session.isLoggedIn = false
  }
  return session
}

export async function withTokenRefresh<T>(
  session: any,
  locale: string,
  apiCall: (token: string) => Promise<T>
): Promise<T> {
  if (!session || !session.accessToken) {
    throw new ApiError(401, "No access token in session")
  }
  try {
    return await apiCall(session.accessToken)
  } catch (err: any) {
    if (err instanceof ApiError && err.status === 401 && session.refreshToken) {
      try {
        console.log("[Auth Session] Token expired. Attempting token refresh...")
        const tokens = await refreshTokenService(session.refreshToken, locale)
        
        session.accessToken = tokens.access_token
        session.refreshToken = tokens.refresh_token
        await session.save()
        
        console.log("[Auth Session] Token refreshed and session saved. Retrying API call...")
        return await apiCall(session.accessToken)
      } catch (refreshErr) {
        console.warn("[Auth Session] Failed to refresh token, forcing sign-out:", refreshErr)
        throw err // Throw the original 401 to force logout / redirect
      }
    }
    throw err
  }
}
