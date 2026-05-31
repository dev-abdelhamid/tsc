import { redirect, notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getServices } from "@/lib/api/services/services.service"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import { AdminServiceEditForm } from "@/features/admin/components/admin-service-edit-form"
import { Link } from "@/i18n/navigation"
import { ArrowLeft } from "lucide-react"

type PageProps = {
  params: Promise<{ locale: string; id: string }>
}

export default async function AdminServiceEditPage({ params }: PageProps) {
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
  const services = await getServices(locale)
  const service = services.find((s) => String(s.id) === id)

  if (!service) {
    notFound()
  }

  return (
    <AdminPageLayout
      title={isRTL ? `تعديل الخدمة — ${service.title}` : `Edit Service — ${service.title}`}
      description={
        isRTL
          ? `تعديل بيانات الخدمة ومزاياها · ID: ${service.id}`
          : `Edit service data and features · ID: ${service.id}`
      }
    >
      <AdminServiceEditForm service={service} locale={locale} />
    </AdminPageLayout>
  )
}
