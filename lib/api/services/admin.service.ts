// lib/api/services/admin.service.ts
import { api, ApiError } from "../client"
import type { ApiResponse, Job, JobApplication, User, PaginationMeta } from "../types"
import { normalizeJob } from "./jobs.service"
import { normalizeCompanyApplication } from "@/features/company-jobs/lib/application-utils"

const ADMIN_JOB_STATUSES = ["pending", "approved", "active", "rejected"] as const

export async function getAdminJobs(
  token: string,
  status?: string,
  page = 1,
  locale = "ar"
): Promise<{ data: Job[]; meta: PaginationMeta }> {
  const query = status ? `?status=${status}&page=${page}` : `?page=${page}`
  // Add short server-side caching to reduce repeated identical admin API calls
  const response = await api.get<unknown>(`/admin/jobs${query}`, { token, locale, next: { revalidate: 15 } })

  // Handle multiple possible response shapes:
  // - { data: [...] , meta: { ... } }
  // - [...] (array)
  const typed = response as
    | { data?: unknown[]; meta?: PaginationMeta }
    | unknown[]
    | undefined

  const rawList = Array.isArray(typed)
    ? typed
    : Array.isArray(typed?.data)
      ? (typed!.data as unknown[])
      : []

  const data = (Array.isArray(rawList) ? rawList : [])
    .map((item) => normalizeJob(item, locale))
    .filter((item): item is Job => item !== null)

  const meta: PaginationMeta = Array.isArray(typed)
    ? { current_page: page, last_page: 1, per_page: data.length, total: data.length }
    : typed?.meta || { current_page: page, last_page: 1, per_page: data.length, total: data.length }

  return { data, meta }
}

export async function getAdminJobApplicationById(
  jobId: number,
  applicationId: number,
  token: string,
  locale = "ar"
): Promise<JobApplication | null> {
  try {
    const response = await api.get<any>(`/admin/job-applications/${applicationId}`, { token, locale })
    const raw = response.data ?? response
    if (raw) {
      return normalizeCompanyApplication(raw) as unknown as JobApplication
    }
  } catch (err) {
    if (err instanceof ApiError && (err.status === 403 || err.status === 401)) {
      return null
    }
    // eslint-disable-next-line no-console
    console.warn(`[getAdminJobApplicationById] Direct fetch failed, trying fallback search loop:`, err)
  }

  try {
    let page = 1
    while (true) {
      const { data, meta } = await getAdminJobApplications(jobId, token, page, locale)
      const found = data.find((a) => Number(a.id) === Number(applicationId))
      if (found) return found
      const last = Number(meta?.last_page ?? 1)
      if (page >= last) break
      page += 1
    }
    return null
  } catch (err) {
    return null
  }
}

