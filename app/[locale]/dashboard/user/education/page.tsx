import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"

export default async function UserEducationPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await getSession()
  if (!session.user || session.user.role !== "user") redirect(`/${locale}/dashboard`)

  const isAr = locale === "ar"
  return (
    <DashboardPageShell
      title={isAr ? "المؤهلات والتعليم" : "Education Info"}
      description={isAr ? "قريباً: ربط بيانات Portfolio من الـ API" : "Coming soon: portfolio API integration"}
    />
  )
}
