// lib/api/services/categories.service.ts
import { api } from "../client"
import type { ApiResponse, Category } from "../types"

export async function getCategories(locale = "ar"): Promise<Category[]> {
  const response = await api.get<ApiResponse<Category[]>>(
    "/public/categories",
    { locale, cache: "force-cache" }
  )
  return response.data
}
