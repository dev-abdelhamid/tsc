import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getAdminHomePageContent } from "@/lib/api/services/home-page.service"
import { AdminHomePanel } from "@/features/admin/components/admin-home-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await getSession()
  const t = await getTranslations("Admin.home")

  if (!session.user || session.user.role !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  let content = null
  let loadError: string | null = null

  try {
    content = await getAdminHomePageContent(session.accessToken!, locale)
  } catch (err) {
    console.error(err)
    loadError = t("loadError")
  }

  return (
    <AdminPageLayout title={t("title")} description={t("description")}>
      {loadError && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
        </p>
      )}
      <AdminHomePanel content={content} locale={locale} loadError={loadError} />
    </AdminPageLayout>
  )
}
