import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getAdminSuccessStories } from "@/lib/api/services/success-stories.service"
import { AdminSuccessStoriesPanel } from "@/features/admin/components/admin-success-stories-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminSuccessStoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await getSession()
  const t = await getTranslations("Admin.successStories")

  if (!session.user || session.user.role !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  let stories: Awaited<ReturnType<typeof getAdminSuccessStories>>["data"] = []
  let loadError: string | null = null

  try {
    const result = await getAdminSuccessStories(session.accessToken!, locale, { per_page: 50 })
    stories = result.data
  } catch (err) {
    console.error(err)
    loadError = t("loadError")
  }

  return (
    <AdminPageLayout title={t("title")} description={t("description")}>
      {loadError && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
        </p>
      )}
      <AdminSuccessStoriesPanel stories={stories} locale={locale} />
    </AdminPageLayout>
  )
}
