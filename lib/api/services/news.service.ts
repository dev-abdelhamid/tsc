// lib/api/services/news.service.ts
import { api } from "../client"
import type { ApiResponse, News, PaginationMeta } from "../types"

export interface NewsFilter {
  per_page?: number
  page?: number
  search?: string
}

export async function getNews(
  filter: NewsFilter = {},
  locale = "ar"
): Promise<{ data: News[]; meta: PaginationMeta }> {
  const params = new URLSearchParams()
  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, String(value))
  })

  const query = params.toString() ? `?${params}` : ""
  const response = await api.get<ApiResponse<News[]>>(
    `/public/news${query}`,
    { locale, cache: "force-cache" }
  )
  return { data: response.data, meta: response.meta! }
}

export async function getNewsItem(slug: string, locale = "ar"): Promise<News> {
  const response = await api.get<ApiResponse<News>>(
    `/public/news/${slug}`,
    { locale, cache: "force-cache" }
  )
  return response.data
}
