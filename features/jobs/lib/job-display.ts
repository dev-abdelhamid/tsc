import type { Job } from "@/lib/api/types"

export function getJobTitle(job: Pick<Job, "title">, locale: string): string {
  const { title } = job
  if (typeof title === "string") return title
  if (title && typeof title === "object") {
    return title[locale] || title.en || title.ar || title.de || ""
  }
  return ""
}

const GENDER_ONLY_VALUES = new Set([
  "male",
  "female",
  "all",
  "m",
  "f",
  "ذكر",
  "أنثى",
  "انثى",
])

function isGenderOnlyValue(value: string): boolean {
  return GENDER_ONLY_VALUES.has(value.trim().toLowerCase())
}

export function formatJobSalary(
  job: Pick<Job, "salary_from" | "salary_to">,
  periodLabel: string
): string {
  const from = job.salary_from
  const to = job.salary_to
  if (from != null && to != null) {
    return `$${from} – $${to}${periodLabel}`
  }
  if (from != null) return `$${from}${periodLabel}`
  if (to != null) return `$${to}${periodLabel}`
  return "—"
}

/** Sidebar / hero salary block — e.g. "$1000 - $1200" */
export function formatJobSalaryRange(job: Pick<Job, "salary_from" | "salary_to">): string {
  const from = job.salary_from
  const to = job.salary_to
  if (from != null && to != null) return `$${from} - $${to}`
  if (from != null) return `$${from}`
  if (to != null) return `$${to}`
  return "—"
}

/** Shown on listing cards — never Male/Female, only employment type. */
export function formatJobEmploymentForCard(
  value?: string,
  fallback = "Full-time"
): string {
  if (!value?.trim() || isGenderOnlyValue(value)) return fallback
  return value.trim()
}

export function formatDetailEmployment(
  job: Pick<Job, "employment_type" | "gender">,
  fallback = "Full-time"
): string | null {
  if (job.employment_type?.trim()) return job.employment_type.trim()
  if (job.gender?.trim() && !isGenderOnlyValue(job.gender)) {
    return job.gender.trim()
  }
  return null
}

export function formatPostedLabel(
  job: Pick<Job, "created_at" | "created_at_human">,
  locale: string,
  relativeFallback: string
): string {
  if (job.created_at_human?.trim()) return job.created_at_human.trim()
  return formatPostedAgo(job.created_at, locale, relativeFallback)
}

export function formatJobType(
  gender?: string,
  employmentType?: string
): string {
  if (employmentType?.trim()) return employmentType
  return formatJobEmploymentForCard(gender)
}

export function formatGenderForDetail(gender?: string, fallback = "All"): string {
  if (!gender?.trim()) return fallback
  if (isGenderOnlyValue(gender)) {
    const normalized = gender.trim()
    if (/male|m|ذكر/i.test(normalized)) return "Male"
    if (/female|f|أنثى|انثى/i.test(normalized)) return "Female"
    return "All"
  }
  return fallback
}

export function formatAgeRange(
  job: Pick<Job, "age_from" | "age_to">,
  fallback = "—"
): string {
  const { age_from: from, age_to: to } = job
  if (from != null && to != null) return `${from} - ${to}`
  if (from != null) return `${from}+`
  if (to != null) return `≤ ${to}`
  return fallback
}

export function formatApplicationDeadline(
  deadline?: string,
  locale = "en"
): string {
  if (!deadline) return "—"
  const date = new Date(deadline)
  if (Number.isNaN(date.getTime())) return deadline
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG-u-nu-latn" : locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

const RELATIVE_LOCALE: Record<string, string> = {
  ar: "ar",
  en: "en",
  de: "de",
}

export function formatPostedAgo(
  createdAt: string | undefined,
  locale: string,
  fallback: string
): string {
  if (!createdAt) return fallback
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return fallback

  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  const intlLocale = RELATIVE_LOCALE[locale] ?? "en"
  if (diffHours < 1) {
    return new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" }).format(
      -Math.max(1, Math.floor(diffMs / (1000 * 60))),
      "minute"
    )
  }
  if (diffHours < 48) {
    return new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" }).format(
      -diffHours,
      "hour"
    )
  }
  return new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" }).format(
    -diffDays,
    "day"
  )
}

export function salaryFromSliderPercent(percent: number): number {
  return Math.round((percent / 100) * 10000)
}

/** Latin digits only — avoids SSR/client hydration mismatch on Arabic pages. */
export function formatFilterSalaryAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)
}