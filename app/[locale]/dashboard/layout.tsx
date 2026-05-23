import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar"

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

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:gap-6">
          <DashboardSidebar locale={locale} userRole={user.role} />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
