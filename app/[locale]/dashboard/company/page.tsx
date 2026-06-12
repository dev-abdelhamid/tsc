import { Link } from "@/i18n/navigation"
import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import {
  enrichJobsWithApplicationCounts,
  getCompanyJobs,
  getCompanyStats,
} from "@/lib/api/services/company.service"
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
    // Allow development impersonation via cookie `impersonate=company`
    if (process.env.NODE_ENV !== "production") {
      try {
        const { cookies } = await import("next/headers")
        const cookieStore = await cookies()
        const imp = cookieStore.get("impersonate")?.value
        if (imp && String(imp).toLowerCase() === "company") {
          // proceed with mocked data below
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

  if (normalizeRole(session.user) !== "company") {
    redirect(`/${locale}/dashboard`)
  }

  const isAr = locale === "ar"

  let stats = { total_jobs: 0, total_applications: 0, pending_applications: 0 }
  let jobs: Job[] = []
  let totalTickets = 0

  try {
    // If impersonating in dev, return mocked data without calling upstream
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const imp = process.env.NODE_ENV !== "production" ? cookieStore.get("impersonate")?.value : undefined
    if (imp && String(imp).toLowerCase() === "company") {
      jobs = [
        { id: 20, title: { ar: "تطوير الويب" }, status: "approved", applications_count: 12, created_at: new Date().toISOString() },
        { id: 21, title: { ar: "تصميم واجهات" }, status: "approved", applications_count: 3, created_at: new Date().toISOString() },
      ] as Job[]
      stats = { total_jobs: 2, total_applications: 15, pending_applications: 0 }
      totalTickets = 1
    } else {
      const token = session.accessToken as string | undefined
      if (!token) redirect(`/${locale}/sign-in`)

      const [jobsResult, ticketsResult] = await Promise.allSettled([
        getCompanyJobs(token as string, 1, locale as "ar" | "en" | "de"),
        getTickets(token as string, 1, locale as "ar" | "en" | "de"),
      ])

      if (jobsResult.status === "fulfilled") {
        const rawJobs = jobsResult.value.data ?? []
        const displayJobs = rawJobs.slice(0, 7)
        jobs = await enrichJobsWithApplicationCounts(
          displayJobs,
          token,
          locale as "ar" | "en" | "de"
        )
        stats = await getCompanyStats(token, locale as "ar" | "en" | "de", jobs)
      }

      if (ticketsResult.status === "fulfilled") {
        totalTickets =
          ticketsResult.value.meta?.total ??
          ticketsResult.value.data?.length ??
          0
      }
    }
  } catch (err) {
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
    const deadlineLabel = (() => {
      if (!deadline) return "—"
      try {
        const d = new Date(deadline)
        if (Number.isNaN(d.getTime())) return "—"
        return d.toLocaleDateString(isAr ? "ar-EG" : "en-GB")
      } catch {
        return "—"
      }
    })()
    return {
      id: job.id,
      title: getJobTitle(job, locale),
      column2: Number(job.applications_count) || 0,
      deadline: deadlineLabel,
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
