import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getSession } from "@/lib/session"
import { getMyApplicationDetail } from "@/lib/api/services/user.service"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { cn } from "@/lib/utils"

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

  let application: any = null
  try {
    application = await getMyApplicationDetail(
      session.accessToken,
      applicationId,
      locale as "ar" | "en" | "de"
    )
  } catch (err) {
    console.error("[ApplicationDetail] fetch error:", err)
  }

  if (!application) {
    // Show a not-found state instead of hard redirect
    const gradientClasses = cn(
      "bg-clip-text text-transparent font-bold",
      isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
      "from-[#032C44] to-[#41A0CA]"
    )

    return (
      <div className="flex w-full flex-col gap-6 text-start">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[8px] bg-white p-6 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:p-8">
          <div className="min-w-0 flex-1">
            <h1 className={cn("text-[24px] leading-relaxed py-1", gradientClasses)}>
              {isAr ? "تفاصيل الطلب" : "Application Details"}
            </h1>
          </div>
        </div>
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
          <img src="/portfolio/drop.svg" alt="" className="w-16 h-16 mx-auto opacity-40 mb-4" />
          <p className="text-gray-500 font-medium">
            {isAr ? "لم يتم العثور على هذا الطلب" : "Application not found"}
          </p>
          <Link
            href="/dashboard/user/applications"
            className="inline-block mt-4 text-xs font-bold text-[#006EA8] hover:underline"
          >
            {isAr ? "العودة إلى الطلبات" : "Back to Applications"}
          </Link>
        </div>
      </div>
    )
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
    location: isAr ? "الموقع" : "Location",
    employmentType: isAr ? "نوع التوظيف" : "Employment Type",
    salary: isAr ? "الراتب" : "Salary",
    jobDetails: isAr ? "تفاصيل الوظيفة" : "Job Details",
  }

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: "bg-[#FFF8EE]", text: "text-[#FFB64D]", border: "border-[#FFB64D]" },
    accepted: { bg: "bg-[#EAFBF3]", text: "text-[#39DA8A]", border: "border-[#39DA8A]" },
    rejected: { bg: "bg-[#FFF5F5]", text: "text-[#FF5B5C]", border: "border-[#FF5B5C]" },
  }

  const statusLabels: Record<string, string> = {
    pending: isAr ? "معلق" : "Pending",
    accepted: isAr ? "مقبول" : "Accepted",
    rejected: isAr ? "مرفوض" : "Rejected",
  }

  const jobTitle = application.job
    ? getJobTitle(application.job, locale as "ar" | "en" | "de")
    : "—"
  const companyName = application.job?.company?.name || "—"
  const status = application.status || "pending"
  const statusStyle = statusColors[status] || statusColors.pending

  const gradientClasses = cn(
    "bg-clip-text text-transparent font-bold",
    isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
    "from-[#032C44] to-[#41A0CA]"
  )

  return (
    <div
      className="flex w-full flex-col gap-6 text-start"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[8px] bg-white p-6 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:p-8">
        <div className="min-w-0 flex-1">
          <h1 className={cn("text-[24px] leading-relaxed py-1", gradientClasses)}>
            {labels.title}
          </h1>
          <p className="mt-1 text-sm text-[#525252]">
            {isAr ? "عرض تفاصيل طلب التقديم على الوظيفة" : "View your job application details"}
          </p>
        </div>
        <Link
          href="/dashboard/user/applications"
          className="flex items-center gap-2 px-5 py-2.5 border border-[#006EA8] text-[#006EA8] hover:bg-[#F0F9FF] rounded-[8px] text-[14px] font-semibold transition"
        >
          <span aria-hidden>{isAr ? "→" : "←"}</span>
          {labels.backToApplications}
        </Link>
      </div>

      {/* Application Info Card */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="space-y-6">
          {/* Job Title & Company Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-6">
            <div className="space-y-2">
              <h2 className="text-[22px] font-bold text-[#032C44]">{jobTitle}</h2>
              <div className="flex items-center gap-2">
                {application.job?.company?.logo && (
                  <img
                    src={application.job.company.logo}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border border-gray-100"
                  />
                )}
                <span className="text-[15px] text-[#6B7280] font-medium">{companyName}</span>
              </div>
            </div>

            {/* Status Badge */}
            <span
              className={cn(
                "self-start px-4 py-1.5 rounded-full text-[12px] font-bold border",
                statusStyle.bg,
                statusStyle.text,
                statusStyle.border
              )}
            >
              {statusLabels[status]}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Applied On */}
            <div className="space-y-1">
              <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">
                {labels.appliedOn}
              </p>
              <div className="flex items-center gap-2 text-[#032C44]">
                <img src="/portfolio/calender.svg" alt="" className="w-4 h-4 opacity-60" />
                <span className="font-medium">{formatDate(application.applied_at, locale)}</span>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">
                {labels.status}
              </p>
              <p className="font-medium text-[#032C44]">{statusLabels[status]}</p>
            </div>

            {/* CV Download */}
            {application.cv_url && (
              <div className="space-y-1">
                <p className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">
                  {labels.cvUrl}
                </p>
                <a
                  href={application.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#006EA8] hover:underline font-medium"
                >
                  <img src="/portfolio/pdf.svg" alt="" className="w-5 h-5" />
                  {labels.download}
                </a>
              </div>
            )}
          </div>

          {/* Job Details Section */}
          {application.job && (
            <div className="border-t border-[#E5E7EB] pt-6">
              <h3 className={cn("text-[18px] mb-4", gradientClasses)}>
                {labels.jobDetails}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {application.job.location && (
                  <div className="rounded-[12px] border border-[#E5E7EB] p-4 bg-[#F9FAFB]">
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                      {labels.location}
                    </p>
                    <p className="text-[#032C44] font-medium">{application.job.location}</p>
                  </div>
                )}
                {application.job.employment_type && (
                  <div className="rounded-[12px] border border-[#E5E7EB] p-4 bg-[#F9FAFB]">
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                      {labels.employmentType}
                    </p>
                    <p className="text-[#032C44] font-medium">{application.job.employment_type}</p>
                  </div>
                )}
                {application.job.salary_from && (
                  <div className="rounded-[12px] border border-[#E5E7EB] p-4 bg-[#F9FAFB]">
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                      {labels.salary}
                    </p>
                    <p className="text-[#032C44] font-medium">
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
            {application.job?.id && (
              <Link
                href={`/jobs/${application.job.id}`}
                className="inline-flex items-center justify-center gap-2 h-[44px] px-6 bg-gradient-to-b from-[#006EA8] to-[#005685] text-white font-bold rounded-[12px] text-[14px] transition hover:brightness-105 shadow-[inset_0px_1px_18px_2px_#E8F2FF,inset_0px_1px_4px_2px_#C2DDFF]"
              >
                {labels.viewJob}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
