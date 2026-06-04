import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getTicket } from "@/lib/api/services/tickets.service"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const token = session.accessToken

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const locale =
      request.headers.get("accept-language")?.split(",")[0] ||
      session.locale ||
      "ar"

    const ticket = await getTicket(Number(id), token, locale)
    return NextResponse.json({ data: ticket })
  } catch (error) {
    console.error("[Company Ticket Detail GET] Exception:", error)
    const message = error instanceof Error ? error.message : "Failed to load ticket"
    return NextResponse.json({ message }, { status: 500 })
  }
}
