import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"

export default async function CompanyTicketsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await getSession()
  if (!session.user || session.user.role !== "company") redirect(`/${locale}/dashboard`)

  const isAr = locale === "ar"
  return (
    <DashboardPageShell
      title={isAr ? "التذاكر" : "Tickets"}
      description={isAr ? "قريباً: تذاكر الدعم" : "Coming soon: support tickets"}
    />
  )
}