export async function getAdminJobById(
  jobId: number,
  token: string,
  locale = "ar"
): Promise<Job | null> {
  const endpoints = [`/admin/jobs/${jobId}`, `/jobs/${jobId}`]

  for (const endpoint of endpoints) {
    try {
      const response = await api.get<ApiResponse<Job>>(endpoint, { token, locale })
      // API may return { data: { job: {...}, related: [...] } } or { data: { id, ... } }
      const payload = (response as any)?.data ?? response
      const rawJob =
        payload && typeof payload === "object" && !Array.isArray(payload) && "job" in payload
          ? (payload as any).job
          : payload
      if (rawJob) {
        return normalizeJob(rawJob, locale)
      }
    } catch (err) {
      if (err instanceof ApiError && (err.status === 403 || err.status === 401)) {
        // If it's a forbidden/auth error, we can still try other endpoints or fallback search
      }
      // eslint-disable-next-line no-console
      console.warn(`[getAdminJobById] Fetch from ${endpoint} failed:`, err)
    }
  }

  try {
    const statuses = [...ADMIN_JOB_STATUSES, "stopped"]
    for (const status of statuses) {
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

    const rawList = Array.isArray(typedResponse)
      ? typedResponse
      : Array.isArray(typedResponse?.data)
        ? typedResponse.data
        : []

    const data = rawList.map((item) => normalizeCompanyApplication(item) as unknown as JobApplication)

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
  locale = "ar",
  perPage = 10
): Promise<{ data: User[]; meta: PaginationMeta }> {
  let query = `page=${page}&per_page=${perPage}`
  if (role) {
    // Map role to capitalized first letter (e.g. user -> User, company -> Company, admin -> Admin)
    const backendRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
    query += `&filter[roles.name]=${backendRole}`
  }

  // We know /admin/users 404s, so call /users directly.
  const response = await api.get<any>(`/users?${query}`, { token, locale })
  
  const rawList = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : []

  const data = rawList as User[]
  
  const meta: PaginationMeta = Array.isArray(response)
    ? { current_page: page, last_page: 1, per_page: perPage, total: data.length }
    : response?.meta || { current_page: page, last_page: 1, per_page: perPage, total: data.length }

  return { data, meta }
}

export async function getAdminStats(
  token: string,
  locale = "ar"
): Promise<{
  total_users: number
  total_companies: number
  total_jobs: number
  pending_jobs: number
  published_jobs?: number
}> {
  try {
    // Get user and company stats separately with client-side role filtering
    const [usersResult, companiesResult] = await Promise.all([
      getAdminUsers(token, "user", 1, locale, 1),
      getAdminUsers(token, "company", 1, locale, 1),
    ])

    const totalUsers = usersResult.meta?.total ?? 0
    const totalCompanies = companiesResult.meta?.total ?? 0

    // Prefer fetching a single /admin/jobs?page=1 to get the authoritative total
    // (some backends expose total in the meta for the unfiltered endpoint).
    let totalJobs = 0
    let pendingJobs = 0

    try {
      const allJobs = await getAdminJobs(token, undefined, 1, locale).catch(() => ({ data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } }))
      totalJobs = allJobs.meta?.total ?? 0
    } catch (e) {
      totalJobs = 0
    }

    try {
      const pendingRes = await getAdminJobs(token, "pending", 1, locale).catch(() => ({ data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } }))
      pendingJobs = pendingRes.meta?.total ?? 0
    } catch (e) {
      pendingJobs = 0
    }

    // For published jobs, prefer summing approved + active counts
    let publishedJobs = 0
    try {
      const [approvedRes, activeRes] = await Promise.all([
        getAdminJobs(token, "approved", 1, locale).catch(() => ({ data: [], meta: { total: 0 } })),
        getAdminJobs(token, "active", 1, locale).catch(() => ({ data: [], meta: { total: 0 } })),
      ])
      publishedJobs = (approvedRes.meta?.total ?? 0) + (activeRes.meta?.total ?? 0)
    } catch (e) {
      // fallback: estimate published as total - pending
      publishedJobs = Math.max(0, (totalJobs || 0) - (pendingJobs || 0))
    }

    // If for some reason totalJobs is still zero and we have per-status totals, sum them as fallback
    if (!totalJobs) {
      try {
        const jobStatuses = ["pending", "approved", "active", "rejected"] as const
        const jobResults = await Promise.all(jobStatuses.map((status) => getAdminJobs(token, status, 1, locale).catch(() => ({ data: [], meta: { total: 0 } }))))
        totalJobs = jobResults.reduce((sum, result) => sum + (result.meta?.total ?? 0), 0)
      } catch {
        // ignore
      }
    }

    return {
      total_users: Number(totalUsers || 0),
      total_companies: Number(totalCompanies || 0),
      total_jobs: Number(totalJobs || 0),
      pending_jobs: Number(pendingJobs || 0),
      published_jobs: Number(publishedJobs || 0),
    }
  } catch (err) {
    return { total_users: 0, total_companies: 0, total_jobs: 0, pending_jobs: 0 }
  }
}

export async function suspendUser(
  userId: number | string,
  suspend: boolean,
  token: string,
  locale = "ar"
): Promise<void> {
  // Call backend to update status to "suspended" (or "inactive") or "active"
  const formData = new FormData()
  formData.append("status", suspend ? "suspended" : "active")
  try {
    await api.post(`/admin/users/${userId}`, formData, { token, locale })
  } catch (err) {
    await api.post(`/users/${userId}`, formData, { token, locale })
  }
}

export async function updateAdminUser(
  userId: number | string,
  data: { name?: string; email?: string; password?: string; status?: string; email_verified?: number | boolean },
  token: string,
  locale = "ar"
): Promise<void> {
  const formData = new FormData()
  if (data.name) formData.append("name", data.name)
  if (data.email) formData.append("email", data.email)
  if (data.password) formData.append("password", data.password)
  if (data.status) formData.append("status", data.status)
  if (data.email_verified !== undefined) {
    formData.append("email_verified", data.email_verified ? "1" : "0")
  }
  
  try {
    await api.post(`/admin/users/${userId}`, formData, { token, locale })
  } catch (err) {
    await api.post(`/users/${userId}`, formData, { token, locale })
  }
}

