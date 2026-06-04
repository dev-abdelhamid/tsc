import { redirect } from "next/navigation"
import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getSession, withTokenRefresh } from "@/lib/session"
import { getCompanyJobs } from "@/lib/api/services/company.service"
import { CompanyJobActionsMenu } from "@/features/company-jobs/components/company-job-actions-menu"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { PrimaryButton } from "@/components/ui/primary-button"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"
import { ApiError } from "@/lib/api/client"
import { cn } from "@/lib/utils"

function mapJobStatus(status: string): "pending" | "approved" | "rejected" {
  if (status === "approved" || status === "active") return "approved"
  if (status === "rejected") return "rejected"
  return "pending"
}

export default async function CompanyJobsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("CompanyJobs")
  const session = await getSession()
  const isRtl = locale === "ar"

  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  if (session.user?.role !== "company") {
    redirect(`/${locale}/dashboard`)
  }

  const statusLabels: Record<string, string> = {
    pending: t("status.pending"),
    approved: t("status.approved"),
    rejected: t("status.rejected"),
    stopped: t("status.stopped"),
  }

  let jobs: Awaited<ReturnType<typeof getCompanyJobs>>["data"] | null = null
  try {
    const res = await withTokenRefresh(session, locale, (token) =>
      getCompanyJobs(token, 1, locale)
    )
    jobs = res.data
  } catch (err) {
    console.error(err)
    if (err instanceof ApiError && err.status === 401) {
      redirect(`/${locale}/sign-in`)
    }
    jobs = null
  }

  if (jobs === null) {
    return (
      <div className="p-6">
        <p className="text-[#FF2D55]">{t("loadError")}</p>
      </div>
    )
  }

  return (
    <DashboardPageShell
      title={t("listTitle")}
      isRTL={isRtl}
      action={
        <PrimaryButton asChild className="h-9 rounded-lg px-4 w-auto text-sm">
          <Link locale={locale} href="/dashboard/company/jobs/create">{t("addJob")}</Link>
        </PrimaryButton>
      }
    >
      <div className="overflow-hidden rounded-[8px] bg-white p-4 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:p-6">
        {jobs.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="mb-4 text-[#525252]">{t("empty")}</p>
            <PrimaryButton asChild className="h-9 rounded-lg px-4 text-sm">
              <Link locale={locale} href="/dashboard/company/jobs/create">{t("addJob")}</Link>
            </PrimaryButton>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[8px]">
            {/* Table header - تدرج معكوس في RTL */}
            <div
              className={cn(
                "flex min-w-[914px] items-center rounded-t-[8px] text-white",
                isRtl
                  ? "bg-gradient-to-r from-[#032C44] to-[#41A0CA]" // RTL: من اليسار إلى اليمين
                  : "bg-gradient-to-l from-[#032C44] to-[#41A0CA]" // LTR: من اليمين إلى اليسار
              )}
            >
              <div className={"w-[30%] shrink-0 px-2 py-2 text-base font-normal"}>
                {t("columns.title")}
              </div>
              <div className="flex w-[18%] justify-center px-2 py-2 text-base font-normal">
                {t("columns.applications")}
              </div>
              <div className="flex w-[18%] justify-center px-2 py-2 text-base font-normal">
                {t("columns.deadline")}
              </div>
              <div className="flex w-[18%] justify-center px-2 py-2 text-base font-normal">
                {t("columns.status")}
              </div>
              <div className={"flex flex-1 px-2 py-2 text-base font-normal justify-center "}>
                {t("columns.actions")}
              </div>
            </div>

            {/* Table body - تدرج معكوس في RTL للصفوف المخططة */}
            <div className="min-w-[914px] rounded-b-[8px] border border-t-0 border-[#E8F2FF]">
              {jobs.map((job, index) => {
                const badgeStatus = mapJobStatus(job.status)
                const deadline = job.application_deadline
                  ? new Date(job.application_deadline).toLocaleDateString(isRtl ? "ar-EG" : "en-GB")
                  : "—"

                return (
                  <div
                    key={job.id}
                    className={cn(
                      "flex items-center border-b border-[#F0F4F8] last:border-0",
                      index % 2 === 0
                        ? "bg-white"
                        : isRtl
                          ? "bg-gradient-to-r from-[#032C44]/10 to-[#41A0CA]/10" // RTL: تدرج معكوس
                          : "bg-gradient-to-l from-[#032C44]/10 to-[#41A0CA]/10" // LTR: تدرج عادي
                    )}
                  >
                    <div className={cn("flex w-[30%] shrink-0 items-center gap-2 px-2 py-3 text-base font-medium text-[#262626]")}>
                      <Image
                        src="/dashboard/jobs.svg"
                        alt=""
                        width={16}
                        height={16}
                        className="h-4 w-4 shrink-0"
                        aria-hidden
                      />
                      <Link
                        locale={locale}
                        href={`/dashboard/company/jobs/${job.id}`}
                        className={cn("truncate hover:text-[#006EA8] hover:underline justify-start ")}
                      >
                        {getJobTitle(job, locale)}
                      </Link>
                    </div>
                    <div className="flex w-[18%] justify-center px-2 py-3 text-base text-[#262626]">
                      <Link
                        locale={locale}
                        href={`/dashboard/company/jobs/${job.id}/applications`}
                        className="font-semibold text-[#006EA8] hover:underline"
                      >
                        {job.applications_count ?? 0}
                      </Link>
                    </div>
                    <div className="flex w-[18%] justify-center px-2 py-3 text-base text-[#262626]">
                      {deadline}
                    </div>
                    <div className="flex w-[18%] justify-center px-2 py-3">
                      <DashboardStatusBadge
                        status={badgeStatus}
                        label={statusLabels[job.status] ?? job.status}
                      />
                    </div>
                    <div className={"flex flex-1 px-2 py-3 justify-center "}>
                      <CompanyJobActionsMenu
                        jobId={job.id}
                        locale={locale}
                        status={job.status}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardPageShell>
  )
}