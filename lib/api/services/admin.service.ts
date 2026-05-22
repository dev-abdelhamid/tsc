// lib/api/services/admin.service.ts
import { api } from "../client"
import type { ApiResponse, Job, User, PaginationMeta } from "../types"

export async function getAdminJobs(
  token: string,
  status?: string,
  page = 1,
  locale = "ar"
): Promise<{ data: Job[]; meta: PaginationMeta }> {
  const query = status ? `?status=${status}&page=${page}` : `?page=${page}`
  const response = await api.get<ApiResponse<Job[]>>(
    `/admin/jobs${query}`,
    { token, locale }
  )
  return { data: response.data, meta: response.meta! }
}

export async function approveJob(
  jobId: number,
  token: string,
  locale = "ar"
): Promise<Job> {
  const response = await api.post<ApiResponse<Job>>(
    `/admin/jobs/${jobId}/approve`,
    {},
    { token, locale }
  )
  return response.data
}

export async function rejectJob(
  jobId: number,
  reason: string,
  token: string,
  locale = "ar"
): Promise<Job> {
  const response = await api.post<ApiResponse<Job>>(
    `/admin/jobs/${jobId}/reject`,
    { reason },
    { token, locale }
  )
  return response.data
}

export async function getAdminUsers(
  token: string,
  role?: string,
  page = 1,
  locale = "ar"
): Promise<{ data: User[]; meta: PaginationMeta }> {
  const query = role ? `?role=${role}&page=${page}` : `?page=${page}`
  const response = await api.get<ApiResponse<User[]>>(
    `/admin/users${query}`,
    { token, locale }
  )
  return { data: response.data, meta: response.meta! }
}

export async function getAdminStats(
  token: string,
  locale = "ar"
): Promise<{
  total_users: number
  total_companies: number
  total_jobs: number
  pending_jobs: number
}> {
  const response = await api.get<
    ApiResponse<{
      total_users: number
      total_companies: number
      total_jobs: number
      pending_jobs: number
    }>
  >("/admin/stats", { token, locale })
  return response.data
}
