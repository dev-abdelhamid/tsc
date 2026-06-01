import { NextRequest, NextResponse } from "next/server"
import { getCities } from "@/lib/api/services/auth.service"
import { getSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") || "ar"
  const countryIdStr = request.nextUrl.searchParams.get("countryId")
  if (!countryIdStr) {
    return NextResponse.json({ data: [], message: "Missing countryId" }, { status: 400 })
  }

  const countryId = Number(countryIdStr)
  const session = await getSession().catch(() => null)

  try {
    const list = await getCities(countryId, locale, session?.accessToken)
    
    // Cache response for 1 hour on CDN and 5 minutes in browser
    const response = NextResponse.json({ data: list })
    response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400")
    return response
  } catch {
    return NextResponse.json({ data: [], error: "Failed to fetch cities" }, { status: 500 })
  }
}
