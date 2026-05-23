import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { markAsRead } from "@/lib/api/services/notifications.service"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const token = session.accessToken
    if (!token) {
      return NextResponse.json({ message: "غير مصرح" }, { status: 401 })
    }

    const { id } = await params
    const notification = await markAsRead(Number(id), token)
    return NextResponse.json(notification)
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل تحديث الإشعار"
    return NextResponse.json({ message }, { status: 500 })
  }
}
