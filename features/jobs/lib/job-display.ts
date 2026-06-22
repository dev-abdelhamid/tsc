import type { Job } from "@/lib/api/types"

export function getLocalizedName(value: any, locale: string): string {
  if (!value) return ""
  if (typeof value === "string") {
    if (value.startsWith("{") && value.endsWith("}")) {
      try {
        const parsed = JSON.parse(value)
        return parsed[locale] || parsed.ar || parsed.en || parsed.de || value
      } catch {
        return value
      }
    }
    return value
  }
  if (value && typeof value === "object") {
    return value[locale] || value.ar || value.en || value.de || ""
  }
  return String(value)
}

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
  periodLabel: string,
  isRTL = false
): string {
  const from = job.salary_from
  const to = job.salary_to
  if (from != null && to != null) {
    return isRTL ? `$${to} – $${from}${periodLabel}` : `$${from} – $${to}${periodLabel}`
  }
  if (from != null) return `$${from}${periodLabel}`
  if (to != null) return `$${to}${periodLabel}`
  return "—"
}

/** Sidebar / hero salary block — e.g. "$1000 - $1200" */
export function formatJobSalaryRange(job: Pick<Job, "salary_from" | "salary_to">, isRTL = false): string {
  const from = job.salary_from
  const to = job.salary_to
  if (from != null && to != null) {
    return isRTL ? `$${to} - $${from}` : `$${from} - $${to}`
  }
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
  locale = "ar"
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
  if (job.created_at_human?.trim()) {
    return job.created_at_human.trim()
  }
  return formatPostedAgo(job.created_at, locale, relativeFallback)
}

export function formatJobType(
  gender?: string,
  employmentType?: string
): string {
  if (employmentType?.trim()) return employmentType
  return formatJobEmploymentForCard(gender)
}

export function formatGenderForDetail(gender?: string, locale = "ar"): string {
  const fallback = locale === "ar" ? "الكل" : locale === "de" ? "Alle" : "All"
  if (!gender?.trim()) return fallback
  if (isGenderOnlyValue(gender)) {
    const normalized = gender.trim()
    if (/male|m|ذكر/i.test(normalized)) return locale === "ar" ? "ذكر" : locale === "de" ? "Männlich" : "Male"
    if (/female|f|أنثى|انثى/i.test(normalized)) return locale === "ar" ? "أنثى" : locale === "de" ? "Weiblich" : "Female"
    return fallback
  }
  return fallback
}

export function formatAgeRange(
  job: Pick<Job, "age_from" | "age_to">,
  locale = "ar"
): string {
  const from = job.age_from && job.age_from > 0 ? job.age_from : null
  const to = job.age_to && job.age_to > 0 ? job.age_to : null
  const suffix = locale === "ar" ? " سنة" : locale === "de" ? " Jahre" : " years"
  if (from != null && to != null) return `${from} - ${to}${suffix}`
  if (from != null) return `+${from}${suffix}`
  if (to != null) return `≤ ${to}${suffix}`
  return "—"
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

const STATE_TRANSLATIONS: Record<string, Record<string, string>> = {
  "Baden-Württemberg": {
    en: "Baden-Württemberg",
    ar: "بادن-فورتمبيرغ",
    de: "Baden-Württemberg",
  },
  "Bayern": {
    en: "Bavaria",
    ar: "بايرن",
    de: "Bayern",
  },
  "Berlin": {
    en: "Berlin",
    ar: "برلين",
    de: "Berlin",
  },
  "Brandenburg": {
    en: "Brandenburg",
    ar: "براندنبورغ",
    de: "Brandenburg",
  },
  "Bremen": {
    en: "Bremen",
    ar: "بريمن",
    de: "Bremen",
  },
  "Hamburg": {
    en: "Hamburg",
    ar: "هامبورغ",
    de: "Hamburg",
  },
  "Hessen": {
    en: "Hesse",
    ar: "هسن",
    de: "Hessen",
  },
  "Mecklenburg-Vorpommern": {
    en: "Mecklenburg-Western Pomerania",
    ar: "مكلنبورغ-فوربومرن",
    de: "Mecklenburg-Vorpommern",
  },
  "Niedersachsen": {
    en: "Lower Saxony",
    ar: "سكسونيا السفلى",
    de: "Niedersachsen",
  },
  "Nordrhein-Westfalen": {
    en: "North Rhine-Westphalia",
    ar: "شمال الراين-وستفاليا",
    de: "Nordrhein-Westfalen",
  },
  "Rheinland-Pfalz": {
    en: "Rhineland-Palatinate",
    ar: "راينلند بالاتينات",
    de: "Rheinland-Pfalz",
  },
  "Saarland": {
    en: "Saarland",
    ar: "سارلاند",
    de: "Saarland",
  },
  "Sachsen": {
    en: "Saxony",
    ar: "سكسونيا",
    de: "Sachsen",
  },
  "Sachsen-Anhalt": {
    en: "Saxony-Anhalt",
    ar: "سكسونيا-آنهالت",
    de: "Sachsen-Anhalt",
  },
  "Schleswig-Holstein": {
    en: "Schleswig-Holstein",
    ar: "شليسفيغ-هولشتاين",
    de: "Schleswig-Holstein",
  },
  "Thüringen": {
    en: "Thuringia",
    ar: "تورينغن",
    de: "Thüringen",
  },
}

export function getLocalizedStateName(state: string, locale: string): string {
  if (!state) return ""
  const match = STATE_TRANSLATIONS[state]
  if (match) {
    return match[locale] || match.en || state
  }
  return state
}