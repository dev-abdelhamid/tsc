// lib/api/services/auth.service.ts
import { api } from "../client"
import type { ApiResponse, User, AuthTokens } from "../types"

export async function login(
  email: string,
  password: string,
  type: "user" | "company" = "user",
  locale = "ar"
): Promise<{ user: User; tokens: AuthTokens }> {
  const formData = new FormData()
  formData.append("email", email)
  formData.append("password", password)
  formData.append("type", type)

  const response = await api.post<ApiResponse<any>>(
    "/auth/login",
    formData,
    { locale }
  )

  const data = response.data
  const user = data.user || (data.id ? data : null)
  
  if (!user) {
    throw new Error("بيانات المستخدم غير موجودة في الرد")
  }

  const access_token =
    data.access_token ||
    data.token ||
    data.accessToken ||
    data.tokens?.access_token ||
    ""
    
  const refresh_token =
    data.refresh_token ||
    data.refreshToken ||
    data.tokens?.refresh_token ||
    ""
    
  const token_type =
    data.token_type ||
    data.tokenType ||
    data.tokens?.token_type ||
    "Bearer"
    
  const expires_in =
    data.expires_in ||
    data.expiresIn ||
    data.tokens?.expires_in ||
    0

  return {
    user: {
      ...user,
      role: user.role || type // Fallback to requested type if role missing
    },
    tokens: {
      access_token,
      refresh_token,
      token_type: token_type as "Bearer",
      expires_in,
    },
  }
}

export async function register(
  data: {
    name: string
    email: string
    phone: string
    password: string
    password_confirmation: string
    type: "user" | "company"
    company_name?: string
    company_type_id?: number
  },
  locale = "ar"
): Promise<{ user: User; tokens: AuthTokens }> {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) formData.append(key, String(value))
  })

  const response = await api.post<ApiResponse<any>>(
    "/auth/register",
    formData,
    { locale }
  )

  const resData = response.data
  const user = resData.user || (resData.id ? resData : null)

  if (!user) {
    throw new Error("بيانات المستخدم غير موجودة في الرد")
  }

  const access_token =
    resData.access_token ||
    resData.token ||
    resData.accessToken ||
    resData.tokens?.access_token ||
    ""

  return {
    user: {
      ...user,
      role: user.role || data.type
    },
    tokens: {
      access_token,
      refresh_token: resData.refresh_token || resData.tokens?.refresh_token || "",
      token_type: (resData.token_type || resData.tokens?.token_type || "Bearer") as "Bearer",
      expires_in: resData.expires_in || resData.tokens?.expires_in || 0,
    },
  }
}

export async function refreshToken(
  refreshToken: string,
  locale = "ar"
): Promise<AuthTokens> {
  const formData = new FormData()
  formData.append("refresh_token", refreshToken)

  const response = await api.post<ApiResponse<AuthTokens>>(
    "/auth/refresh-token",
    formData,
    { locale }
  )
  return response.data
}

export async function logout(token: string, locale = "ar"): Promise<void> {
  await api.post("/auth/logout", {}, { token, locale })
}

export async function forgotPassword(email: string, locale = "ar"): Promise<void> {
  const formData = new FormData()
  formData.append("email", email)
  await api.post("/auth/forgot-password", formData, { locale })
}

export async function verifyResetCode(
  email: string,
  code: string,
  locale = "ar"
): Promise<{ token: string }> {
  const formData = new FormData()
  formData.append("email", email)
  formData.append("code", code)
  const response = await api.post<ApiResponse<{ token: string }>>(
    "/auth/verify-reset-code",
    formData,
    { locale }
  )
  return response.data
}

export async function resetPassword(
  data: { token: string; password: string; password_confirmation: string },
  locale = "ar"
): Promise<void> {
  const formData = new FormData()
  Object.entries(data).forEach(([k, v]) => formData.append(k, v))
  await api.post("/auth/reset-password", formData, { locale })
}

export async function getProfile(token: string, locale = "ar"): Promise<User> {
  const response = await api.get<ApiResponse<User>>("/auth/profile", { token, locale })
  return response.data
}

export async function resendVerification(email: string, locale = "ar"): Promise<void> {
  const formData = new FormData()
  formData.append("email", email)
  await api.post("/auth/resend-verification", formData, { locale })
}

export async function verifyEmail(email: string, code: string, locale = "ar"): Promise<void> {
  const formData = new FormData()
  formData.append("email", email)
  formData.append("code", code)
  await api.post("/auth/verify", formData, { locale })
}

export async function updateProfile(
  data: Record<string, any>,
  token: string,
  locale = "ar"
): Promise<User> {
  const formData = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) formData.append(k, String(v))
  })
  const response = await api.post<ApiResponse<User>>("/auth/profile", formData, { token, locale })
  return response.data
}

export async function uploadAvatar(file: File | Blob, token: string, locale = "ar"): Promise<User> {
  const formData = new FormData()
  formData.append("avatar", file)
  const response = await api.post<ApiResponse<User>>("/auth/profile/avatar", formData, { token, locale })
  return response.data
}

export async function deleteAvatar(token: string, locale = "ar"): Promise<void> {
  await api.delete("/auth/profile/avatar", { token, locale })
}

export async function updatePassword(
  current_password: string,
  new_password: string,
  new_password_confirmation: string,
  token: string,
  locale = "ar"
): Promise<void> {
  const formData = new FormData()
  formData.append("current_password", current_password)
  formData.append("new_password", new_password)
  formData.append("new_password_confirmation", new_password_confirmation)
  await api.post("/auth/profile/password", formData, { token, locale })
}

export async function getPreferences(token: string, locale = "ar"): Promise<any> {
  const response = await api.get<ApiResponse<any>>("/auth/profile/preferences", { token, locale })
  return response.data
}

export async function updatePreferences(data: Record<string, any>, token: string, locale = "ar"): Promise<void> {
  const formData = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) formData.append(k, String(v))
  })
  await api.post("/auth/profile/preferences", formData, { token, locale })
}
