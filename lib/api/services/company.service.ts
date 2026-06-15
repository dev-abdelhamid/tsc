// lib/api/services/company.service.ts
import { api } from "../client"
import type { ApiResponse, Job, JobApplication, PaginationMeta } from "../types"
import {
  buildJobFormData,
  buildJobFormDataForUpdate,
} from "@/features/company-jobs/lib/build-job-form-data"
import {
  extractApplications,
  extractApplicationsMeta,
  mapApplicationStatus,
  normalizeCompanyApplication,
  toApiApplicationStatus,
  unwrapCompanyStats,
  type CompanyApplication,
} from "@/features/company-jobs/lib/application-utils"
import { normalizeJob } from "./jobs.service"

export type LocalizedText = { ar: string; en: string; de: string }

export interface CreateJobPayload {
  title: LocalizedText
  category_id: number
  sub_category_id: number
  state: string
  vacancy: number
  gender: "Male" | "Female" | "All"
  application_deadline: string
  salary_from: number
  salary_to: number
  age_from: number
  age_to: number
  description: LocalizedText
  responsibilities: LocalizedText
  requirements: LocalizedText
  image: File | Blob
}

export async function getCompanyJob(
  id: number,
  token: string,
  locale = "ar"
): Promise<Job | null> {
  try {
    const response = await api.get<ApiResponse<Job>>(`/jobs/${id}`, { token, locale, next: { revalidate: 60 } })
    const rawJob = response.data ?? response
    return normalizeJob(rawJob, locale)
  } catch {
    return null
  }
}

export async function getCompanyJobs(
  token: string,
  page = 1,
  locale = "ar"
): Promise<{ data: Job[]; meta: PaginationMeta }> {
  const response = await api.get<unknown>(`/jobs?page=${page}`, { token, locale, next: { revalidate: 60 } })
  const typedResponse = response as
    | { data?: unknown[]; meta?: PaginationMeta }
    | unknown[]
    | undefined

  const rawData = Array.isArray(typedResponse)
    ? typedResponse
    : Array.isArray(typedResponse?.data)
      ? typedResponse.data
      : []

  const data: Job[] = (rawData as unknown[])
    .map((item) => normalizeJob(item, locale))
    .filter((j): j is Job => j != null)

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
}

export async function enrichJobsWithApplicationCounts(
  jobs: Job[],
  token: string,
  locale = "ar"
): Promise<Job[]> {
  const missing = jobs.filter((job) => job.applications_count == null)
  if (missing.length === 0) return jobs

  const counts = new Map<number, number>()
  await Promise.all(
    missing.map(async (job) => {
      try {
        const { meta, data } = await getJobApplications(job.id, token, 1, locale)
        counts.set(job.id, meta.total ?? data.length)
      } catch {
        counts.set(job.id, 0)
      }
    })
  )

  return jobs.map((job) => ({
    ...job,
    applications_count: job.applications_count ?? counts.get(job.id) ?? 0,
  }))
}

export async function createJob(
  payload: CreateJobPayload,
  token: string,
  locale = "ar"
): Promise<Job> {
  const formData = buildJobFormData(payload)
  const response = await api.post<ApiResponse<Job>>("/jobs", formData, { token, locale })
  return response.data ?? (response as unknown as Job)
}

export async function updateJob(
  id: number,
  payload: Partial<CreateJobPayload>,
  token: string,
  locale = "ar"
): Promise<Job> {
  const formData = buildJobFormDataForUpdate({
    title: payload.title ?? { ar: "", en: "", de: "" },
    category_id: payload.category_id ?? 0,
    sub_category_id: payload.sub_category_id ?? 0,
    state: payload.state ?? "",
    vacancy: payload.vacancy ?? 0,
    gender: payload.gender ?? "All",
    application_deadline: payload.application_deadline ?? "",
    salary_from: payload.salary_from ?? 0,
    salary_to: payload.salary_to ?? 0,
    age_from: payload.age_from ?? 0,
    age_to: payload.age_to ?? 0,
    description: payload.description ?? { ar: "", en: "", de: "" },
    responsibilities: payload.responsibilities ?? { ar: "", en: "", de: "" },
    requirements: payload.requirements ?? { ar: "", en: "", de: "" },
    image: payload.image,
  })
  const response = await api.post<ApiResponse<Job>>(`/jobs/${id}`, formData, {
    token,
    locale,
  })
  return response.data ?? (response as unknown as Job)
}

export async function deleteJob(
  id: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.delete(`/jobs/${id}`, { token, locale })
}

export async function stopJob(
  id: number,
  token: string,
  locale = "ar"
): Promise<Job> {
  const response = await api.patch<ApiResponse<Job>>(`/jobs/${id}/stop`, undefined, {
    token,
    locale,
  })
  return response.data ?? (response as unknown as Job)
}

export async function getJobApplications(
  jobId: number,
  token: string,
  page = 1,
  locale = "ar"
): Promise<{ data: CompanyApplication[]; meta: PaginationMeta }> {
  const response = await api.get<unknown>(
    `/company/applications?job_id=${jobId}&page=${page}`,
    { token, locale }
  )

  const data = extractApplications(response)
  const meta = extractApplicationsMeta(response, page, data.length)

  return { data, meta }
}

