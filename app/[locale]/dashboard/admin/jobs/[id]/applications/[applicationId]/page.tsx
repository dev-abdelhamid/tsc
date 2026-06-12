import { redirect, notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getAdminJobById, getAdminJobApplicationById } from "@/lib/api/services/admin.service"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

function formatAppliedAt(value?: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export default async function AdminJobApplicationDetailPage({ params }: { params: Promise<{ locale: string; id: string; applicationId: string }> }) {
  const { locale, id, applicationId } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Admin.jobs")

  const session = await getSession()
  if (!session.isLoggedIn || !session.user || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }
  if (normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  let job: any = null
  let application: any = null

  const token = session.accessToken as string | undefined
  if (!token) redirect(`/${locale}/sign-in`)
  job = await getAdminJobById(Number(id), token, locale)
  application = await getAdminJobApplicationById(Number(id), Number(applicationId), token, locale)

  if (!job || !application) {
    notFound()
  }

  const title = getJobTitle(job, locale)

  const statusMap: Record<string, string> = {
    pending: t("applicationsPage.status.pending"),
    accepted: t("applicationsPage.status.accepted"),
    rejected: t("applicationsPage.status.rejected"),
  }

  return (
    <AdminPageLayout title={`${t("applicationsPage.title")} — ${title}`} description={t("applicationsPage.title")}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Link locale={locale} href={`/dashboard/admin/jobs/${id}/applications`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#006EA8]">← {t("applicationsPage.backToDetail")}</Link>
            <h1 className="mt-3 text-[26px] font-bold text-[#111827] sm:text-[30px]">{t("applicationsPage.title")}</h1>
            <p className="mt-2 text-sm text-[#525252]">{title}</p>
          </div>
          <Link locale={locale} href="/dashboard/admin/jobs" className="rounded-[10px] border border-[#DCEBFF] bg-white px-4 py-2 text-sm font-semibold text-[#006EA8]">{t("applicationsPage.backToJobs")}</Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-[12px] border border-[#E5E7EB] bg-white p-6">
            <h2 className="text-lg font-semibold">{application.user?.name ?? application.user?.first_name ?? application.user?.firstName ?? "—"}</h2>
            <p className="mt-2 text-sm text-[#374151]">{application.user?.email ?? "—"}</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-4">
                <div className="text-sm text-[#6B7280]">{t("applicationsPage.statusLabel")}</div>
                <DashboardStatusBadge status={(application.status || "pending").toString() as any} label={statusMap[(application.status || "pending")] || application.status} />
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-[#6B7280]">{t("applicationsPage.appliedAt")}</div>
                <div className="text-sm text-[#374151]">{formatAppliedAt(application.applied_at)}</div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-[#111827]">CV</h3>
                <div className="mt-2">
                  {application.cv_url ? (
                    <a href={application.cv_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#D1FAE5] px-3 py-1.5 text-xs font-semibold text-[#065F46] hover:bg-[#A7F3D0]">📄 {t("applicationsPage.viewCv")}</a>
                  ) : (
                    <span className="text-sm text-[#9CA3AF]">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[12px] border border-[#E5E7EB] bg-white p-6">
            <h4 className="text-sm font-semibold text-[#111827]">{t("applicationsPage.candidate")}</h4>
            <div className="mt-3 text-sm text-[#374151]">
              <p>{application.user?.name ?? "—"}</p>
              <p className="text-xs text-[#6B7280] mt-1">{application.user?.email ?? "—"}</p>
            </div>
          </aside>
        </div>
      </div>
    </AdminPageLayout>
  )
}
