import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getProfile, refreshToken as refreshTokenService } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"
import { getSession } from "@/lib/session"
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
    initialProfile = (await getProfile(session.accessToken, session.locale || "ar")) as InitialProfileData
  } catch (err: unknown) {
    const status = err instanceof ApiError ? err.status : ((err as Record<string, unknown>)['status'] as number | undefined)
    if (status === 401) {
      if (session.refreshToken) {
        try {
          const tokens = await refreshTokenService(session.refreshToken, session.locale || "ar")
          session.accessToken = tokens.access_token
          session.refreshToken = tokens.refresh_token
          await session.save()
          initialProfile = (await getProfile(session.accessToken, session.locale || "ar")) as InitialProfileData
        } catch (refreshErr) {
          console.warn("Failed to refresh token:", refreshErr)
          redirect(`/${locale}/sign-in`)
        }
      } else {
        redirect(`/${locale}/sign-in`)
      }
    } else {
      throw err
    }
  }

  const isAr = locale === "ar"
  return (
    <DashboardPageShell
      title={isAr ? "ملف الشركة" : "Company Profile"}
      description={isAr ? "تعديل بيانات الشركة" : "Edit company profile"}
    >
      <CompanyProfileForm initialProfile={initialProfile} />
    </DashboardPageShell>
  )
}
