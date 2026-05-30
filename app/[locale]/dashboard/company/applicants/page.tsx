import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"

export default async function CompanyApplicantsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  if (!session.user || session.user.role !== "company") redirect(`/${locale}/dashboard`)

  const isAr = locale === "ar"
  return (
    <DashboardPageShell
      title={isAr ? "المتقدمون" : "Applicants"}
      description={isAr ? "قريباً: قائمة المتقدمين لكل وظيفة" : "Coming soon: applicants per job"}
    />
  )
}
