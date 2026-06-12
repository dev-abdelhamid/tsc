// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import { register as registerService } from "@/lib/api/services/auth.service"
import { normalizeRole } from "@/lib/auth-token"
import { ApiError } from "@/lib/api/client"

export async function POST(request: NextRequest) {
  try {
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"

    // Parse JSON/form-data/urlencoded bodies into a plain object
    let body: Record<string, unknown> = {}
    try { body = await request.json() } catch {}
    if (!body || Object.keys(body).length === 0) {
      try {
        const form = await request.formData()
        form.forEach((v, k) => { body[k] = typeof v === "string" ? v : v })
      } catch {}
    }
    if (!body || Object.keys(body).length === 0) {
      try {
        const text = await request.text()
        const params = new URLSearchParams(text)
        params.forEach((v, k) => (body[k] = v))
      } catch {}
    }

    const payload = {
      name: String((body.name as string) || ""),
      email: String((body.email as string) || ""),
      phone: String((body.phone as string) || ""),
      password: String((body.password as string) || ""),
      password_confirmation: String((body.password_confirmation as string) || (body.passwordConfirmation as string) || ""),
      type: (body.type as "user" | "company" | "admin") || "user",
      company_name: (body.company_name as string) || (body.companyName as string) || undefined,
      country_id: body.country_id ? Number(body.country_id) : undefined,
      accept_terms_and_privacy: body.accept_terms_and_privacy === "0" ? false : Boolean(body.accept_terms_and_privacy),
    }

    const { user, tokens } = await registerService(payload as any, locale)
    if (!user) return NextResponse.json({ message: "بيانات المستخدم غير موجودة في الرد" }, { status: 500 })

    const at = ((tokens as any)?.access_token || (tokens as any)?.accessToken || (tokens as any)?.token) as string | undefined
    let fullUser = user
    if (at) {
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://cv.subcodeco.com/api/v1"
        const profileRes = await fetch(`${BACKEND_URL}/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${at}`,
            'Accept-Language': locale,
            'Accept': 'application/json',
          },
          cache: 'no-store'
        })
        if (profileRes.ok) {
          const profileData = await profileRes.json().catch(() => null)
          if (profileData?.data || profileData) {
            fullUser = profileData.data || profileData
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile in register route:", err)
      }
    }

    const canonicalRole = normalizeRole(fullUser)
    const normalizedUser = {
      ...fullUser,
      role: canonicalRole,
    }

    const res = NextResponse.json({ user: normalizedUser, tokens }, { status: 201 })

    // Persist access token as an httpOnly cookie for server-side requests
    try {
      const at = ((tokens as any)?.access_token || (tokens as any)?.accessToken || (tokens as any)?.token) as string | undefined
      if (at) {
        res.cookies.set("access_token", String(at), {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        })
        if (normalizedUser && normalizedUser.role) {
          res.cookies.set("user_role", String(normalizedUser.role), {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          })
        }
      }
    } catch {}

    return res
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof ApiError ? error.message : "حدث خطأ في الخادم"
    const errors = error instanceof ApiError ? error.errors : undefined

    return NextResponse.json({ message, errors }, { status })
  }
}

