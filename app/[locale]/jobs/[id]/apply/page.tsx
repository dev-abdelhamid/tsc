import { notFound, redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getPublicJobDetail } from "@/lib/api/services/jobs.service"
import { getUserPortfolio } from "@/lib/api/services/portfolio.service"
import JobApplicationClient from "./client"

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export default async function JobApplyPage({ params }: Props) {
  const { id, locale } = await params
  setRequestLocale(locale)

  const session = await getSession()
  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  // Only users can apply for jobs (admin and company cannot)
  if (session.user?.role !== "user") {
    redirect(`/${locale}/dashboard`)
  }

  const jobId = Number(id)
  if (!Number.isFinite(jobId) || jobId <= 0) {
    notFound()
  }

  // Fetch job details and user's saved portfolio
  const [jobDetail, portfolio] = await Promise.all([
    getPublicJobDetail(jobId, locale),
    getUserPortfolio(session.accessToken, locale).catch(() => undefined),
  ])

  if (!jobDetail?.job) {
    notFound()
  }

  return (
    <JobApplicationClient
      jobId={jobId}
      locale={locale}
      job={jobDetail.job}
      initialPortfolio={portfolio}
      token={session.accessToken}
    />
  )
}
