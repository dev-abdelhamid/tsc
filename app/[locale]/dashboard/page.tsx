// app/[locale]/dashboard/page.tsx
import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const session = await getSession()
  const { locale } = await params

  // 1. التحقق من تسجيل الدخول
  if (!session.isLoggedIn || !session.user) {
    redirect(`/${locale}/sign-in`)
  }

  // 2. خريطة التوجيه حسب الدور
  const dashboardMap: Record<string, string> = {
    user: "/dashboard/user",
    company: "/dashboard/company",
    admin: "/dashboard/admin",
  }

  const role = session.user.role
  const targetPath = role ? dashboardMap[role] : null

  // 3. إعادة التوجيه أو خطأ
  if (!targetPath) {
    // لو الدور غير معروف، نعمل logout ونرجع لـ sign-in
    await fetch(`/${locale}/api/auth/logout`, { method: "POST" })
    redirect(`/${locale}/sign-in?error=invalid_role`)
  }

  redirect(`/${locale}${targetPath}`)
}