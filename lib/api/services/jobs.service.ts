// lib/api/services/jobs.service.ts
import { api } from "../client"
import type { ApiResponse, Job, PaginationMeta, PublicJobDetail } from "../types"
import { getJobTitle } from "@/features/jobs/lib/job-display"

export interface JobsFilter {
  per_page?: number
  page?: number
  category_id?: number
  country_id?: number
  city_id?: number
  salary_from?: number
  salary_to?: number
  search?: string
  state?: string
}

function extractJobsList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (!raw || typeof raw !== "object") return []

  const obj = raw as Record<string, unknown>
  if (Array.isArray(obj.data)) return obj.data
  if (Array.isArray(obj.jobs)) return obj.jobs
  if (Array.isArray(obj.items)) return obj.items

  const data = obj.data
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const nested = data as Record<string, unknown>
    if (Array.isArray(nested.data)) return nested.data
    if (Array.isArray(nested.jobs)) return nested.jobs
  }

  return []
}

function readRange(
  row: Record<string, unknown>,
  flatFrom: string,
  flatTo: string,
  nestedKey: string
): { from?: number; to?: number } {
  const nested = row[nestedKey]
  if (nested && typeof nested === "object") {
    const range = nested as Record<string, unknown>
    return {
      from: range.from != null ? Number(range.from) : undefined,
      to: range.to != null ? Number(range.to) : undefined,
    }
  }
  return {
    from: row[flatFrom] != null ? Number(row[flatFrom]) : undefined,
    to: row[flatTo] != null ? Number(row[flatTo]) : undefined,
  }
}

function mapStatus(raw: unknown): Job["status"] {
  if (raw === "active") return "approved"
  if (
    raw === "pending" ||
    raw === "approved" ||
    raw === "rejected" ||
    raw === "stopped"
  ) {
    return raw
  }
  return "approved"
}

function normalizeJob(item: unknown, locale: string): Job | null {
  if (!item || typeof item !== "object") return null
  const row = item as Record<string, unknown>
  const id = Number(row.id)
  if (!Number.isFinite(id) || id <= 0) return null

  const title =
    typeof row.title === "string" || (row.title && typeof row.title === "object")
      ? (row.title as Job["title"])
      : getJobTitle({ title: String(row.name || "") }, locale)

  const salary = readRange(row, "salary_from", "salary_to", "salary")
  const age = readRange(row, "age_from", "age_to", "age")

  const employmentType =
    typeof row.employment_type === "string"
      ? row.employment_type
      : typeof row.employmentType === "string"
        ? row.employmentType
        : undefined

  return {
    id,
    title,
    description: row.description as Job["description"],
    requirements: row.requirements as Job["requirements"],
    responsibilities: row.responsibilities as Job["responsibilities"],
    image: typeof row.image === "string" ? row.image : undefined,
    salary_from: salary.from,
    salary_to: salary.to,
    age_from: age.from,
    age_to: age.to,
    vacancy: row.vacancy != null ? Number(row.vacancy) : undefined,
    gender: typeof row.gender === "string" ? row.gender : undefined,
    employment_type: employmentType,
    state: typeof row.state === "string" ? row.state : undefined,
    location: typeof row.location === "string" ? row.location : undefined,
    city: row.city as Job["city"],
    country: row.country as Job["country"],
    category: row.category as Job["category"],
    sub_category: (row.sub_category ?? row.subCategory) as Job["sub_category"],
    company: row.company as Job["company"],
    status: mapStatus(row.status),
    application_deadline:
      (typeof row.application_deadline === "string" && row.application_deadline) ||
      (typeof row.applicationDeadline === "string" && row.applicationDeadline) ||
      undefined,
    created_at:
      (typeof row.created_at === "string" && row.created_at) ||
      (typeof row.createdAt === "string" && row.createdAt) ||
      new Date().toISOString(),
    created_at_human:
      (typeof row.created_at_human === "string" && row.created_at_human) ||
      (typeof row.createdAtHuman === "string" && row.createdAtHuman) ||
      undefined,
    applications_count:
      row.applications_count != null
        ? Number(row.applications_count)
        : undefined,
  }
}

