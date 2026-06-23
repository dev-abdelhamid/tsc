import type { JobApplication, PaginationMeta } from "@/lib/api/types"

export type CompanyApplication = JobApplication & {
  userPortfolio?: Record<string, unknown>
}

export function readStatNumber(stats: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = stats[key]
    if (value != null && !Number.isNaN(Number(value))) return Number(value)
  }
  return 0
}

export function mapApplicationStatus(status: string): "pending" | "approved" | "rejected" {
  const normalized = String(status || "").trim().toLowerCase()
  if (normalized === "accepted" || normalized === "approved") return "approved"
  if (normalized === "rejected") return "rejected"
  return "pending"
}

export function toApiApplicationStatus(status: "accepted" | "rejected" | "approved"): "approved" | "rejected" {
  return status === "rejected" ? "rejected" : "approved"
}

function unwrapPayload<T>(response: unknown): T | undefined {
  if (!response || typeof response !== "object") return undefined
  const payload = response as { data?: T; items?: T; results?: T }
  if (payload.data !== undefined) return payload.data
  if (payload.items !== undefined) return payload.items
  if (payload.results !== undefined) return payload.results
  return undefined
}

export function extractApplications(response: unknown): CompanyApplication[] {
  let items: unknown[] = []

  if (Array.isArray(response)) {
    items = response
  } else if (response && typeof response === "object") {
    const payload = response as Record<string, unknown>
    if (Array.isArray(payload.data)) items = payload.data
    else if (Array.isArray(payload.items)) items = payload.items
    else if (Array.isArray(payload.results)) items = payload.results
  }

  return items
    .map((item) => normalizeCompanyApplication(item))
    .filter((app): app is CompanyApplication => app.id > 0)
}

export function extractApplicationsMeta(response: unknown, page: number, dataLength: number): PaginationMeta {
  if (response && typeof response === "object" && "meta" in response) {
    const meta = (response as { meta?: PaginationMeta }).meta
    if (meta) return meta
  }

  return {
    current_page: page,
    last_page: 1,
    per_page: 10,
    total: dataLength,
  }
}

export function maskName(name: string): string {
  const clean = name.trim()
  if (!clean) return ""
  const parts = clean.split(/\s+/)
  if (parts.length === 0 || !parts[0]) return ""
  if (parts.length === 1) return parts[0]

  // Mask all name parts after the first one. Limit each masked part to 4 stars
  const maskedParts = parts.slice(1).map((p) => '*'.repeat(Math.min(4, p.length)))
  return `${parts[0]} ${maskedParts.join(' ')}`
}

