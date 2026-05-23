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

export async function getSession() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
  if (!session.isLoggedIn) {
    session.isLoggedIn = false
  }
  return session
}
