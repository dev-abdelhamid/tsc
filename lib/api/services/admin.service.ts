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
  const response = await api.patch<ApiResponse<Job>>(
    `/admin/jobs/${jobId}/approve`,
    {},
    { token, locale }
  )
  return response.data
}

export async function rejectJob(
  jobId: number,
  token: string,
  locale = "ar",
  reason?: string
): Promise<Job> {
  const response = await api.patch<ApiResponse<Job>>(
    `/admin/jobs/${jobId}/reject`,
    reason ? { reason } : {},
    { token, locale }
  )
  return response.data
}

export async function deleteUser(
  userId: number | string,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.delete(`/users/${userId}`, { token, locale })
}

export async function getAdminJobApplicationStats(
  token: string,
  locale = "ar"
): Promise<{ total?: number; pending?: number; approved?: number; rejected?: number }> {
  try {
    const response = await api.get<
      ApiResponse<{ total?: number; pending?: number; approved?: number; rejected?: number }>
    >("/admin/job-applications/stats", { token, locale })
    return response.data
  } catch (err) {
    console.error(err)
    return {}
  }
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
