import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getAdminSettings } from "@/lib/api/services/settings.service"
import { getAdminNews } from "@/lib/api/services/news.service"
import { getNotifications } from "@/lib/api/services/notifications.service"
import { AdminSettingsPanel } from "@/features/admin/components/admin-settings-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await getSession()
  const t = await getTranslations("Admin.settings")

  if (!session.user || session.user.role !== "admin" || !session.accessToken) {
    redirect(`/${locale}/dashboard`)
  }

  const token = session.accessToken

  const [settings, newsResult, notificationsResult] = await Promise.all([
    getAdminSettings(token, locale).catch(() => []),
    getAdminNews(token, { per_page: 20 }, locale).catch(() => ({ data: [] })),
    getNotifications(token, 1, locale).catch(() => ({ data: [] })),
  ])

  return (
    <AdminPageLayout title={t("title")} description={t("description")}>
      <AdminSettingsPanel
        settings={settings}
        news={newsResult.data}
        notifications={notificationsResult.data}
        locale={locale}
      />
    </AdminPageLayout>
  )
}
