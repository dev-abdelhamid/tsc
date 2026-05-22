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

  // 🔐 حماية الداشبورد
  if (!session.isLoggedIn || !session.user) {
    redirect(`/${locale}/sign-in`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ✅ الهيدر موجود أصلاً في الـ Root Layout */}
      
      <div className="flex-1 py-8 px-4">
        <div className="max-w-[1812px] mx-auto">
          <div className="flex gap-6">
            
            {/* السايدبار الخاص بالداشبورد */}
            <DashboardSidebar locale={locale} userRole={session.user.role} />
            
            {/* منطقة المحتوى */}
            <main className="flex-1  ">
              {children}
            </main>
            
          </div>
        </div>
      </div>

    </div>
  )
}