import { Link } from "@/i18n/navigation"
import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession, withTokenRefresh } from "@/lib/session"
import { getCompanyJobs, getCompanyStats } from "@/lib/api/services/company.service"
import { getTickets } from "@/lib/api/services/tickets.service"
import { DashboardStatCard } from "@/features/dashboard/components/dashboard-stat-card"
import { DashboardJobsTable } from "@/features/dashboard/components/dashboard-jobs-table"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"
import type { Job } from "@/lib/api/types"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { ApiError } from "@/lib/api/client"

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

  const isAr = locale === "ar"

  let stats = { total_jobs: 0, total_applications: 0, pending_applications: 0 }
  let jobs: Job[] = []
  let totalTickets = 0

  try {
    const [statsData, jobsData, ticketsData] = await withTokenRefresh(
      session,
      locale,
      async (token) => Promise.all([
        getCompanyStats(token, locale as "ar" | "en" | "de"),
        getCompanyJobs(token, 1, locale as "ar" | "en" | "de"),
        getTickets(token, 1, locale as "ar" | "en" | "de").catch(() => ({ data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } })),
      ])
    )
    stats = statsData
    jobs = jobsData.data ?? []
    totalTickets = (ticketsData.meta as any)?.total ?? ticketsData.data?.length ?? 0
  } catch (err) {
    console.error("[Dashboard] Load error:", err)
    if (err instanceof ApiError && err.status === 401) {
      redirect(`/${locale}/sign-in`)
    }
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
      deadline: deadline ? new Date(deadline).toLocaleDateString(isAr ? "ar-EG" : "en-GB") : "—",
      status,
      detailsHref: `/dashboard/company/jobs/${job.id}`,
    }
  })

  return (
    <DashboardPageShell
      title={isAr ? "لوحة التحكم" : "Dashboard"}
      description={isAr ? "إحصائيات عامة وإدارة الوظائف والتذاكر" : "Overview of stats, job posts, and support tickets"}
      isRTL={isAr}
    >
      <div className="flex w-full flex-col gap-6">
        {/* ── Stats Section ── */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-6 md:flex-row">
            <DashboardStatCard
              iconSrc="/dashboard/jobs.svg"
              title={isAr ? "إجمالي الوظائف" : "Total Jobs"}
              value={stats.total_jobs}
              unit={isAr ? "وظيفة" : "Job"}
              viewAllHref="/dashboard/company/jobs"
              viewAllLabel={isAr ? "عرض الكل" : "View All"}
              locale={locale}
              isRTL={isAr}
            />
            <DashboardStatCard
              iconSrc="/dashboard/education_Info.svg"
              title={isAr ? "إجمالي المتقدمين" : "Total Applicants"}
              value={stats.total_applications}
              unit={isAr ? "طلب" : "Application"}
              viewAllHref="/dashboard/company/applicants"
              viewAllLabel={isAr ? "عرض الكل" : "View All"}
              locale={locale}
              isRTL={isAr}
            />
            <DashboardStatCard
              iconSrc="/dashboard/tickets.svg"
              title={isAr ? "إجمالي التذاكر" : "Total Tickets"}
              value={totalTickets}
              unit={isAr ? "تذكرة" : "Ticket"}
              viewAllHref="/dashboard/company/tickets"
              viewAllLabel={isAr ? "عرض الكل" : "View All"}
              locale={locale}
              isRTL={isAr}
            />
          </div>
        </div>

        {/* ── Recent Jobs Table ── */}
        <DashboardJobsTable
          title={isAr ? "آخر الوظائف" : "Recent Jobs"}
          rows={tableRows}
          col2Label={isAr ? "المتقدمون" : "Applied Candidate"}
          jobTitleLabel={isAr ? "عنوان الوظيفة" : "Job Title"}
          deadlineLabel={isAr ? "الموعد النهائي" : "Deadline"}
          statusLabel={isAr ? "الحالة" : "Status"}
          actionsLabel={isAr ? "الإجراءات" : "Actions"}
          emptyMessage={isAr ? "لا توجد وظائف" : "No jobs found"}
          detailsLabel={isAr ? "تفاصيل" : "Details"}
          locale={locale}
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
    </DashboardPageShell>
  )
}