export function normalizeCompanyApplication(item: unknown): CompanyApplication {
  const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>
  const user = (row.user && typeof row.user === "object" ? row.user : {}) as Record<string, unknown>

  // Discover portfolio from multiple possible keys
  const portfolio =
    (row.userPortfolio && typeof row.userPortfolio === "object" && row.userPortfolio) ||
    (row.user_portfolio && typeof row.user_portfolio === "object" && row.user_portfolio) ||
    (row.portfolio && typeof row.portfolio === "object" && row.portfolio) ||
    (user.portfolio && typeof user.portfolio === "object" && user.portfolio) ||
    {}

  const portfolioRecord = portfolio as Record<string, unknown>

  // Resolve user profile from nested Userprofile OR reconstruct from flat user fields
  const rawProfile =
    (user.Userprofile && typeof user.Userprofile === "object" ? user.Userprofile : null) ||
    (user.userprofile && typeof user.userprofile === "object" ? user.userprofile : null) ||
    (user.profile && typeof user.profile === "object" ? user.profile : null)

  const profileRecord = (rawProfile || {}) as Record<string, unknown>

  // Build a normalized Userprofile that merges nested, flat user-level and portfolio fields
  const normalizedProfile: CompanyApplication["user"]["Userprofile"] = {
    gender: String(
      profileRecord.gender ?? user.gender ?? row.gender ?? portfolioRecord.gender ?? portfolioRecord.sex ?? ""
    ) || null,
    dateOfBirth: String(
      profileRecord.dateOfBirth ??
        profileRecord.date_of_birth ??
        profileRecord.birth_date ??
        user.birth_date ??
        user.date_of_birth ??
        user.dateOfBirth ??
        portfolioRecord.dateOfBirth ??
        portfolioRecord.date_of_birth ??
        portfolioRecord.birth_date ??
        ""
    ) || null,
    maritalStatus: String(
      profileRecord.maritalStatus ??
        profileRecord.marital_status ??
        user.marital_status ??
        user.maritalStatus ??
        portfolioRecord.maritalStatus ??
        portfolioRecord.marital_status ??
        ""
    ) || null,
    firstName: String(profileRecord.firstName ?? profileRecord.first_name ?? user.first_name ?? null) || null,
    lastName: String(profileRecord.lastName ?? profileRecord.last_name ?? user.last_name ?? null) || null,
    categoryId: Number(profileRecord.categoryId ?? profileRecord.category_id ?? user.category_id ?? 0) || null,
    subcategoryId: Number(profileRecord.subcategoryId ?? profileRecord.subcategory_id ?? user.subcategory_id ?? 0) || null,
    categoryName: String(profileRecord.categoryName ?? profileRecord.category_name ?? user.category_name ?? "") || null,
    subcategoryName: String(profileRecord.subcategoryName ?? profileRecord.subcategory_name ?? user.subcategory_name ?? "") || null,
    facebook: String(profileRecord.facebook ?? user.facebook ?? portfolioRecord.facebook ?? "") || null,
    linkedin: String(profileRecord.linkedin ?? user.linkedin ?? portfolioRecord.linkedin ?? "") || null,
    twitterX: String(profileRecord.twitterX ?? profileRecord.twitter_x ?? user.twitterX ?? portfolioRecord.twitterX ?? "") || null,
    pinterest: String(profileRecord.pinterest ?? user.pinterest ?? portfolioRecord.pinterest ?? "") || null,
  }

  const cvUrl =
    String(
      row.cv_url ??
        row.cvUrl ??
        user.cv_url ??
        user.cvUrl ??
        user.resume_url ??
        portfolioRecord.cv ??
        portfolioRecord.cv_url ??
        ""
    ) || undefined

  let resolvedName =
    String(user.name ?? row.applicant_name ?? row.candidate_name ?? "").trim()

  // Try reconstructing from first/last name present in user/profile/portfolio
  if (
    !resolvedName &&
    (user.first_name || profileRecord.firstName || profileRecord.first_name || portfolioRecord.firstName || portfolioRecord.first_name)
  ) {
    const f = String(
      user.first_name ?? profileRecord.firstName ?? profileRecord.first_name ?? portfolioRecord.firstName ?? portfolioRecord.first_name ?? ""
    ).trim()
    const l = String(
      user.last_name ?? profileRecord.lastName ?? profileRecord.last_name ?? portfolioRecord.lastName ?? portfolioRecord.last_name ?? ""
    ).trim()
    resolvedName = `${f} ${l}`.trim()
  }

  // Fallback: try portfolio-level name fields
  if (!resolvedName) {
    const portfolioName = String(
      portfolioRecord.name ?? portfolioRecord.full_name ?? portfolioRecord.fullName ?? ""
    ).trim()
    if (portfolioName) resolvedName = portfolioName
  }

  // Do NOT derive applicant name from CV filename. Keep only server-provided
  // name fields (do not enrich or synthesize from attachments).

  const maskedName = resolvedName ? maskName(resolvedName) : ""

  return {
    id: Number(row.id ?? row.applicationId ?? row.application_id ?? 0),
    job: row.job as JobApplication["job"],
    user: {
      id: Number(user.id ?? 0),
      name: maskedName,
      email: String(user.email ?? ""),
      avatar: user.avatar as string | undefined,
      phone: user.phone as string | undefined,
      city: user.city as CompanyApplication["user"]["city"],
      country: user.country as CompanyApplication["user"]["country"],
      Userprofile: normalizedProfile,
    },
    status: String(row.status ?? "pending") as JobApplication["status"],
    applied_at: String(row.applied_at ?? row.appliedAt ?? row.created_at ?? row.createdAt ?? ""),
    cv_url: cvUrl,
    userPortfolio: portfolioRecord,
  }
}

