import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getAdminJobApplications, getAdminJobById } from "@/lib/api/services/admin.service"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { cn } from "@/lib/utils"

function mapStatus(status: string): "pending" | "accepted" | "rejected" {
  if (status === "accepted") return "accepted"
  if (status === "rejected") return "rejected"
  return "pending"
}

function formatAppliedAt(value?: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export async function AdminJobApplicationsPage({
  jobId,
  locale,
  accessToken,
}: {
  jobId: number
  locale: string
  accessToken: string
}) {
  const t = await getTranslations("Admin.jobs")
  const safeT = (key: string, fallback = key) => {
    try {
      return t(key)
    } catch {
      return fallback
    }
  }
  const job = await getAdminJobById(jobId, accessToken, locale)

  if (!job) {
    notFound()
  }

  const { data: applications } = await getAdminJobApplications(jobId, accessToken, 1, locale)
  const title = getJobTitle(job, locale)
  const statusLabels: Record<string, string> = {
    pending: safeT("applicationsPage.status.pending", "Pending"),
    accepted: safeT("applicationsPage.status.accepted", "Accepted"),
    rejected: safeT("applicationsPage.status.rejected", "Rejected"),
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            locale={locale}
            href={`/dashboard/admin/jobs/${jobId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#006EA8]"
          >
            ← {t("applicationsPage.backToDetail")}
          </Link>
          <h1 className="mt-3 text-[26px] font-bold text-[#111827] sm:text-[30px]">
            {t("applicationsPage.title")}
          </h1>
          <p className="mt-2 text-sm text-[#525252]">{title}</p>
        </div>
        <Link
          locale={locale}
          href="/dashboard/admin/jobs"
          className="rounded-[10px] border border-[#DCEBFF] bg-white px-4 py-2 text-sm font-semibold text-[#006EA8]"
        >
          {t("applicationsPage.backToJobs")}
        </Link>
      </div>

      <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)]">
        <div className={cn(
          "border-b border-[#F0F4F8] text-white px-4 py-4",
          locale === "ar" ? "bg-gradient-to-r" : "bg-gradient-to-l",
          "from-[#032C44] to-[#41A0CA]"
        )}>
          <p className="text-sm font-semibold">{t("applicationsPage.summary")}</p>
          <p className="mt-2 text-[24px] font-bold">{applications.length}</p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="flex items-center bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#374151]">
              <div className="w-[25%]">{safeT("applicationsPage.candidate", "Candidate")}</div>
              <div className="w-[18%]">{safeT("applicationsPage.statusLabel", "Status")}</div>
              <div className="w-[20%]">{safeT("applicationsPage.appliedAt", "Applied At")}</div>
              <div className="w-[20%]">{safeT("applicationsPage.email", "Email")}</div>
              <div className="flex-1 text-center">{safeT("applicationsPage.actions", "Actions")}</div>
            </div>

            {applications.length === 0 ? (
              <p className="px-4 py-12 text-center text-sm text-[#525252]">
                {safeT("applicationsPage.empty", "No applications")}
              </p>
            ) : (
              applications.map((application, index) => {
                const appStatus = mapStatus(application.status)
                const cvUrl = application.cv_url
                return (
                  <div
                    key={application.id}
                    className={cn(
                      "flex items-center border-b border-[#F0F4F8] last:border-0",
                      index % 2 === 0 ? "bg-white" : "bg-[#F9FBFD]"
                    )}
                  >
                    <div className="w-[25%] px-4 py-4 text-sm font-semibold text-[#111827]">
                      {application.user?.name ?? safeT("applicationsPage.unknownCandidate", "Unknown")}
                    </div>
                    <div className="w-[18%] px-4 py-4 text-center">
                      <DashboardStatusBadge status={appStatus} label={statusLabels[appStatus]} />
                    </div>
                    <div className="w-[20%] px-4 py-4 text-sm text-[#4B5563]">
                      {formatAppliedAt(application.applied_at)}
                    </div>
                    <div className="w-[20%] px-4 py-4 text-sm text-[#4B5563]">
                      {application.user?.email ?? "—"}
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-2 px-4 py-4">
                      {cvUrl ? (
                        <a
                          href={cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-[#D1FAE5] px-3 py-1.5 text-xs font-semibold text-[#065F46] hover:bg-[#A7F3D0]"
                        >
                          📄 {safeT("applicationsPage.viewCv", "View CV")}
                        </a>
                      ) : (
                        <span className="text-xs text-[#9CA3AF]">—</span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
