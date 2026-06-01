// lib/api/services/portfolio.service.ts
import { api } from "../client"
import type { ApiResponse, UserPortfolio, Education, Experience, Language, Skill } from "../types"

export async function getUserPortfolio(
  token: string,
  locale = "ar"
): Promise<UserPortfolio> {
  try {
    const response = await api.get<ApiResponse<UserPortfolio>>(
      "/user/portfolio",
      { token, locale, cache: "no-store" }
    )
    return response.data || {}
  } catch {
    // Return empty portfolio if API call fails
    return {}
  }
}

export async function uploadCV(
  file: File,
  token: string,
  locale = "ar"
): Promise<{ cv_url: string }> {
  const formData = new FormData()
  formData.append("cv", file)

  const response = await api.post<ApiResponse<{ cv_url: string }>>(
    "/user/cv",
    formData,
    { token, locale }
  )
  return response.data
}

export async function addEducation(
  data: Omit<Education, "id">,
  token: string,
  locale = "ar"
): Promise<Education> {
  const response = await api.post<ApiResponse<Education>>(
    "/user/educations",
    data,
    { token, locale }
  )
  return response.data
}

export async function updateEducation(
  id: number,
  data: Partial<Education>,
  token: string,
  locale = "ar"
): Promise<Education> {
  const response = await api.put<ApiResponse<Education>>(
    `/user/educations/${id}`,
    data,
    { token, locale }
  )
  return response.data
}

export async function deleteEducation(
  id: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.delete(`/user/educations/${id}`, { token, locale })
}

export async function addExperience(
  data: Omit<Experience, "id">,
  token: string,
  locale = "ar"
): Promise<Experience> {
  const response = await api.post<ApiResponse<Experience>>(
    "/user/experiences",
    data,
    { token, locale }
  )
  return response.data
}

export async function updateExperience(
  id: number,
  data: Partial<Experience>,
  token: string,
  locale = "ar"
): Promise<Experience> {
  const response = await api.put<ApiResponse<Experience>>(
    `/user/experiences/${id}`,
    data,
    { token, locale }
  )
  return response.data
}

export async function deleteExperience(
  id: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.delete(`/user/experiences/${id}`, { token, locale })
}

export async function addLanguage(
  data: Omit<Language, "id">,
  token: string,
  locale = "ar"
): Promise<Language> {
  const response = await api.post<ApiResponse<Language>>(
    "/user/languages",
    data,
    { token, locale }
  )
  return response.data
}

export async function updateLanguage(
  id: number,
  data: Partial<Language>,
  token: string,
  locale = "ar"
): Promise<Language> {
  const response = await api.put<ApiResponse<Language>>(
    `/user/languages/${id}`,
    data,
    { token, locale }
  )
  return response.data
}

export async function deleteLanguage(
  id: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.delete(`/user/languages/${id}`, { token, locale })
}

export async function addSkill(
  data: Omit<Skill, "id">,
  token: string,
  locale = "ar"
): Promise<Skill> {
  const response = await api.post<ApiResponse<Skill>>(
    "/user/skills",
    data,
    { token, locale }
  )
  return response.data
}

export async function updateSkill(
  id: number,
  data: Partial<Skill>,
  token: string,
  locale = "ar"
): Promise<Skill> {
  const response = await api.put<ApiResponse<Skill>>(
    `/user/skills/${id}`,
    data,
    { token, locale }
  )
  return response.data
}

export async function deleteSkill(
  id: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.delete(`/user/skills/${id}`, { token, locale })
}
