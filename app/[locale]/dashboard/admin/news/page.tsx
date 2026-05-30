import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getAdminNews } from "@/lib/api/services/news.service"
import { AdminNewsPanel } from "@/features/admin/components/admin-news-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminNewsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.user || session.user.role !== "admin" || !session.accessToken) {
    redirect(`/${locale}/dashboard`)
  }

  const token = session.accessToken

  // Fetch news using the admin news service
  const newsResult = await getAdminNews(token, { per_page: 50 }, locale).catch(() => ({ data: [] }))

  return (
    <AdminPageLayout
      title={locale === "ar" ? "الأخبار والمقالات" : "News & Articles"}
      description={locale === "ar" ? "إضافة وتعديل وحذف الأخبار والمقالات" : "Manage, create, and delete news articles"}
    >
      <AdminNewsPanel news={newsResult.data} />
    </AdminPageLayout>
  )
}