function parseJobsResponse(
  response: unknown,
  locale: string
): { data: Job[]; meta?: PaginationMeta } {
  if (!response || typeof response !== "object") {
    return { data: [] }
  }

  const root = response as Record<string, unknown>
  const meta = root.meta as PaginationMeta | undefined
  const candidates = [root.data, root, extractJobsList(root.data), extractJobsList(root)]

  for (const candidate of candidates) {
    const list = extractJobsList(candidate)
    if (list.length === 0) continue

    const data = list
      .map((item) => normalizeJob(item, locale))
      .filter((item): item is Job => item !== null)

    return { data, meta }
  }

  return { data: [], meta }
}

export async function getPublicJobs(
  filter: JobsFilter = {},
  locale = "ar"
): Promise<{ data: Job[]; meta?: PaginationMeta }> {
  const params = new URLSearchParams()
  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.append(key, String(value))
  })

  const query = params.toString() ? `?${params}` : ""
  const endpoints = [`/public/jobs${query}`, `/jobs${query}`]

  for (const endpoint of endpoints) {
    try {
      const response = await api.get<unknown>(endpoint, {
        locale,
        cache: "no-store",
      })
      const parsed = parseJobsResponse(response, locale)
      if (parsed.data.length > 0) return parsed
    } catch (err) {
      console.error(err)
      // try next
    }
  }

  try {
    const response = await api.get<ApiResponse<Job[]>>(
      `/public/jobs${query}`,
      { locale, cache: "no-store" }
    )
    return parseJobsResponse(response, locale)
  } catch (err) {
    console.error(err)
    return { data: [] }
  }
}

export async function getPublicJob(id: number, locale = "ar"): Promise<Job | null> {
  const detail = await getPublicJobDetail(id, locale)
  return detail?.job ?? null
}

export async function getPublicJobDetail(
  id: number,
  locale = "ar"
): Promise<PublicJobDetail | null> {
  const endpoints = [`/public/jobs/${id}`, `/jobs/${id}`]

  for (const endpoint of endpoints) {
    try {
      const response = await api.get<unknown>(endpoint, {
        locale,
        cache: "no-store",
      })

      if (!response || typeof response !== "object") continue
      const root = response as Record<string, unknown>
      const payload = root.data ?? response

      if (payload && typeof payload === "object" && !Array.isArray(payload)) {
        const detail = payload as Record<string, unknown>
        const jobRaw = detail.job ?? detail
        const job = normalizeJob(jobRaw, locale)
        if (!job) continue

        const related = extractJobsList(detail.related)
          .map((item) => normalizeJob(item, locale))
          .filter((item): item is Job => item !== null)

        return { job, related }
      }

      const normalized = normalizeJob(payload, locale)
      if (normalized) return { job: normalized, related: [] }
    } catch (err) {
      console.error(err)
      // try next
    }
  }

  return null
}

export async function applyForJob(
  jobId: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.post(`/jobs/${jobId}/apply`, {}, { token, locale })
}

export async function toggleFavorite(
  jobId: number,
  token: string,
  locale = "ar"
): Promise<{ is_favourite: boolean }> {
  const response = await api.post<ApiResponse<{ is_favourite: boolean }>>(
    "/favourite-jobs/toggle",
    { job_id: jobId },
    { token, locale }
  )
  return response.data
}

export async function getFavoriteJobs(
  token: string,
  locale = "ar"
): Promise<Job[]> {
  const response = await api.get<ApiResponse<Job[]>>(
    "/favourite-jobs",
    { token, locale }
  )
  const parsed = parseJobsResponse(response, locale)
  return parsed.data
}
