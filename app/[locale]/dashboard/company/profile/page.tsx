import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getProfile } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"
import { getSession, withTokenRefresh } from "@/lib/session"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"
import CompanyProfileForm from "@/features/company-profile/components/company-profile-form"

type InitialProfileData = {
  name: string
  email: string
  phone?: string
  company_name?: string | Record<string, unknown>
  country_id?: number
  avatar?: string | null
}

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  if (!session.user || session.user.role !== "company") redirect(`/${locale}/dashboard`)
  if (!session.accessToken) redirect(`/${locale}/dashboard`)

  let initialProfile: InitialProfileData | null = null

  try {
    initialProfile = (await withTokenRefresh(session, session.locale || "ar", (token) =>
      getProfile(token, session.locale || "ar")
    )) as InitialProfileData
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      redirect(`/${locale}/sign-in`)
    } else {
      throw err
    }
  }

  const isAr = locale === "ar"
  return (
    <DashboardPageShell
      title={isAr ? "ملف الشركة" : "Company Profile"}
      description={isAr ? "تعديل بيانات الشركة" : "Edit company profile"}
      isRTL={isAr}
    >
      <CompanyProfileForm initialProfile={initialProfile} />
    </DashboardPageShell>
  )
}
