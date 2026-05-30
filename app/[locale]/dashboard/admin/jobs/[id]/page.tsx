import { notFound, redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getAdminJobById } from "@/lib/api/services/admin.service"
import { AdminJobDetailView } from "@/features/admin/components/admin-job-detail-view"

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const jobId = Number(id)

  if (!Number.isFinite(jobId) || jobId <= 0) {
    redirect(`/${locale}/dashboard/admin/jobs`)
  }

  const session = await getSession()

  if (!session.user || session.user.role !== "admin" || !session.accessToken) {
    redirect(`/${locale}/dashboard`)
  }

  const job = await getAdminJobById(jobId, session.accessToken, locale)

  if (!job) {
    notFound()
  }

  return <AdminJobDetailView job={job} locale={locale} />
}
