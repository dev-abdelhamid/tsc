import { getLocale, getTranslations } from "next-intl/server"
import { getCategoriesForForm } from "@/lib/api/services/categories.service"
import { getJobsForLocale } from "@/features/jobs/lib/jobs-for-locale"
import { JobsSectionClient } from "@/features/jobs/components/jobs-section-client"

export async function JobsSection() {
  const locale = await getLocale()
  const t = await getTranslations("Landing.jobs")

  const [{ jobs }, categories] = await Promise.all([
    getJobsForLocale(locale, t, { per_page: 12 }),
    getCategoriesForForm(locale),
  ])

  return <JobsSectionClient jobs={jobs} categories={categories} />
}
