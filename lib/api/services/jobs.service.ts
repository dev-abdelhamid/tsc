// lib/api/services/jobs.service.ts
import { api } from "../client"
import type { ApiResponse, Job, PaginationMeta } from "../types"

export interface JobsFilter {
  per_page?: number
  page?: number
  category_id?: number
  country_id?: number
  city_id?: number
  salary_from?: number
  salary_to?: number
  search?: string
}

export async function getPublicJobs(
  filter: JobsFilter = {},
  locale = "ar"
): Promise<{ data: Job[]; meta: PaginationMeta }> {
  const params = new URLSearchParams()
  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, String(value))
  })

  const query = params.toString() ? `?${params}` : ""
  const response = await api.get<ApiResponse<Job[]>>(
    `/public/jobs${query}`,
    { locale, cache: "force-cache" }
  )
  return { data: response.data, meta: response.meta! }
}

export async function getPublicJob(id: number, locale = "ar"): Promise<Job> {
  const response = await api.get<ApiResponse<Job>>(
    `/public/jobs/${id}`,
    { locale, cache: "force-cache" }
  )
  return response.data
}

export async function applyForJob(
  jobId: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.post(`/jobs/${jobId}/apply`, {}, { token, locale })
}

export async function toggleFavorite(
  jobId: number,
  token: string,
  locale = "ar"
): Promise<{ is_favourite: boolean }> {
  const response = await api.post<ApiResponse<{ is_favourite: boolean }>>(
    "/favourite-jobs/toggle",
    { job_id: jobId },
    { token, locale }
  )
  return response.data
}

export async function getFavoriteJobs(
  token: string,
  locale = "ar"
): Promise<Job[]> {
  const response = await api.get<ApiResponse<Job[]>>(
    "/favourite-jobs",
    { token, locale }
  )
  return response.data
}
