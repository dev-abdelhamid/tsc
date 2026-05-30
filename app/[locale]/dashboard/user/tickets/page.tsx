import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"

export default async function UserTicketsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  if (!session.user || session.user.role !== "user") redirect(`/${locale}/dashboard`)

  const isAr = locale === "ar"
  return (
    <DashboardPageShell
      title={isAr ? "التذاكر" : "Tickets"}
      description={isAr ? "قريباً: نظام التذاكر والدعم" : "Coming soon: support tickets"}
    />
  )
}
