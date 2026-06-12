import { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const API_ROOT = process.env.NEXT_PUBLIC_API_URL || "https://cv.subcodeco.com/api/v1"

export async function POST(request: NextRequest) {
  try {
    // Accept JSON, form-data, or urlencoded bodies for convenience
    let body: Record<string, unknown> = {}
    try {
      body = await request.json()
    } catch {}

    // If JSON parse failed, try formData
    if (!body || Object.keys(body).length === 0) {
      try {
        const form = await request.formData()
        form.forEach((v, k) => {
          body[k] = typeof v === "string" ? v : v
        })
      } catch {}
    }

    // Also allow query param as a fallback for simple curl tests
    const urlObj = new URL(request.url)
    const qRefresh = urlObj.searchParams.get("refresh_token") || urlObj.searchParams.get("refreshToken")
    const refreshToken = String(body.refresh_token || body.refreshToken || qRefresh || "")
    const accessToken = body.access_token || body.accessToken || undefined
    const mode = String(body.mode || "form").toLowerCase() // "form" or "urlencoded"

    if (!refreshToken) return NextResponse.json({ success: false, message: "missing refresh_token" }, { status: 400 })

    const url = `${API_ROOT.replace(/\/$/, "")}/auth/refresh-token`
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"

    let res: Response
    if (mode === "urlencoded") {
      const payload = `refresh_token=${encodeURIComponent(refreshToken)}`
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "Accept-Language": locale,
          ...(accessToken ? { Authorization: `Bearer ${String(accessToken)}` } : {}),
        },
        body: payload,
      })
    } else {
      const form = new FormData()
      form.append("refresh_token", refreshToken)
      res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Language": locale,
          ...(accessToken ? { Authorization: `Bearer ${String(accessToken)}` } : {}),
        },
        body: form,
      })
    }

    const text = await res.text().catch(() => "")

    // Redact obvious tokens from the returned body for safety in logs
      const redacted = text.replace(/("?(?:access_token|refresh_token|id_token|token|accessToken|refreshToken)"?\s*:\s*)"([^"]*)"/gi, '$1"[REDACTED]"')

    return NextResponse.json(
      { success: true, status: res.status, statusText: res.statusText, body: redacted },
      { status: 200 }
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
