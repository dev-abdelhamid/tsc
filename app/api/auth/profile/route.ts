import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getProfile, updateProfile } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"

export async function GET() {
  try {
    const session = await getSession()
    if (!session.accessToken) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })

    const profile = await getProfile(session.accessToken, session.locale || "ar")
    return NextResponse.json({ data: profile })
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof Error ? error.message : "فشل جلب الملف الشخصي"
    return NextResponse.json({ message }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session.accessToken) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })

    const contentType = request.headers.get("content-type") || ""
    let body: Record<string, unknown> = {}

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      formData.forEach((value, key) => {
        if (value instanceof File) {
          if (value.size > 0 && value.name) {
            body[key] = value
          }
        } else {
          body[key] = value
        }
      })
    } else {
      body = await request.json()
    }

    const updated = await updateProfile(body, session.accessToken, session.locale || "ar")

    const currentUser = session.user ?? {
      id: 0,
      name: "",
      email: "",
      role: "user" as const,
    }

    session.user = {
      ...currentUser,
      name: updated.name,
      email: updated.email,
      avatar: updated.avatar,
    }
    await session.save()

    return NextResponse.json({ data: updated })
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof Error ? error.message : "فشل تحديث الملف الشخصي"
    return NextResponse.json({ message }, { status })
  }
}
