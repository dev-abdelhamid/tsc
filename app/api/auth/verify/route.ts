import { NextRequest, NextResponse } from "next/server"
import { verifyEmail } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
    await verifyEmail(email, code, locale as "ar" | "en" | "de")
    return NextResponse.json({ success: true })
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof ApiError ? error.message : "فشل التحقق"
    return NextResponse.json({ message }, { status })
  }
}
