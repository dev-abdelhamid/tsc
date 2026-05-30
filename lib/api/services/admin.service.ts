// lib/api/services/admin.service.ts
import { api } from "../client"
import type { ApiResponse, Job, JobApplication, User, PaginationMeta } from "../types"

const ADMIN_JOB_STATUSES = ["pending", "approved", "active", "rejected"] as const

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

export async function getAdminJobById(
  jobId: number,
  token: string,
  locale = "ar"
): Promise<Job | null> {
  try {
    for (const status of ADMIN_JOB_STATUSES) {
      let page = 1
      let hasMore = true

      while (hasMore) {
        const { data, meta } = await getAdminJobs(token, status, page, locale)
        const job = data.find((entry) => entry.id === jobId)

        if (job) {
          return job
        }

        hasMore = meta.last_page > page
        page += 1
      }
    }

    return null
  } catch (error) {
    console.error("[Admin Service] getAdminJobById error:", error)
    return null
  }
}

export async function getAdminJobApplications(
  jobId: number,
  token: string,
  page = 1,
  locale = "ar"
): Promise<{ data: JobApplication[]; meta: PaginationMeta }> {
  try {
    const response = await api.get<unknown>(
      `/admin/job-applications?job_id=${jobId}&page=${page}`,
      { token, locale }
    )

    const typedResponse = response as
      | { data?: JobApplication[]; meta?: PaginationMeta }
      | JobApplication[]
      | undefined

    const data = Array.isArray(typedResponse)
      ? typedResponse
      : Array.isArray(typedResponse?.data)
        ? typedResponse.data
        : []

    const meta = Array.isArray(typedResponse)
      ? {
          current_page: page,
          last_page: 1,
          per_page: 10,
          total: data.length,
        }
      : typedResponse?.meta || {
          current_page: page,
          last_page: 1,
          per_page: 10,
          total: data.length,
        }

    return { data, meta }
  } catch (error) {
    console.error("[Admin Service] getAdminJobApplications error:", error)
    throw error
  }
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
  // Try the dedicated admin endpoint first. If it does not exist on the backend
  // (common in early integrations), fall back to deriving values from public
  // endpoints such as /users and /jobs.
  try {
    const response = await api.get<
      ApiResponse<{
        total_users: number
        total_companies: number
        total_jobs: number
        pending_jobs: number
      }>
    >("/admin/stats", { token, locale })
    return response.data
  } catch (err) {
    console.warn("/admin/stats not available, falling back to derived stats", err)

    function parseTotalFromResponse(resp: unknown): number {
      if (!resp) return 0
      if (Array.isArray(resp)) return resp.length
      try {
        const asObj = resp as Record<string, unknown>
        if (asObj.meta && typeof (asObj.meta as any).total === "number") return (asObj.meta as any).total
        if (asObj.data && Array.isArray(asObj.data)) return (asObj.data as any).length
        if (typeof asObj.total === "number") return asObj.total as number
      } catch {
        // ignore
      }
      return 0
    }

    try {
      const [usersResp, jobsResp] = await Promise.all([
        api.get<unknown>("/users?page=1&per_page=1", { token, locale }),
        api.get<unknown>("/jobs?page=1&per_page=1", { token, locale }),
      ])

      const totalUsers = parseTotalFromResponse(usersResp)
      const totalJobs = parseTotalFromResponse(jobsResp)

      let pendingJobs = 0
      try {
        const pendingResp = await api.get<unknown>("/jobs?status=pending&page=1&per_page=1", { token, locale })
        pendingJobs = parseTotalFromResponse(pendingResp)
      } catch {
        pendingJobs = 0
      }

      let totalCompanies = 0
      try {
        // Some backends expose companies as users with role=company
        const companiesResp = await api.get<unknown>("/users?role=company&page=1&per_page=1", { token, locale })
        totalCompanies = parseTotalFromResponse(companiesResp)
      } catch {
        totalCompanies = 0
      }

      return {
        total_users: Number(totalUsers || 0),
        total_companies: Number(totalCompanies || 0),
        total_jobs: Number(totalJobs || 0),
        pending_jobs: Number(pendingJobs || 0),
      }
    } catch (err2) {
      console.error("[Admin Service] getAdminStats fallback error:", err2)
      return { total_users: 0, total_companies: 0, total_jobs: 0, pending_jobs: 0 }
    }
  }
}
