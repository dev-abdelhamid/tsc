import { NextRequest, NextResponse } from "next/server"
import { getTokenFromRequest, callBackend } from "@/lib/auth-token"

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request)
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
  const { data, error, status } = await callBackend<any>('/auth/profile', {
    method: 'GET',
    headers: { 'Accept-Language': locale }
  }, token)

  if (error) {
    return NextResponse.json({ message: error }, { status })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request)
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
  
  let body: any
  try {
    body = await request.formData()
  } catch (err) {
    return NextResponse.json({ message: "Invalid form data" }, { status: 400 })
  }

  const { data, error, status } = await callBackend<any>('/auth/profile', {
    method: 'POST',
    headers: { 'Accept-Language': locale },
    body
  }, token)

  if (error) {
    return NextResponse.json({ message: error }, { status })
  }

  return NextResponse.json(data)
}
