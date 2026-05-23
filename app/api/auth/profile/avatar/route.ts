import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { uploadAvatar, deleteAvatar } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session.accessToken) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })

    const form = await request.formData()
    const file = form.get("avatar") as File | null
    if (!file) return NextResponse.json({ message: "No file" }, { status: 400 })

    const updated = await uploadAvatar(file, session.accessToken, session.locale || "ar")

    const currentUser = session.user ?? {
      id: 0,
      name: "",
      email: "",
      role: "user" as const,
    }

    session.user = {
      ...currentUser,
      avatar: updated.avatar,
    }
    await session.save()

    return NextResponse.json({ data: updated })
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof Error ? error.message : "فشل رفع الصورة"
    return NextResponse.json({ message }, { status })
  }
}

export async function DELETE() {
  try {
    const session = await getSession()
    if (!session.accessToken) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })

    await deleteAvatar(session.accessToken, session.locale || "ar")

    const currentUser = session.user ?? {
      id: 0,
      name: "",
      email: "",
      role: "user" as const,
    }

    session.user = {
      ...currentUser,
      avatar: undefined,
    }
    await session.save()

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 500
    return NextResponse.json({ message: error instanceof Error ? error.message : "فشل حذف الصورة" }, { status })
  }
}
