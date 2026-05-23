import { NextRequest, NextResponse } from "next/server"
import { forgotPassword } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
    await forgotPassword(email, locale as "ar" | "en" | "de")
    return NextResponse.json({ success: true })
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof ApiError ? error.message : "حدث خطأ"
    return NextResponse.json({ message }, { status })
  }
}
