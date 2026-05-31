import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getCategories } from "@/lib/api/services/categories.service"
import { AdminCategoriesPanel } from "@/features/admin/components/admin-categories-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.isLoggedIn || !session.user || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  if (session.user.role !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const categories = await getCategories(locale, session.accessToken)

  return <AdminCategoriesPanel categories={categories} locale={locale} />
}
