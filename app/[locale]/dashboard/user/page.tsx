import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getUserStats, getMyApplications } from "@/lib/api/services/user.service"
import { DashboardStatCard } from "@/features/dashboard/components/dashboard-stat-card"
import { DashboardJobsTable } from "@/features/dashboard/components/dashboard-jobs-table"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"

export default async function UserDashboardPage({
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

  if (session.user.role !== "user") {
    redirect(`/${locale}/dashboard`)
  }

  const token = session.accessToken!
  const isAr = locale === "ar"

  let stats = { total_applications: 0 }
  let applications: Awaited<ReturnType<typeof getMyApplications>>["data"] = []

  try {
    const [statsData, appsData] = await Promise.all([
      getUserStats(token, locale as "ar" | "en" | "de"),
      getMyApplications(token, 1, locale as "ar" | "en" | "de"),
    ])
    stats = statsData
    applications = appsData.data ?? []
  } catch (_err) {
    // graceful fallback
  }

  const tableRows = applications.slice(0, 7).map((app) => ({
    id: app.id,
    title: app.job ? getJobTitle(app.job, locale) : "—",
    column2: app.job?.company?.name ?? "—",
    deadline: app.job?.application_deadline
      ? new Date(app.job.application_deadline).toLocaleDateString("en-GB")
      : "—",
    status: (app.status === "accepted"
      ? "approved"
      : app.status === "rejected"
        ? "rejected"
        : "pending") as "approved" | "rejected" | "pending",
    detailsHref: `/jobs/${app.job?.id ?? app.id}`,
  }))

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-6 md:flex-row">
        <DashboardStatCard
          iconSrc="/dashboard/jobs.svg"
          title={isAr ? "إجمالي طلبات الوظائف" : "Total Jobs Apply"}
          value={stats.total_applications}
          unit={isAr ? "Job" : "Job"}
          viewAllHref="/dashboard/user/applications"
          viewAllLabel={isAr ? "عرض الكل" : "View All"}
          isRTL={isAr}
        />
        <DashboardStatCard
          iconSrc="/dashboard/favourites.svg"
          title={isAr ? "الوظائف المفضلة" : "Total Favourite Jobs"}
          value={0}
          unit={isAr ? "Job" : "Job"}
          viewAllHref="/dashboard/user/favourites"
          viewAllLabel={isAr ? "عرض الكل" : "View All"}
          isRTL={isAr}
        />
        <DashboardStatCard
          iconSrc="/dashboard/tickets.svg"
          title={isAr ? "إجمالي التذاكر" : "Total Ticket"}
          value={0}
          unit={isAr ? "ticket" : "ticket"}
          viewAllHref="/dashboard/user/tickets"
          viewAllLabel={isAr ? "عرض الكل" : "View All"}
          isRTL={isAr}
        />
      </div>

      <DashboardJobsTable
        title={isAr ? "آخر طلبات التوظيف" : "Last Job Application"}
        rows={tableRows}
        col2Label={isAr ? "اسم الشركة" : "Company Name"}
        jobTitleLabel={isAr ? "عنوان الوظيفة" : "Job Title"}
        deadlineLabel={isAr ? "الموعد النهائي" : "Deadline"}
        statusLabel={isAr ? "الحالة" : "Status"}
        actionsLabel={isAr ? "الإجراءات" : "Actions"}
        emptyMessage={isAr ? "لا توجد طلبات حتى الآن" : "No applications yet"}
        detailsLabel={isAr ? "تفاصيل" : "Details"}
        isRTL={isAr}
      />
    </div>
  )
}
