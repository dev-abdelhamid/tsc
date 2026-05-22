// lib/api/services/user.service.ts
import { api } from "../client"
import type { ApiResponse, User, JobApplication, Job, PaginationMeta } from "../types"

export interface UpdateProfileData {
  name?: string
  email?: string
  phone?: string
  country_id?: number
  city_id?: number
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
  const response = await api.get<ApiResponse<JobApplication[]>>(
    `/user/applications?page=${page}`,
    { token, locale }
  )
  return { data: response.data, meta: response.meta! }
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
  const response = await api.get<
    ApiResponse<{
      total_applications: number
      pending_applications: number
      accepted_applications: number
      rejected_applications: number
    }>
  >("/user/stats", { token, locale })
  return response.data
}
