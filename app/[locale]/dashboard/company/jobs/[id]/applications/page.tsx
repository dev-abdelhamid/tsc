import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { CompanyJobApplicationsPage } from "@/features/company-jobs/components/company-job-applications-page"

export default async function CompanyJobApplicationsRoutePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const jobId = Number(id)
  if (!Number.isFinite(jobId) || jobId <= 0) {
    redirect(`/${locale}/dashboard/company/jobs`)
  }

  const session = await getSession()
  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }
  if (session.user?.role !== "company") {
    redirect(`/${locale}/dashboard`)
  }

  return (
    <CompanyJobApplicationsPage
      jobId={jobId}
      locale={locale}
      accessToken={session.accessToken}
    />
  )
}
