import { NextResponse } from "next/server"
import { logout } from "@/lib/session"

export async function POST() {
  try {
    await logout()
    return NextResponse.json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    console.error("[Logout API] Error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to logout" },
      { status: 500 }
    )
  }
}
