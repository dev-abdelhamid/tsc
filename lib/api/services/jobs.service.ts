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

function pickLocalizedString(value: unknown, locale = "ar"): string {
  if (typeof value === "string") return value
  if (!value || typeof value !== "object") return ""

  const map = value as Record<string, unknown>
  const priority = [locale, "ar", "en", "de"]

  for (const key of priority) {
    const candidate = map[key]
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim()
  }

  for (const candidate of Object.values(map)) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim()
  }

  return ""
}

function pickLocalizedField(
  row: Record<string, unknown>,
  field: string,
  locale = "ar"
): string | undefined {
  const direct = pickLocalizedString(row[field], locale)
  if (direct) return direct

  const priority = [`${field}_${locale}`, `${field}${locale}`]
  const fallbacks = [`${field}_ar`, `${field}_en`, `${field}_de`, `${field}ar`, `${field}en`, `${field}de`]

  for (const key of priority) {
    const value = row[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }

  for (const key of fallbacks) {
    const value = row[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }

  return undefined
}

function normalizeNestedValue<T extends { name?: string }>(
  raw: unknown,
  locale: string
): T | undefined {
  if (!raw || typeof raw !== "object") return undefined
  const row = raw as Record<string, unknown>
  const name = pickLocalizedField(row, "name", locale) || ""
  return { ...row, name } as T
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

export function normalizeJob(item: unknown, locale: string): Job | null {
  if (!item || typeof item !== "object") return null
  const row = item as Record<string, unknown>
  const id = Number(row.id)
  if (!Number.isFinite(id) || id <= 0) return null

  // Always resolve to a localized string – never keep a {ar,en,de} object as-is
  const title: string | undefined =
    pickLocalizedField(row, "title", locale) ||
    pickLocalizedString(row.title, locale) ||
    pickLocalizedField(row, "name", locale) ||
    (typeof row.title === "string" ? row.title : undefined) ||
    (typeof row.name === "string" ? row.name : undefined)

  const description: string | undefined =
    pickLocalizedField(row, "description", locale) ||
    pickLocalizedString(row.description, locale) ||
    pickLocalizedField(row, "content", locale) ||
    (typeof row.description === "string" ? row.description : undefined)

  const requirements: string | undefined =
    pickLocalizedField(row, "requirements", locale) ||
    pickLocalizedString(row.requirements, locale) ||
    (typeof row.requirements === "string" ? row.requirements : undefined)

  const responsibilities: string | undefined =
    pickLocalizedField(row, "responsibilities", locale) ||
    pickLocalizedString(row.responsibilities, locale) ||
    (typeof row.responsibilities === "string" ? row.responsibilities : undefined)

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
    title: title ?? getJobTitle({ title: String(row.name || "") }, locale),
    description,
    requirements,
    responsibilities,
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
    city: normalizeNestedValue(row.city, locale) as Job["city"],
    country: normalizeNestedValue(row.country, locale) as Job["country"],
    category: normalizeNestedValue(row.category, locale) as Job["category"],
    sub_category: normalizeNestedValue(row.sub_category ?? row.subCategory, locale) as Job["sub_category"],
    company: (() => {
      if (!row.company || typeof row.company !== "object") {
        return row.company as unknown as Job["company"]
      }
      const company = normalizeNestedValue(row.company, locale) as Record<string, unknown>
      if (company.company_type && typeof company.company_type === "object") {
        company.company_type = normalizeNestedValue(company.company_type, locale)
      }
      if (company.country && typeof company.country === "object") {
        company.country = normalizeNestedValue(company.country, locale)
      }
      if (company.city && typeof company.city === "object") {
        company.city = normalizeNestedValue(company.city, locale)
      }
      return company as unknown as Job["company"]
    })(),
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
        next: { revalidate: 60 },
        timeout: 15000, // Increase timeout for slow jobs endpoint
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
      { locale, next: { revalidate: 60 }, timeout: 15000 }
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
        next: { revalidate: 60 },
        timeout: 20000, // Increase timeout to 20 seconds for slow API
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
  const response = await api.post<any>(
    "/favourite-jobs/toggle",
    { job_id: jobId },
    { token, locale }
  )
  const message = response?.message || ""
  const isAdded = message.includes("إضافة") || message.toLowerCase().includes("add") || message.toLowerCase().includes("saved")
  return { is_favourite: isAdded }
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
