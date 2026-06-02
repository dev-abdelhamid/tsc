import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getSession } from "@/lib/session"
import { getMyApplicationDetail } from "@/lib/api/services/user.service"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function formatDate(date: string | undefined, locale: string) {
  if (!date) return "—"
  try {
    const formatter =
      locale === "ar"
        ? new Intl.DateTimeFormat("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : locale === "de"
          ? new Intl.DateTimeFormat("de-DE", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : new Intl.DateTimeFormat("en-GB", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })

    return formatter.format(new Date(date))
  } catch {
    return "—"
  }
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const session = await getSession()
  const isAr = locale === "ar"

  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  const applicationId = Number(id)
  if (!Number.isFinite(applicationId) || applicationId <= 0) {
    redirect(`/${locale}/dashboard/user/applications`)
  }

  const application = await getMyApplicationDetail(session.accessToken, applicationId, locale as "ar" | "en" | "de").catch(
    () => null
  )

  if (!application) {
    redirect(`/${locale}/dashboard/user/applications`)
  }

  const labels = {
    title: isAr ? "تفاصيل الطلب" : "Application Details",
    jobTitle: isAr ? "عنوان الوظيفة" : "Job Title",
    company: isAr ? "الشركة" : "Company",
    status: isAr ? "الحالة" : "Status",
    appliedOn: isAr ? "تاريخ التقديم" : "Applied On",
    cvUrl: isAr ? "السيرة الذاتية" : "CV",
    backToApplications: isAr ? "العودة إلى الطلبات" : "Back to Applications",
    viewJob: isAr ? "عرض الوظيفة" : "View Job",
    download: isAr ? "تحميل" : "Download",
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  }

  const statusLabels: Record<string, string> = {
    pending: isAr ? "معلق" : "Pending",
    accepted: isAr ? "مقبول" : "Accepted",
    rejected: isAr ? "مرفوض" : "Rejected",
  }

  const jobTitle = getJobTitle(application.job, locale as "ar" | "en" | "de")
  const companyName = application.job?.company?.name || "—"

  return (
    <DashboardPageShell title={labels.title} description={""}>
      <div className="w-full space-y-6">
        {/* Back Link */}
        <Link
          href="/dashboard/user/applications"
          className="inline-flex items-center gap-2 text-[#006EA8] hover:text-[#004580] transition"
        >
          <span aria-hidden>{isAr ? "→" : "←"}</span>
          {labels.backToApplications}
        </Link>

        {/* Application Details Card */}
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-[#E5E7EB] pb-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-[#111827]">{jobTitle}</h1>
                <p className="text-lg text-[#6B7280]">{companyName}</p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#6B7280]">{labels.status}:</span>
                <Badge className={`${statusColors[application.status]} rounded-full px-3 py-1`}>
                  {statusLabels[application.status]}
                </Badge>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-[#6B7280]">{labels.appliedOn}</p>
                <p className="mt-1 text-lg text-[#111827]">
                  {formatDate(application.applied_at, locale)}
                </p>
              </div>

              {application.cv_url && (
                <div>
                  <p className="text-sm font-medium text-[#6B7280]">{labels.cvUrl}</p>
                  <a
                    href={application.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-2 text-[#006EA8] hover:text-[#004580] transition"
                  >
                    <span>📄</span>
                    {labels.download}
                  </a>
                </div>
              )}
            </div>

            {/* Job Details Section */}
            {application.job && (
              <div className="border-t border-[#E5E7EB] pt-6">
                <h2 className="mb-4 text-lg font-semibold text-[#111827]">
                  {isAr ? "تفاصيل الوظيفة" : "Job Details"}
                </h2>
                <div className="space-y-3">
                  {application.job.location && (
                    <div>
                      <p className="text-sm text-[#6B7280]">{isAr ? "الموقع" : "Location"}</p>
                      <p className="text-[#111827]">{application.job.location}</p>
                    </div>
                  )}
                  {application.job.employment_type && (
                    <div>
                      <p className="text-sm text-[#6B7280]">
                        {isAr ? "نوع التوظيف" : "Employment Type"}
                      </p>
                      <p className="text-[#111827]">{application.job.employment_type}</p>
                    </div>
                  )}
                  {application.job.salary_from && (
                    <div>
                      <p className="text-sm text-[#6B7280]">{isAr ? "الراتب" : "Salary"}</p>
                      <p className="text-[#111827]">
                        {application.job.salary_from}
                        {application.job.salary_to && ` - ${application.job.salary_to}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 border-t border-[#E5E7EB] pt-6 sm:flex-row">
              <Link href={`/jobs/${application.job?.id}`}>
                <Button className="w-full bg-[#006EA8] text-white hover:bg-[#005080] sm:w-auto">
                  {labels.viewJob}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardPageShell>
  )
}
