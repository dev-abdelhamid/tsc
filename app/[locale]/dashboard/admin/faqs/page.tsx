import { redirect } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getAdminFaqs } from "@/lib/api/services/faqs.service"
import { AdminFaqsPanel } from "@/features/admin/components/admin-faqs-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import type { Faq } from "@/lib/api/services/faqs.service"

export default async function AdminFaqsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.user || session.user.role !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  let faqs: Faq[] = []
  try {
    const result = await getAdminFaqs(session.accessToken!, { per_page: 100 }, locale)
    faqs = result.data
  } catch {
    // ignore
  }

  // Try to load admin translations for the FAQs page. If keys are missing,
  // fall back to sensible locale-specific defaults to avoid runtime errors.
  let title = "FAQs"
  let description = "Manage Frequently Asked Questions"
  try {
    const t = await getTranslations("Admin.faqs")
    try {
      title = t("title")
    } catch {
      // fallback per-locale
      if (locale === "ar") title = "الأسئلة الشائعة"
      else if (locale === "de") title = "Häufig gestellte Fragen"
    }
    try {
      description = t("description")
    } catch {
      if (locale === "ar") description = "إدارة الأسئلة الشائعة"
      else if (locale === "de") description = "Verwalten Sie häufig gestellte Fragen"
    }
  } catch {
    if (locale === "ar") {
      title = "الأسئلة الشائعة"
      description = "إدارة الأسئلة الشائعة"
    } else if (locale === "de") {
      title = "Häufig gestellte Fragen"
      description = "Verwalten Sie häufig gestellte Fragen"
    }
  }

  return (
    <AdminPageLayout title={title} description={description}>
      <AdminFaqsPanel faqs={faqs} />
    </AdminPageLayout>
  )
}
