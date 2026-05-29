import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const session = await getSession()
  const { locale } = await params

  if (!session.isLoggedIn || !session.user) {
    redirect(`/${locale}/sign-in`)
  }

  const { user } = session

  return <DashboardShell locale={locale} user={user}>{children}</DashboardShell>
}