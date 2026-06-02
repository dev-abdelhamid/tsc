import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getFavoriteJobs } from "@/lib/api/services/jobs.service"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"
import { DashboardJobsTable } from "@/features/dashboard/components/dashboard-jobs-table"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"

export default async function UserFavouritesPage({
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
    title: isAr ? "الوظائف المفضلة" : "Saved Jobs",
    description: isAr
      ? "شاهد جميع الوظائف التي حفظتها للرجوع إليها لاحقاً"
      : "View all the jobs you saved for later",
    empty: isAr ? "لم تحفظ أي وظائف بعد" : "You have not saved any jobs yet",
    jobTitle: isAr ? "عنوان الوظيفة" : "Job Title",
    company: isAr ? "اسم الشركة" : "Company Name",
    savedOn: isAr ? "تاريخ الحفظ" : "Saved On",
    actions: isAr ? "الإجراءات" : "Actions",
    viewDetails: isAr ? "عرض التفاصيل" : "View Details",
  }

  const favoriteJobs = await getFavoriteJobs(session.accessToken, locale as "ar" | "en" | "de").catch(
    () => []
  )

  const rows = favoriteJobs.map((job) => ({
    id: job.id,
    title: getJobTitle(job, locale as "ar" | "en" | "de"),
    column2: job.company?.name ?? "—",
    deadline: job.created_at
      ? new Date(job.created_at).toLocaleDateString(
          locale === "ar" ? "ar-EG" : locale === "de" ? "de-DE" : "en-GB"
        )
      : "—",
    status: "approved" as const,
    detailsHref: `/jobs/${job.id}`,
  }))

  return (
    <DashboardPageShell title={labels.title} description={labels.description}>
      <div className="w-full space-y-6">
        {/* Stats Card */}
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="text-center">
            <p className="text-sm font-medium text-[#6B7280]">
              {isAr ? "إجمالي الوظائف المحفوظة" : "Total Saved"}
            </p>
            <p className="mt-2 text-4xl font-bold text-[#111827]">{favoriteJobs.length}</p>
          </div>
        </div>

        {/* Favorites Table */}
        <DashboardJobsTable
          title={labels.jobTitle}
          rows={rows}
          col2Label={labels.company}
          emptyMessage={labels.empty}
          detailsLabel={labels.viewDetails}
          isRTL={isAr}
          deadlineLabel={labels.savedOn}
          statusLabel={labels.actions}
          actionsLabel={labels.actions}
        />
      </div>
    </DashboardPageShell>
  )
}
