import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { logout as logoutApi } from "@/lib/api/services/auth.service"

export async function POST() {
  try {
    const session = await getSession()
    const token = session.accessToken

    if (token) {
      try {
        await logoutApi(token)
      } catch (err) {
        console.warn(err)
        // continue local logout even if API fails
      }
    }

    session.destroy()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Logout API] Error:", error)
    return NextResponse.json({ message: "Failed to logout" }, { status: 500 })
  }
}
