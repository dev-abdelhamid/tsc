// app/[locale]/dashboard/user/applications/page.tsx
import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getMyApplications } from "@/lib/api/services/user.service"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"
import { DashboardJobsTable } from "@/features/dashboard/components/dashboard-jobs-table"
import { DashboardStatCard } from "@/features/dashboard/components/dashboard-stat-card"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"

function formatApplicationDate(value: string | undefined, locale: string) {
  if (!value) return "—"

  try {
    const formatter =
      locale === "ar"
        ? new Intl.DateTimeFormat("ar-EG")
        : locale === "de"
          ? new Intl.DateTimeFormat("de-DE")
          : new Intl.DateTimeFormat("en-GB")

    return formatter.format(new Date(value))
  } catch {
    return "—"
  }
}

export default async function UserApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  const isAr = locale === "ar"

  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  const labels = {
    title: isAr ? "طلباتي للوظائف" : "My job applications",
    description: isAr
      ? "تابع جميع الطلبات والنتائج في مكان واحد"
      : "Track every application and its current status in one place",
    empty: isAr ? "لم تقدم على أي وظائف بعد" : "You have not applied to any jobs yet",
    total: isAr ? "إجمالي الطلبات" : "Total applications",
    pending: isAr ? "طلبات معلقة" : "Pending",
    accepted: isAr ? "طلبات مقبولة" : "Accepted",
    rejected: isAr ? "طلبات مرفوضة" : "Rejected",
    viewAll: isAr ? "عرض الكل" : "View all",
    details: isAr ? "تفاصيل" : "Details",
    company: isAr ? "اسم الشركة" : "Company Name",
    jobTitle: isAr ? "عنوان الوظيفة" : "Job Title",
    deadline: isAr ? "تاريخ التقديم" : "Applied On",
    status: isAr ? "الحالة" : "Status",
    actions: isAr ? "الإجراءات" : "Actions",
  }

  const applications = await getMyApplications(session.accessToken, 1, locale as "ar" | "en" | "de")
    .then((result) => result.data)
    .catch(() => [])

  const statusCounts = applications.reduce(
    (acc, app) => {
      if (app.status === "accepted") acc.accepted += 1
      else if (app.status === "rejected") acc.rejected += 1
      else acc.pending += 1
      return acc
    },
    { pending: 0, accepted: 0, rejected: 0 }
  )

  const rows = applications.map((app) => ({
    id: app.id,
    title: app.job ? getJobTitle(app.job, locale as "ar" | "en" | "de") : "—",
    column2: app.job?.company?.name ?? "—",
    deadline: formatApplicationDate(app.applied_at, locale),
    status: (app.status === "accepted"
      ? "accepted"
      : app.status === "rejected"
        ? "rejected"
        : "pending") as "accepted" | "rejected" | "pending",
    detailsHref: `/dashboard/user/applications/${app.id}`,
  }))

  return (
    <DashboardPageShell title={labels.title} description={labels.description}>
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 xl:grid-cols-4">
          <DashboardStatCard
            iconSrc="/dashboard/jobs.svg"
            title={labels.total}
            value={applications.length}
            viewAllHref="/dashboard/user/applications"
            viewAllLabel={labels.viewAll}
            isRTL={isAr}
          />
          <DashboardStatCard
            iconSrc="/dashboard/favourites.svg"
            title={labels.pending}
            value={statusCounts.pending}
            viewAllHref="/dashboard/user/applications"
            viewAllLabel={labels.viewAll}
            isRTL={isAr}
          />
          <DashboardStatCard
            iconSrc="/dashboard/tickets.svg"
            title={labels.accepted}
            value={statusCounts.accepted}
            viewAllHref="/dashboard/user/applications"
            viewAllLabel={labels.viewAll}
            isRTL={isAr}
          />
          <DashboardStatCard
            iconSrc="/dashboard/jobs.svg"
            title={labels.rejected}
            value={statusCounts.rejected}
            viewAllHref="/dashboard/user/applications"
            viewAllLabel={labels.viewAll}
            isRTL={isAr}
          />
        </div>

        <DashboardJobsTable
          title={labels.title}
          rows={rows}
          col2Label={labels.company}
          emptyMessage={labels.empty}
          detailsLabel={labels.details}
          jobTitleLabel={labels.jobTitle}
          deadlineLabel={labels.deadline}
          statusLabel={labels.status}
          actionsLabel={labels.actions}
          isRTL={isAr}
        />
      </div>
    </DashboardPageShell>
  )
}
