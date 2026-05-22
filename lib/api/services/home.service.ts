// lib/api/services/home.service.ts
import { api } from "../client"
import type { ApiResponse, HomeData } from "../types"

export async function getHomeData(locale = "ar"): Promise<HomeData> {
  const response = await api.get<ApiResponse<HomeData>>(
    "/public/home",
    { locale, cache: "force-cache" }
  )
  return response.data
}
