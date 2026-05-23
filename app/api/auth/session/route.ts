import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"

export async function GET() {
  const session = await getSession()
  return NextResponse.json({
    isLoggedIn: session.isLoggedIn,
    user: session.user ?? null,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>

    const data = (body["data"] as Record<string, unknown> | undefined) || body

    const user =
      (body["user"] as Record<string, unknown> | undefined) ??
      (data["user"] as Record<string, unknown> | undefined) ??
      (data["id"] ? data : undefined)

    const tokens =
      (body["tokens"] as Record<string, unknown> | undefined) ??
      (data["tokens"] as Record<string, unknown> | undefined) ??
      {
        access_token:
          (data["access_token"] as string | undefined) ??
          (data["token"] as string | undefined) ??
          (data["accessToken"] as string | undefined) ??
          (body["access_token"] as string | undefined) ??
          (body["token"] as string | undefined) ??
          (body["accessToken"] as string | undefined),
        refresh_token:
          (data["refresh_token"] as string | undefined) ??
          (data["refreshToken"] as string | undefined) ??
          (body["refresh_token"] as string | undefined) ??
          (body["refreshToken"] as string | undefined),
        token_type:
          (data["token_type"] as string | undefined) ??
          (data["tokenType"] as string | undefined) ??
          (body["token_type"] as string | undefined) ??
          (body["tokenType"] as string | undefined) ??
          "Bearer",
        expires_in:
          (data["expires_in"] as number | undefined) ??
          (data["expiresIn"] as number | undefined) ??
          (body["expires_in"] as number | undefined) ??
          (body["expiresIn"] as number | undefined) ??
          0,
      }

    if (!user || !tokens?.access_token) {
      return NextResponse.json({ message: "بيانات الجلسة غير كاملة" }, { status: 400 })
    }

    const mapRole = (u: unknown): "user" | "company" | "admin" => {
      const obj = u as Record<string, unknown> | undefined
      const rolesVal = obj?.roles
      if (Array.isArray(rolesVal)) {
        const rolesArr = rolesVal.map((r) => String(r).toLowerCase())
        if (rolesArr.includes("company")) return "company"
        if (rolesArr.includes("admin")) return "admin"
        if (rolesArr.includes("user")) return "user"
      }
      const roleStr = String(obj?.role ?? "").toLowerCase()
      if (roleStr.includes("company")) return "company"
      if (roleStr.includes("admin")) return "admin"
      if (roleStr.includes("user")) return "user"
      return "user"
    }

    const session = await getSession()
    session.user = {
      id: Number(user.id),
      name: String(user.name || ""),
      email: String(user.email || ""),
      role: mapRole(user),
      avatar: user.avatar as string | undefined,
    }
    session.accessToken = tokens.access_token as string
    session.refreshToken = tokens.refresh_token as string | undefined
    session.isLoggedIn = true

    await session.save()

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل إنشاء الجلسة"
    return NextResponse.json({ message }, { status: 500 })
  }
}
