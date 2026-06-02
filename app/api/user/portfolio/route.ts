import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://cv.subcodeco.com/api/v1"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const token = session.accessToken
    
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const locale = request.headers.get("accept-language")?.split(",")[0] || session.locale || "ar"

    const response = await fetch(`${API_BASE}/portfolio`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Accept-Language": locale,
      },
      cache: "no-store",
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[Portfolio GET] Error:", response.status, data)
      return NextResponse.json(
        { message: data.message || "Failed to load portfolio" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Portfolio GET] Exception:", error)
    const message = error instanceof Error ? error.message : "Failed to load portfolio"
    return NextResponse.json({ message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const token = session.accessToken
    
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const locale = request.headers.get("accept-language")?.split(",")[0] || 
                   request.headers.get("x-locale") || 
                   session.locale || 
                   "ar"
    
    const formData = await request.formData()

    const response = await fetch(`${API_BASE}/portfolio`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Accept-Language": locale,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[Portfolio POST] Error:", response.status, data)
      return NextResponse.json(
        { message: data.message || "Failed to save portfolio", errors: data.errors },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Portfolio POST] Exception:", error)
    const message = error instanceof Error ? error.message : "Failed to save portfolio"
    return NextResponse.json({ message }, { status: 500 })
  }
}