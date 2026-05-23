import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getAdminStats, getAdminJobs } from "@/lib/api/services/admin.service"
import { AdminDashboardOverview } from "@/features/admin/components/admin-dashboard-overview"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await getSession()
  const t = await getTranslations("Admin.dashboard")

  if (!session.isLoggedIn || !session.user) {
    redirect(`/${locale}/sign-in`)
  }
  if (session.user.role !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const token = session.accessToken!
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
