// lib/api/services/company.service.ts
import { api } from "../client"
import type { ApiResponse, Job, JobApplication, PaginationMeta } from "../types"

export interface CreateJobData {
  title: string
  category_id: number
  employment_type: string
  country_id: number
  city_id: number
  salary_from: number
  salary_to: number
  currency: string
  description: string
  requirements: string
}

export async function getCompanyJobs(
  token: string,
  page = 1,
  locale = "ar"
): Promise<{ data: Job[]; meta: PaginationMeta }> {
  try {
    const response = await api.get<any>(
      `/jobs?page=${page}`,
      { token, locale }
    )
    
    // Handle cases where data might be directly in response or inside response.data
    const data = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : [])
    const meta = response.meta || { current_page: page, last_page: 1, per_page: 10, total: data.length }
    
    return { data, meta }
  } catch (error) {
    console.error("[Company Service] getCompanyJobs error:", error)
    throw error
  }
}

export async function createJob(
  data: CreateJobData,
  token: string,
  locale = "ar"
): Promise<Job> {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, String(value))
  })

  const response = await api.post<ApiResponse<Job>>(
    "/jobs",
    formData,
    { token, locale }
  )
  return response.data || (response as any)
}

export async function updateJob(
  id: number,
  data: Partial<CreateJobData>,
  token: string,
  locale = "ar"
): Promise<Job> {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) formData.append(key, String(value))
  })

  const response = await api.put<ApiResponse<Job>>(
    `/company/jobs/${id}`,
    Object.fromEntries(formData),
    { token, locale }
  )
  return response.data || (response as any)
}

export async function deleteJob(
  id: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.delete(`/jobs/${id}`, { token, locale })
}

export async function getJobApplications(
  jobId: number,
  token: string,
  page = 1,
  locale = "ar"
): Promise<{ data: JobApplication[]; meta: PaginationMeta }> {
  const response = await api.get<any>(
    `/jobs/${jobId}/applications?page=${page}`,
    { token, locale }
  )
  
  const data = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : [])
  const meta = response.meta || { current_page: page, last_page: 1, per_page: 10, total: data.length }
  
  return { data, meta }
}

export async function updateApplicationStatus(
  applicationId: number,
  status: "accepted" | "rejected",
  token: string,
  locale = "ar"
): Promise<JobApplication> {
  const response = await api.patch<ApiResponse<JobApplication>>(
    `/applications/${applicationId}`,
    { status },
    { token, locale }
  )
  return response.data || (response as any)
}

export async function getCompanyStats(
  token: string,
  locale = "ar"
): Promise<{ total_jobs: number; total_applications: number; pending_applications: number }> {
  try {
    const response = await api.get<any>("/company/dashboard/stats", { token, locale })
    
    // Handle nested or direct response
    const stats = response.data || response
    
    return {
      total_jobs: Number(stats.total_jobs || 0),
      total_applications: Number(stats.total_applications || 0),
      pending_applications: Number(stats.pending_applications || 0),
    }
  } catch (error) {
    console.error("[Company Service] getCompanyStats error:", error)
    // Return empty stats instead of throwing to avoid crashing the whole dashboard if only stats fail
    return { total_jobs: 0, total_applications: 0, pending_applications: 0 }
  }
}
