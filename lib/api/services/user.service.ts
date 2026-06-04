// lib/api/services/user.service.ts
import { api } from "../client"
import type { ApiResponse, User, JobApplication, PaginationMeta, Job } from "../types"

export interface UpdateProfileData {
  name?: string
  email?: string
  phone?: string
  country_id?: number
  city_id?: number
}

function unwrapPayload<T>(response: unknown): T | undefined {
  if (!response || typeof response !== "object") return undefined

  const payload = response as { data?: T; items?: T; results?: T }
  if (payload.data !== undefined) return payload.data
  if (payload.items !== undefined) return payload.items
  if (payload.results !== undefined) return payload.results

  return undefined
}

function extractApplications(response: unknown): JobApplication[] {
  let items: any[] = []
  
  if (Array.isArray(response)) {
    items = response
  } else if (response && typeof response === "object") {
    const payload = response as any
    // Try to extract array from common wrapper properties
    if (Array.isArray(payload.data)) items = payload.data
    else if (Array.isArray(payload.items)) items = payload.items
    else if (Array.isArray(payload.results)) items = payload.results
    else if (Array.isArray(payload)) items = payload
  }

  // Transform API response to JobApplication type
  return items.map((item: any) => ({
    id: item.id || item.applicationId || 0,
    job: item.job || item.jobDetails || undefined,
    user: item.user || undefined,
    status: item.status || "pending",
    applied_at: item.applied_at || item.appliedAt || "",
    cv_url: item.cv_url || item.userPortfolio?.cv || undefined,
  })).filter((app: JobApplication) => app.id > 0)
}

function extractPaginationMeta(response: unknown): PaginationMeta | undefined {
  if (!response || typeof response !== "object") return undefined

  const payload = response as { meta?: PaginationMeta }
  return payload.meta
}

export async function updateProfile(
  data: UpdateProfileData,
  token: string,
  locale = "ar"
): Promise<User> {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) formData.append(key, String(value))
  })

  const response = await api.patch<ApiResponse<User>>(
    "/user/profile",
    Object.fromEntries(formData),
    { token, locale }
  )
  return response.data
}

export async function uploadAvatar(
  file: File,
  token: string,
  locale = "ar"
): Promise<User> {
  const formData = new FormData()
  formData.append("avatar", file)

  const response = await api.post<ApiResponse<User>>(
    "/user/avatar",
    formData,
    { token, locale }
  )
  return response.data
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string,
  newPasswordConfirmation: string,
  token: string,
  locale = "ar"
): Promise<void> {
  const formData = new FormData()
  formData.append("current_password", currentPassword)
  formData.append("password", newPassword)
  formData.append("password_confirmation", newPasswordConfirmation)

  await api.post("/user/password", formData, { token, locale })
}

export async function getMyApplications(
  token: string,
  page = 1,
  locale = "ar"
): Promise<{ data: JobApplication[]; meta: PaginationMeta }> {
  const response = await api.get<unknown>(`/my-applications?page=${page}`, {
    token,
    locale,
  })

  const data = extractApplications(response)
  const meta = extractPaginationMeta(response) ?? {
    current_page: page,
    last_page: 1,
    per_page: data.length || 10,
    total: data.length,
  }

  return { data, meta }
}

export async function getMyApplicationDetail(
  token: string,
  applicationId: number,
  locale = "ar"
): Promise<JobApplication | null> {
  try {
    const response = await api.get<unknown>(`/my-applications/${applicationId}`, {
      token,
      locale,
    })

    if (response && typeof response === "object") {
      const root = response as Record<string, unknown>
      const data = root.data ?? response

      if (data && typeof data === "object") {
        const appData = data as Record<string, unknown>
        // Check if we got a valid object
        if (appData.id || appData.job) {
          return {
            id: Number(appData.id) || applicationId,
            job: appData.job as Job,
            user: appData.user as User,
            status: (appData.status as "pending" | "accepted" | "rejected") || "pending",
            applied_at: String(appData.applied_at || appData.appliedAt || ""),
            cv_url: (appData.cv_url || appData.cvUrl) as string | undefined,
          } satisfies JobApplication
        }
      }
    }
  } catch (err) {
    console.warn("[getMyApplicationDetail] direct fetch failed, trying list fallback:", err)
  }

  // Fallback: Fetch all applications and find the matching one
  try {
    const listResult = await getMyApplications(token, 1, locale)
    const found = listResult.data.find((app) => app.id === applicationId)
    if (found) {
      return found
    }
  } catch (err) {
    console.error("[getMyApplicationDetail] list fallback failed:", err)
  }

  return null
}

export async function getUserStats(
  token: string,
  locale = "ar"
): Promise<{
  total_applications: number
  pending_applications: number
  accepted_applications: number
  rejected_applications: number
}> {
  const response = await api.get<unknown>("/user/dashboard/stats", { token, locale })
  const payload = unwrapPayload<{
    total_applications?: number
    pending_applications?: number
    accepted_applications?: number
    rejected_applications?: number
  }>(response)

  return {
    total_applications: Number(payload?.total_applications ?? 0),
    pending_applications: Number(payload?.pending_applications ?? 0),
    accepted_applications: Number(payload?.accepted_applications ?? 0),
    rejected_applications: Number(payload?.rejected_applications ?? 0),
  }
}
