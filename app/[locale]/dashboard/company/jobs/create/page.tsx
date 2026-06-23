// app/[locale]/dashboard/company/jobs/create/page.tsx
import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getCategoriesForForm } from "@/lib/api/services/categories.service"
import { getProfile } from "@/lib/api/services/auth.service"
import { getProfileCompanyLogo, getProfileCompanyName } from "@/features/company-profile/lib/profile-logo"
import { CreateJobWizard } from "@/features/company-jobs/components/create-job-wizard"

export default async function CreateJobPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  // Debug: log when create page is rendered server-side
  try {
    // eslint-disable-next-line no-console
    console.info(`[debug] CreateJobPage - locale=${locale} isLoggedIn=${Boolean(session?.isLoggedIn)} role=${String(session?.user?.role ?? "none")}`)
  } catch {}

  if (!session.isLoggedIn || !session.user) {
    redirect(`/${locale}/sign-in`)
  }

  if (normalizeRole(session.user) !== "company") {
    redirect(`/${locale}/dashboard`)
  }

  if (!session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  const [categories, profile] = await Promise.all([
    getCategoriesForForm(locale, session.accessToken).catch(
      () => [] as Awaited<ReturnType<typeof getCategoriesForForm>>
    ),
    getProfile(session.accessToken, locale).catch(() => null),
  ])

  const companyLogo = profile ? getProfileCompanyLogo(profile) : undefined
  const companyName = profile ? getProfileCompanyName(profile, locale) : undefined

  return (
    /* تم تعديل الحاوية هنا لتصبح block وتأخذ w-full و max-w-none بالكامل دون تضييق من الـ flex */
    <div className="block min-h-[calc(100dvh-4rem)] bg-[#F5F7FA] px-4 py-10 w-full max-w-none">
      <div className="w-full max-w-none">
        <CreateJobWizard
          categories={categories}
          locale={locale}
          companyLogo={companyLogo}
          companyName={companyName}
        />
      </div>
    </div>
  )
}