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

export async function getAdminUserById(
  userId: number | string,
  token: string,
  locale = "ar"
): Promise<User | null> {
  try {
    // Try several endpoints/methods to be robust against API differences
    const tryEndpoints = [
      { method: "get", path: `/admin/users/${userId}` },
      { method: "get", path: `/users/${userId}` },
      { method: "post", path: `/users/${userId}` },
    ] as const

    for (const e of tryEndpoints) {
      try {
        let response: unknown = null
        if (e.method === "get") {
          response = await api.get<unknown>(e.path, { token, locale })
        } else {
          response = await api.post<unknown>(e.path, {}, { token, locale })
        }

        if (!response || typeof response !== "object") continue
        const root = response as Record<string, unknown>
        const item = (root.data ?? response) as any
        if (item) return item as User
      } catch (innerErr) {
        // continue to next attempt
        continue
      }
    }

    return null
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[getAdminUserById] error:", err)
    return null
  }
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
    return {}
  }
}

export async function getAdminUsers(
  token: string,
  role?: string,
  page = 1,
  locale = "ar"
): Promise<{ data: User[]; meta: PaginationMeta }> {
  const pageSize = 10 // Display page size

  function matchesRole(u: User, wanted?: string) {
    if (!wanted) return true
    const wantedLower = wanted.toLowerCase()
    
    // Check single role property
    if (typeof (u as any).role === "string") {
      return (u as any).role.toLowerCase() === wantedLower
    }
    
    // Check roles array
    if (Array.isArray((u as any).roles)) {
      return (u as any).roles.some((r: any) => {
        if (typeof r === "string") return r.toLowerCase() === wantedLower
        if (r && typeof r === "object") {
          const rr = r as Record<string, unknown>
          const name = rr.name as string | undefined
          const slug = rr.slug as string | undefined
          return name?.toLowerCase() === wantedLower || slug?.toLowerCase() === wantedLower
        }
        return false
      })
    }
    return false
  }

  async function fetchAllUsers(endpoint: string): Promise<User[]> {
    let allData: User[] = []
    let currentPage = 1
    let hasMore = true

    while (hasMore) {
      try {
        const response = await api.get<ApiResponse<User[]>>(
          `${endpoint}?page=${currentPage}&per_page=100`,
          { token, locale }
        )
        const data = response.data ?? []
        
        if (data.length === 0) {
          hasMore = false
          break
        }
        
        allData = [...allData, ...data]
        
        if (response.meta?.last_page && currentPage >= response.meta.last_page) {
          hasMore = false
        } else {
          currentPage += 1
        }
      } catch (err) {
        hasMore = false
        break
      }
    }

    return allData
  }

  try {
    // Try admin endpoint first
    let allData = await fetchAllUsers("/admin/users")

    // If admin endpoint fails, try public endpoint
    if (allData.length === 0) {
      allData = await fetchAllUsers("/users")
    }

    // Filter by role client-side if specified
    let filteredData = allData
    if (role) {
      filteredData = allData.filter((u) => matchesRole(u, role))
    }

    // Calculate pagination
    const totalCount = filteredData.length
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
    const startIdx = (page - 1) * pageSize
    const paginatedData = filteredData.slice(startIdx, startIdx + pageSize)

    const meta: PaginationMeta = {
      current_page: page,
      last_page: totalPages,
      per_page: pageSize,
      total: totalCount,
    }

    return { data: paginatedData, meta }
  } catch (err) {
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
  try {
    // Get user and company stats separately with client-side role filtering
    const [usersResult, companiesResult] = await Promise.all([
      getAdminUsers(token, "user", 1, locale),
      getAdminUsers(token, "company", 1, locale),
    ])

    const totalUsers = usersResult.meta?.total ?? 0
    const totalCompanies = companiesResult.meta?.total ?? 0

    // Get jobs by all statuses
    const jobStatuses = ["pending", "approved", "active", "rejected"] as const
    const jobResults = await Promise.all(
      jobStatuses.map((status) =>
        getAdminJobs(token, status, 1, locale)
      )
    )

    const totalJobs = jobResults.reduce((sum, result) => sum + (result.meta?.total ?? 0), 0)
    const pendingJobs = jobResults[0]?.meta?.total ?? 0

    return {
      total_users: Number(totalUsers || 0),
      total_companies: Number(totalCompanies || 0),
      total_jobs: Number(totalJobs || 0),
      pending_jobs: Number(pendingJobs || 0),
    }
  } catch (err) {
    return { total_users: 0, total_companies: 0, total_jobs: 0, pending_jobs: 0 }
  }
}
