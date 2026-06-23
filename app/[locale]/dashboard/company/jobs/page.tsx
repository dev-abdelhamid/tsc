import { redirect } from "next/navigation"
import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { enrichJobsWithApplicationCounts, getCompanyJobs } from "@/lib/api/services/company.service"
import type { Job } from "@/lib/api/types"
import { CompanyJobActionsMenu } from "@/features/company-jobs/components/company-job-actions-menu"
import ActivateJobButton from "@/features/company-jobs/components/activate-job-button.client"
import { formatApplicationDeadline, resolveJobApplicationDeadline } from "@/features/jobs/lib/job-display"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { getCompanyLogo } from "@/features/jobs/lib/job-display"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { PrimaryButton } from "@/components/ui/primary-button"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"
import { ApiError } from "@/lib/api/client"
import { cn } from "@/lib/utils"

function mapJobStatus(status: string): "pending" | "approved" | "rejected" | "stopped" {
  if (status === "approved" || status === "active") return "approved"
  if (status === "rejected") return "rejected"
  if (status === "stopped") return "stopped"
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
  // Allow development impersonation via cookie `impersonate=company`
  let isImpersonatingCompany = false
  if (!session.isLoggedIn || !session.accessToken) {
    if (process.env.NODE_ENV !== "production") {
      try {
        const { cookies } = await import("next/headers")
        const cookieStore = await cookies()
        const imp = cookieStore.get("impersonate")?.value
        if (imp && String(imp).toLowerCase() === "company") {
          isImpersonatingCompany = true
        } else {
          redirect(`/${locale}/sign-in`)
        }
      } catch {
        redirect(`/${locale}/sign-in`)
      }
    } else {
      redirect(`/${locale}/sign-in`)
    }
  }

  if (!isImpersonatingCompany && normalizeRole(session.user) !== "company") {
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
    const token = session.accessToken as string | undefined
    // If impersonating in dev, return mocked jobs without calling upstream
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const imp = cookieStore.get("impersonate")?.value
    if (imp && String(imp).toLowerCase() === "company") {
      jobs = [
        { id: 20, title: { ar: "تطوير الويب" }, status: "approved", applications_count: 12, created_at: new Date().toISOString(), application_deadline: "2027-12-31" },
        { id: 21, title: { ar: "تصميم واجهات" }, status: "approved", applications_count: 3, created_at: new Date().toISOString(), application_deadline: "2027-12-31" },
      ] as Job[]
    } else {
      if (!token) redirect(`/${locale}/sign-in`)
      const res = await getCompanyJobs(token, 1, locale)
      jobs = await enrichJobsWithApplicationCounts(res.data, token, locale)
    }
  } catch (err) {
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
      <div className="overflow-hidden rounded-[8px] shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] ">
        {jobs.length === 0 ? (
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
            <div className="flex justify-center mb-6">
              <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
                <rect x="8" y="20" width="80" height="60" rx="8" fill="#E0F0FF" stroke="#41A0CA" strokeWidth="2"/>
                <rect x="32" y="8" width="32" height="20" rx="4" fill="#41A0CA" opacity="0.5"/>
                <line x1="24" y1="44" x2="72" y2="44" stroke="#41A0CA" strokeWidth="3" strokeLinecap="round"/>
                <line x1="24" y1="56" x2="60" y2="56" stroke="#41A0CA" strokeWidth="3" strokeLinecap="round"/>
                <line x1="24" y1="68" x2="52" y2="68" stroke="#41A0CA" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="76" cy="68" r="12" fill="#032C44" opacity="0.12"/>
                <path d="M76 63v10M71 68h10" stroke="#032C44" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-[#525252] font-medium text-[15px]">{t("empty")}</p>
            <p className="text-gray-400 text-sm mt-1">{isRtl ? "أضف وظيفتك الأولى من الزر أعلاه" : "Add your first job using the button above"}</p>
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
                const rawDeadline = resolveJobApplicationDeadline(job)
                const deadline = formatApplicationDeadline(rawDeadline, locale)

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
                      {(() => {
                        const logo = getCompanyLogo(job.company)
                        return logo ? (
                          <Avatar size="sm" className="overflow-hidden">
                            <AvatarImage src={logo} alt={getJobTitle(job, locale)} />
                          </Avatar>
                        ) : (
                          <Image
                            src="/dashboard/jobs.svg"
                            alt=""
                            width={16}
                            height={16}
                            className="h-4 w-4 shrink-0"
                            aria-hidden
                          />
                        )
                      })()}
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
                    <div className={"flex flex-1 px-2 py-3 justify-center gap-2 items-center "}>
                      <CompanyJobActionsMenu
                        jobId={job.id}
                        locale={locale}
                        status={job.status}
                      />
                      {/* Show activate button for stopped/closed jobs for faster action */}
                      {(() => {
                        const s = String(job.status)
                        return (s === "stopped" || s === "closed") ? (
                          <ActivateJobButton jobId={job.id} locale={locale} />
                        ) : null
                      })()}
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