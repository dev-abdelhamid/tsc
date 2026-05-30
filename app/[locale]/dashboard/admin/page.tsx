import { redirect } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { ApiError } from "@/lib/api/client"
import { getAdminStats, getAdminJobs } from "@/lib/api/services/admin.service"
import { AdminDashboardOverview } from "@/features/admin/components/admin-dashboard-overview"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  const t = await getTranslations("admin")

  if (!session.isLoggedIn || !session.user || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  if (session.user.role !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const token = session.accessToken
  let stats = {
    total_users: 0,
    total_companies: 0,
    total_jobs: 0,
    pending_jobs: 0,
  }
  let pendingJobs: Awaited<ReturnType<typeof getAdminJobs>>["data"] = []

  try {
    stats = await getAdminStats(token, locale)
    const pending = await getAdminJobs(token, "pending", 1, locale)
    pendingJobs = pending.data
  } catch (err) {
    console.error(err)
    if (err instanceof ApiError && err.status === 401) {
      redirect(`/${locale}/sign-in`)
    }
    stats = {
        total_users: 0,
        total_companies: 0,
        total_jobs: 0,
        pending_jobs: 0,
      }
      pendingJobs = []
  }

  return (
    <AdminPageLayout title={t("title")} description={t("description")}>
      <AdminDashboardOverview stats={stats} pendingJobs={pendingJobs} locale={locale} />
    </AdminPageLayout>
  )
}
