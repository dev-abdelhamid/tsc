import { redirect } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getAdminJobs } from "@/lib/api/services/admin.service"
import type { Job } from "@/lib/api/types"
import { AdminJobsPanel } from "@/features/admin/components/admin-jobs-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

const VALID_TABS = ["pending", "approved", "rejected", "all"] as const

type Tab = (typeof VALID_TABS)[number]

export default async function AdminJobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const { status: statusParam } = await searchParams
  const session = await getSession()
  const t = await getTranslations("Admin.jobs")

  if (!session.user || session.user.role !== "admin" || !session.accessToken) {
    redirect(`/${locale}/dashboard`)
  }

  const token = session.accessToken
  const statuses = ["pending", "approved", "active", "rejected"] as const
  let jobs: Job[] = []

  try {
    const batches = await Promise.all(
      statuses.map((s) => getAdminJobs(token, s, 1, locale).then((r) => r.data).catch(() => []))
    )
    const seen = new Set<number>()
    for (const batch of batches) {
      for (const job of batch) {
        if (!seen.has(job.id)) {
          seen.add(job.id)
          jobs.push(job)
        }
      }
    }
    // Debug: Log first job to check salary fields
    if (jobs.length > 0) {
      console.log("[AdminJobsPage] First job salary data:", {
        id: jobs[0].id,
        salary_from: jobs[0].salary_from,
        salary_to: jobs[0].salary_to,
        has_salary: jobs[0].salary_from != null && jobs[0].salary_to != null,
      })
    }
  } catch (err) {
    console.error(err)
    jobs = []
  }

  const initialTab: Tab =
    statusParam && VALID_TABS.includes(statusParam as Tab) ? (statusParam as Tab) : "all"

  return (
    <AdminPageLayout title={t("title")} description={t("description")}>
      <AdminJobsPanel jobs={jobs} locale={locale} initialTab={initialTab} />
    </AdminPageLayout>
  )
}
