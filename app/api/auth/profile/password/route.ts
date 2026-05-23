import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { updatePassword } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session.accessToken) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })

    const body = await request.json()
    const { current_password, new_password, new_password_confirmation } = body
    if (!current_password || !new_password || !new_password_confirmation) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 })
    }

    await updatePassword(current_password, new_password, new_password_confirmation, session.accessToken, session.locale || "ar")
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof ApiError ? error.message : "فشل تغيير كلمة المرور"
    return NextResponse.json({ message }, { status })
  }
}
