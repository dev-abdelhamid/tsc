import { NextRequest, NextResponse } from "next/server"
import { resetPassword } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
    await resetPassword(
      {
        token: body.token,
        password: body.password,
        password_confirmation: body.password_confirmation,
      },
      locale as "ar" | "en" | "de"
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof ApiError ? error.message : "فشل إعادة التعيين"
    return NextResponse.json({ message }, { status })
  }
}
