import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getTickets } from "@/lib/api/services/tickets.service"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"
import TicketsClient from "./client"

export default async function UserTicketsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  // Load tickets from backend API
  const ticketsResult = await getTickets(session.accessToken, 1, locale).catch(
    (err) => {
      console.error("Failed to load tickets in page.tsx", err)
      return { data: [] }
    }
  )
  const tickets = ticketsResult.data || []

  const isAr = locale === "ar"

  return (
    <DashboardPageShell
      title={isAr ? "الدعم الفني والتذاكر" : "Tickets & Support"}
      description={isAr ? "تابع تذاكر الدعم الفني الخاصة بك واستفساراتك" : "Track your support tickets and inquiries"}
      isRTL={isAr}
    >
      <TicketsClient locale={locale} initialTickets={tickets} />
    </DashboardPageShell>
  )
}