export function normalizePortfolioShape(portfolio: Record<string, unknown>) {
  const rawEducation =
    (Array.isArray(portfolio.education) && portfolio.education) ||
    (Array.isArray(portfolio.educations) && portfolio.educations) ||
    []

  const rawWorkExperience =
    (Array.isArray(portfolio.workExperience) && portfolio.workExperience) ||
    (Array.isArray(portfolio.work_experience) && portfolio.work_experience) ||
    (Array.isArray(portfolio.experiences) && portfolio.experiences) ||
    []

  const rawSkills =
    (Array.isArray(portfolio.skills) && portfolio.skills) ||
    (Array.isArray(portfolio.skill_set) && portfolio.skill_set) ||
    []

  const rawLanguages =
    (Array.isArray(portfolio.languages) && portfolio.languages) ||
    (Array.isArray(portfolio.langs) && portfolio.langs) ||
    []

  const education = rawEducation.map((item: any) => {
    if (!item || typeof item !== "object") return item
    return {
      id: Number(item.id ?? 0),
      university: String(item.university ?? item.institution ?? ""),
      level_of_education: String(item.level_of_education ?? item.levelOfEducation ?? item.degree ?? ""),
      graduation_year: String(item.graduation_year ?? item.graduationYear ?? ""),
      specialization: String(item.specialization ?? ""),
      final_grade: String(item.final_grade ?? item.finalGrade ?? item.grade ?? ""),
      // Accept many possible keys for the document/attachment URL that may come from different backends
      attachment: String(
        item.attachment ??
          item.document_url ??
          item.documentUrl ??
          item.document ??
          item.file_url ??
          item.file ??
          ""
      ),
    }
  })

  const workExperience = rawWorkExperience.map((item: any) => {
    if (!item || typeof item !== "object") return item
    return {
      id: Number(item.id ?? 0),
      company_name: String(item.company_name ?? item.companyName ?? item.company ?? ""),
      department: String(item.department ?? item.job_title ?? item.jobTitle ?? ""),
      start_date: String(item.start_date ?? item.startDate ?? ""),
      end_date: String(item.end_date ?? item.endDate ?? ""),
      currently_working: item.currently_working !== undefined 
        ? Boolean(item.currently_working) 
        : item.currentlyWorking !== undefined 
          ? Boolean(item.currentlyWorking) 
          : false,
      responsibilities: String(item.responsibilities ?? ""),
      attachment: String(
        item.attachment ??
          item.document_url ??
          item.documentUrl ??
          item.document ??
          item.file_url ??
          item.file ??
          ""
      ),
    }
  })

  const skills = rawSkills.map((item: any) => {
    if (!item || typeof item !== "object") return item
    return {
      id: Number(item.id ?? 0),
      skill_name: String(item.skill_name ?? item.skillName ?? item.name ?? ""),
      // optional attachment on skill objects
      attachment: String(item.attachment ?? item.document_url ?? item.documentUrl ?? item.file_url ?? item.file ?? ""),
    }
  })

  const languages = rawLanguages.map((item: any) => {
    if (!item || typeof item !== "object") return item
    return {
      id: Number(item.id ?? 0),
      language: String(item.language ?? ""),
      level: String(item.level ?? ""),
    }
  })

  const cv = String(portfolio.cv ?? portfolio.cv_url ?? "") || undefined

  return { education, workExperience, skills, languages, cv }
}

export function unwrapCompanyStats(response: unknown) {
  const stats =
    (unwrapPayload<Record<string, unknown>>(response) as Record<string, unknown> | undefined) ||
    ((response && typeof response === "object" ? response : {}) as Record<string, unknown>)

  return {
    total_jobs: readStatNumber(stats, [
      "total_jobs",
      "totalJobs",
      "jobs_count",
      "jobsCount",
      "published_jobs",
      "publishedJobs",
    ]),
    total_applications: readStatNumber(stats, [
      "total_applications",
      "totalApplications",
      "applications_count",
      "applicationsCount",
      "applicants_count",
      "applicantsCount",
      "total_applicants",
      "totalApplicants",
    ]),
    pending_applications: readStatNumber(stats, [
      "pending_applications",
      "pendingApplications",
      "pending_count",
      "pendingCount",
    ]),
  }
}
