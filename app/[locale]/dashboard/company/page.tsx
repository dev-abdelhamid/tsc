import { Link } from "@/i18n/navigation"
import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getCompanyJobs, getCompanyStats } from "@/lib/api/services/company.service"
import { DashboardStatCard } from "@/features/dashboard/components/dashboard-stat-card"
import { DashboardJobsTable } from "@/features/dashboard/components/dashboard-jobs-table"
import type { Job } from "@/lib/api/types"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"

export default async function CompanyDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.isLoggedIn || !session.user) {
    redirect(`/${locale}/sign-in`)
  }

  if (session.user.role !== "company") {
    redirect(`/${locale}/dashboard`)
  }

  const token = session.accessToken!
  const isAr = locale === "ar"

  let stats = { total_jobs: 0, total_applications: 0, pending_applications: 0 }
  let jobs: Job[] = []

  try {
    const [statsData, jobsData] = await Promise.all([
      getCompanyStats(token, locale as "ar" | "en" | "de"),
      getCompanyJobs(token, 1, locale as "ar" | "en" | "de"),
    ])
    stats = statsData
    jobs = jobsData.data ?? []
    } catch (err) {
      console.error(err)
    // graceful fallback
  }

  const tableRows = jobs.slice(0, 7).map((job) => {
    const status =
      job.status === "approved"
        ? ("approved" as const)
        : job.status === "rejected"
          ? ("rejected" as const)
          : ("pending" as const)
    const deadline = job.application_deadline
    return {
      id: job.id,
      title: getJobTitle(job, locale),
      column2: job.applications_count ?? 0,
      deadline: deadline ? new Date(deadline).toLocaleDateString("en-GB") : "—",
      status,
      detailsHref: `/dashboard/company/jobs/${job.id}`,
    }
  })

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-6 md:flex-row">
        <DashboardStatCard
          iconSrc="/dashboard/jobs.svg"
          title={isAr ? "إجمالي الوظائف" : "Total Jobs"}
          value={stats.total_jobs}
          unit={isAr ? "Job" : "Job"}
          viewAllHref="/dashboard/company/jobs"
          viewAllLabel={isAr ? "عرض الكل" : "View All"}
          isRTL={isAr}
        />
        <DashboardStatCard
          iconSrc="/dashboard/education_Info.svg"
          title={isAr ? "إجمالي المتقدمين" : "Total Job Applicants"}
          value={stats.total_applications}
          unit={isAr ? "application" : "application"}
          viewAllHref="/dashboard/company/applicants"
          viewAllLabel={isAr ? "عرض الكل" : "View All"}
          isRTL={isAr}
        />
        <DashboardStatCard
          iconSrc="/dashboard/tickets.svg"
          title={isAr ? "إجمالي التذاكر" : "Total Ticket"}
          value={stats.pending_applications}
          unit={isAr ? "ticket" : "ticket"}
          viewAllHref="/dashboard/company/tickets"
          viewAllLabel={isAr ? "عرض الكل" : "View All"}
          isRTL={isAr}
        />
      </div>

      <DashboardJobsTable
        title={isAr ? "آخر الوظائف" : "Last Job"}
        rows={tableRows}
        col2Label={isAr ? "المتقدمون" : "Applied Candidate"}
        jobTitleLabel={isAr ? "عنوان الوظيفة" : "Job Title"}
        deadlineLabel={isAr ? "الموعد النهائي" : "Deadline"}
        statusLabel={isAr ? "الحالة" : "Status"}
        actionsLabel={isAr ? "الإجراءات" : "Actions"}
        emptyMessage={isAr ? "لا توجد وظائف" : "No jobs found"}
        detailsLabel={isAr ? "تفاصيل" : "Details"}
        isRTL={isAr}
      />

      {tableRows.length === 0 && (
        <p className="text-center text-sm text-gray-500">
          {isAr ? "لا توجد وظائف بعد — " : "No jobs yet — "}
          <Link
            locale={locale}
            href="/dashboard/company/jobs/create"
            className="font-semibold text-[#006EA8] hover:underline"
          >
            {isAr ? "أنشئ وظيفة" : "Create a job"}
          </Link>
        </p>
      )}
    </div>
  )
}
