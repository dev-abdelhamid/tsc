// lib/api/services/admin.service.ts
import { api, ApiError } from "../client"
import type { ApiResponse, Job, JobApplication, User, PaginationMeta } from "../types"
import { normalizeJob } from "./jobs.service"

const ADMIN_JOB_STATUSES = ["pending", "approved", "active", "rejected"] as const

export async function getAdminJobs(
  token: string,
  status?: string,
  page = 1,
  locale = "ar"
): Promise<{ data: Job[]; meta: PaginationMeta }> {
  const query = status ? `?status=${status}&page=${page}` : `?page=${page}`
  const response = await api.get<ApiResponse<unknown>>(
    `/admin/jobs${query}`,
    { token, locale }
  )
  const rawList = response.data || []
  const data = (Array.isArray(rawList) ? rawList : [])
    .map((item) => normalizeJob(item, locale))
    .filter((item): item is Job => item !== null)
  return { data, meta: response.meta! }
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
  // Build query - for roles/filters, we'll fetch with large page size and filter client-side
  const per_page = role ? 1000 : 100  // Get more results when filtering by role to get accurate total
  const query = `?page=${page}&per_page=${per_page}`

  function matchesRole(u: User, wanted?: string) {
    if (!wanted) return true
    if (typeof (u as any).role === "string") return (u as any).role === wanted
    if (Array.isArray((u as any).roles)) {
      return (u as any).roles.some((r: any) => {
        if (typeof r === "string") return r === wanted
        if (r && typeof r === "object") {
          const rr = r as Record<string, unknown>
          return rr.name === wanted || rr.slug === wanted
        }
        return false
      })
    }
    return false
  }

  try {
    // Try admin endpoint first
    const response = await api.get<ApiResponse<User[]>>(`/admin/users${query}`, { token, locale })
    let data = response.data ?? []
    
    // Filter by role client-side
    if (role) {
      data = data.filter((u) => matchesRole(u, role))
    }

    // Calculate accurate meta based on filtered data
    const meta: PaginationMeta = {
      current_page: page,
      last_page: Math.max(1, Math.ceil(data.length / per_page)),
      per_page,
      total: data.length,
    }

    return { data, meta }
  } catch (err) {
    // Fallback to public /users endpoint
    if (err instanceof ApiError && err.status === 404) {
      try {
        const fallback = await api.get<ApiResponse<User[]>>(`/users${query}`, { token, locale })
        let data = fallback.data ?? []
        
        // Filter by role client-side
        if (role) {
          data = data.filter((u) => matchesRole(u, role))
        }

        // Use backend meta if available for total count, otherwise use data length
        const totalFromBackend = fallback.meta?.total ?? data.length
        const meta: PaginationMeta = {
          current_page: page,
          last_page: Math.max(1, Math.ceil(totalFromBackend / per_page)),
          per_page,
          total: totalFromBackend,  // Use backend total for accurate count
        }

        return { data, meta }
      } catch (err2) {
        console.error("[Admin Service] getAdminUsers fallback error:", err2)
        return { data: [], meta: { current_page: page, last_page: 1, per_page: 10, total: 0 } }
      }
    }

    console.error("[Admin Service] getAdminUsers error:", err)
    throw err
  }
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
  // Try the dedicated admin endpoint first
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
  }

  // Fallback: Calculate from admin endpoints with proper role filtering
  try {
    // Get user stats (role = "User") and company stats (role = "Company") separately
    const [usersStats, companiesStats] = await Promise.all([
      getAdminUsers(token, "User", 1, locale).catch(() => ({ data: [], meta: { total: 0 } })),
      getAdminUsers(token, "Company", 1, locale).catch(() => ({ data: [], meta: { total: 0 } })),
    ])

    const totalUsers = usersStats.meta?.total ?? 0
    const totalCompanies = companiesStats.meta?.total ?? 0

    // Get jobs by all statuses like admin jobs page does
    const jobStatuses = ["pending", "approved", "active", "rejected"] as const
    const jobBatches = await Promise.all(
      jobStatuses.map((status) =>
        getAdminJobs(token, status, 1, locale)
          .then((r) => r.meta)
          .catch(() => ({ total: 0 }))
      )
    )

    // Sum all job statuses for total jobs
    const totalJobs = jobBatches.reduce((sum, batch) => sum + (batch?.total ?? 0), 0)
    
    // Pending jobs count
    const pendingJobs = jobBatches[0]?.total ?? 0

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
