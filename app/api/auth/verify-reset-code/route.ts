import { NextRequest, NextResponse } from "next/server"
import { verifyResetCode } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
    const data = await verifyResetCode(email, code, locale as "ar" | "en" | "de")
    return NextResponse.json(data)
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof ApiError ? error.message : "رمز غير صحيح"
    return NextResponse.json({ message }, { status })
  }
}
