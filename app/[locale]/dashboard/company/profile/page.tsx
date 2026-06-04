import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { ApiError } from "@/lib/api/client"
import { getSession, withTokenRefresh } from "@/lib/session"
import CompanyProfileForm from "@/features/company-profile/components/company-profile-form"
import { api } from "@/lib/api/client"
import type { ApiResponse } from "@/lib/api/types"

/**
 * Fetches the full company profile from the backend.
 * We use `Record<string, unknown>` instead of the narrow `User` type
 * so that ALL backend fields (company_name, ceo_name, description,
 * website, postal_code, num_of_employees, company_type_id, etc.)
 * are preserved and forwarded to the client form.
 */
async function getFullCompanyProfile(token: string, locale: string) {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    "/auth/profile",
    { token, locale, timeout: 8000 }
  )
  return response.data
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

  let initialProfile: Record<string, unknown> | null = null

  try {
    initialProfile = await withTokenRefresh(session, session.locale || locale, (token) =>
      getFullCompanyProfile(token, session.locale || locale)
    )
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      redirect(`/${locale}/sign-in`)
    } else {
      throw err
    }
  }

  return <CompanyProfileForm initialProfile={initialProfile} />
}
