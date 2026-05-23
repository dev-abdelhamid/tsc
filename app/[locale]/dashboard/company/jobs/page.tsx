import { redirect } from "next/navigation"
import Image from "next/image"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getSession } from "@/lib/session"
import { getCompanyJobs } from "@/lib/api/services/company.service"
import { CompanyJobActionsMenu } from "@/features/company-jobs/components/company-job-actions-menu"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { PrimaryButton } from "@/components/ui/primary-button"
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
    const res = await getCompanyJobs(session.accessToken, 1, locale)
    jobs = res.data
  } catch (err) {
    console.error(err)
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
    <div className="flex w-full flex-col gap-6" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[8px] bg-white p-6 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:p-8">
          <h1 className="bg-gradient-to-l from-[#032C44] to-[#41A0CA] bg-clip-text text-[24px] font-bold leading-[1.16] text-transparent">
            {t("listTitle")}
          </h1>
          <PrimaryButton asChild className="h-9 rounded-lg px-4 text-sm">
            <Link href="/dashboard/company/jobs/create">{t("addJob")}</Link>
          </PrimaryButton>
        </div>

        <div className="overflow-hidden rounded-[8px] bg-white p-4 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:p-6">
          {jobs.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="mb-4 text-[#525252]">{t("empty")}</p>
              <PrimaryButton asChild className="h-9 rounded-lg px-4 text-sm">
                <Link href="/dashboard/company/jobs/create">{t("addJob")}</Link>
              </PrimaryButton>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[8px]">
              <div className="flex min-w-[914px] items-center rounded-t-[8px] bg-gradient-to-l from-[#032C44] to-[#41A0CA] text-white">
                <div className="w-[30%] shrink-0 px-2 py-2 text-base font-normal">
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
                <div className="flex flex-1 justify-end px-2 py-2 text-base font-normal">
                  {t("columns.actions")}
                </div>
              </div>

              <div className="min-w-[914px] rounded-b-[8px] border border-t-0 border-[#E8F2FF]">
                {jobs.map((job, index) => {
                  const badgeStatus = mapJobStatus(job.status)
                  const deadline = job.application_deadline
                    ? new Date(job.application_deadline).toLocaleDateString("en-GB")
                    : "—"

                  return (
                    <div
                      key={job.id}
                      className={cn(
                        "flex items-center border-b border-[#F0F4F8] last:border-0",
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-gradient-to-l from-[#032C44]/10 to-[#41A0CA]/10"
                      )}
                    >
                      <div className="flex w-[30%] shrink-0 items-center gap-2 px-2 py-3 text-base font-medium text-[#262626]">
                        <Image
                          src="/dashboard/jobs.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-4 w-4 shrink-0"
                          aria-hidden
                        />
                        <Link
                          href={`/dashboard/company/jobs/${job.id}`}
                          className="truncate hover:text-[#006EA8] hover:underline"
                        >
                          {getJobTitle(job, locale)}
                        </Link>
                      </div>
                      <div className="flex w-[18%] justify-center px-2 py-3 text-base text-[#262626]">
                        <Link
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
                      <div className="flex flex-1 justify-end px-2 py-3">
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
      </div>
    )
}