export async function getCompanyApplication(
  jobId: number,
  applicationId: number,
  token: string,
  locale = "ar"
): Promise<CompanyApplication | null> {
  // Optimize: try fetching with high per_page count first to minimize sequential loops during SSR
  try {
    const response = await api.get<unknown>(
      `/company/applications?job_id=${jobId}&per_page=100&page=1`,
      { token, locale }
    )
    const data = extractApplications(response)
    const found = data.find((application) => application.id === applicationId)
    if (found) return found
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[getCompanyApplication] Direct large-page fetch failed, falling back to standard paging loop:", err)
  }

  let page = 1
  let lastPage = 1

  do {
    const { data, meta } = await getJobApplications(jobId, token, page, locale)
    const found = data.find((application) => application.id === applicationId)
    if (found) return found
    lastPage = meta.last_page ?? 1
    page += 1
  } while (page <= lastPage)

  return null
}

export async function getAllCompanyApplications(
  token: string,
  locale = "ar",
  jobs?: Job[]
): Promise<Array<CompanyApplication & { jobId: number; jobTitle?: string }>> {
  try {
    const response = await api.get<any>("/company/applications", { token, locale })
    const rawList = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
        ? response.data
        : []
        
    const data = rawList.map((item: any) => {
      const normalized = normalizeCompanyApplication(item)
      return {
        ...normalized,
        jobId: normalized.job?.id ?? 0,
        jobTitle: normalized.job?.title
          ? typeof normalized.job.title === "string"
            ? normalized.job.title
            : (normalized.job.title[locale as "ar" | "en" | "de"] || "")
          : "",
      }
    })
    return data
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[getAllCompanyApplications] Direct fetch failed, falling back to per-job query loop:", err)
  }

  const jobList = jobs ?? (await getCompanyJobs(token, 1, locale)).data
  const aggregated: Array<CompanyApplication & { jobId: number; jobTitle?: string }> = []

  // Optimize: Fetch applications in parallel using Promise.all
  await Promise.all(
    jobList.map(async (job) => {
      let page = 1
      let lastPage = 1
      const jobApplications: CompanyApplication[] = []

      do {
        try {
          const { data, meta } = await getJobApplications(job.id, token, page, locale)
          jobApplications.push(...data)
          lastPage = meta.last_page ?? 1
        } catch {
          break
        }
        page += 1
      } while (page <= lastPage)

      for (const application of jobApplications) {
        aggregated.push({
          ...application,
          jobId: job.id,
          job: application.job ?? job,
        })
      }
    })
  )

  return aggregated
}

export async function updateApplicationStatus(
  applicationId: number,
  status: "accepted" | "rejected" | "approved",
  token: string,
  locale = "ar"
): Promise<JobApplication> {
  const formData = new FormData()
  formData.append("status", toApiApplicationStatus(status))

  const response = await api.post<ApiResponse<JobApplication>>(
    `/company/applications/${applicationId}/status`,
    formData,
    { token, locale }
  )

  const payload = response.data ?? response
  return normalizeCompanyApplication(payload)
}

export async function getCompanyStats(
  token: string,
  locale = "ar",
  jobs?: Job[]
): Promise<{
  total_jobs: number
  total_applications: number
  pending_applications: number
}> {
  let parsed = {
    total_jobs: 0,
    total_applications: 0,
    pending_applications: 0,
  }

  // If caller provided a job list, try computing stats from it immediately
  // This is used as a fast fallback by the dashboard page to avoid
  // re-calling the upstream stats endpoint when we already have job data.
  if (Array.isArray(jobs) && jobs.length > 0) {
    try {
      const enriched = await enrichJobsWithApplicationCounts(jobs, token, locale)

      let computedApplications = enriched.reduce((sum, job) => sum + (job.applications_count ?? 0), 0)
      let pendingApplications = parsed.pending_applications

      if (computedApplications === 0 && enriched.length > 0) {
        try {
          const allApplications = await getAllCompanyApplications(token, locale, enriched)
          computedApplications = allApplications.length
          pendingApplications =
            pendingApplications ||
            allApplications.filter((application) => mapApplicationStatus(application.status) === "pending").length
        } catch {
          // ignore failures computing full applications list and fall through
        }
      }

      return {
        total_jobs: parsed.total_jobs || enriched.length,
        total_applications: parsed.total_applications || computedApplications,
        pending_applications: pendingApplications,
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[getCompanyStats] Fast compute from provided jobs failed, falling back to API:", err)
      // fall through to API attempt below
    }
  }

  try {
    const response = await api.get<unknown>("/company/dashboard/stats", { token, locale })
    parsed = unwrapCompanyStats(response)
    // If the API call succeeds, we return immediately to save redundant calls
    return parsed
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[getCompanyStats] Stats API failed, using client-side fallback:", err)
  }

  // Fetch job list (all pages) unless caller provided one
  let jobList = jobs ?? []
  if (!jobs) {
    const firstPage = await getCompanyJobs(token, 1, locale)
    jobList = firstPage.data
    const meta = (firstPage as any).meta
    const lastPage = meta?.last_page ?? 1
    if (lastPage > 1) {
      for (let p = 2; p <= lastPage; p++) {
        try {
          const next = await getCompanyJobs(token, p, locale)
          jobList = jobList.concat(next.data)
        } catch {
          // ignore page failures and continue
        }
      }
    }
  }

  const enriched = await enrichJobsWithApplicationCounts(jobList, token, locale)

  let computedApplications = enriched.reduce((sum, job) => sum + (job.applications_count ?? 0), 0)
  let pendingApplications = parsed.pending_applications

  if (computedApplications === 0 && enriched.length > 0) {
    const allApplications = await getAllCompanyApplications(token, locale, enriched)
    computedApplications = allApplications.length
    pendingApplications =
      pendingApplications ||
      allApplications.filter((application) => mapApplicationStatus(application.status) === "pending").length
  }

  return {
    total_jobs: parsed.total_jobs || enriched.length,
    total_applications: parsed.total_applications || computedApplications,
    pending_applications: pendingApplications,
  }
}
