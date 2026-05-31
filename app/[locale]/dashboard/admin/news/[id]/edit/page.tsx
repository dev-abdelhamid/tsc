import { redirect, notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getAdminNewsItem } from "@/lib/api/services/news.service"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import { AdminNewsEditForm } from "@/features/admin/components/admin-news-edit-form"

type PageProps = {
  params: Promise<{ locale: string; id: string }>
}

export default async function AdminNewsEditPage({ params }: PageProps) {
  const { locale, id } = await params
  setRequestLocale(locale)

  const session = await getSession()
  if (!session.isLoggedIn || !session.user || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }
  if (session.user.role !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const isRTL = locale === "ar"
  
  // Fetch single news item directly by ID
  const newsItem = await getAdminNewsItem(id, session.accessToken, locale)

  if (!newsItem) {
    notFound()
  }

  return (
    <AdminPageLayout
      title={isRTL ? `تعديل الخبر — ${newsItem.title}` : `Edit News — ${newsItem.title}`}
      description={
        isRTL
          ? `تعديل بيانات وتفاصيل الخبر والترجمات المتاحة · ID: ${newsItem.id}`
          : `Edit news data, content translations, and image · ID: ${newsItem.id}`
      }
    >
      <AdminNewsEditForm newsItem={newsItem} locale={locale} />
    </AdminPageLayout>
  )
}
