// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { refreshToken as refreshTokenService } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.refreshToken) {
      return NextResponse.json(
        { message: "لا يوجد رمز تحديث" },
        { status: 401 }
      )
    }

    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
    const tokens = await refreshTokenService(session.refreshToken, locale)

    session.accessToken = tokens.access_token
    session.refreshToken = tokens.refresh_token
    await session.save()

    return NextResponse.json({ tokens }, { status: 200 })
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 500
    return NextResponse.json(
      { message: "فشل تحديث الجلسة" },
      { status }
    )
  }
}
