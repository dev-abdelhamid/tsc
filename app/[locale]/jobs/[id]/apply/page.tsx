import { notFound, redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getJobDetailForLocale } from "@/features/jobs/lib/jobs-for-locale"
import { getUserPortfolio } from "@/lib/api/services/portfolio.service"
import { getTranslations } from "next-intl/server"
import JobApplicationClient from "./client"

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export default async function JobApplicationPage({ params }: Props) {
  const { id, locale } = await params
  setRequestLocale(locale)
  
  // Check authentication
  const session = await getSession()
  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  // Validate job ID
  const jobId = Number(id)
  if (!Number.isFinite(jobId) || jobId <= 0) notFound()

  // Get translations
  const t = await getTranslations("Landing.jobs")
  const jobsT = await getTranslations("Landing.jobsPage")

  // Fetch job details
  let jobDetail = null
  try {
    const detail = await getJobDetailForLocale(locale, jobId, jobsT)
    if (detail) jobDetail = detail.job
  } catch (err) {
    console.error("[Job Apply] Failed to fetch job:", err)
  }

  if (!jobDetail) notFound()

  // Fetch user portfolio
  let portfolio = null
  try {
    portfolio = await getUserPortfolio(session.accessToken, locale)
  } catch (err) {
    console.error("[Job Apply] Failed to fetch portfolio:", err)
  }

  return (
    <JobApplicationClient
      jobId={jobId}
      locale={locale}
      job={jobDetail}
      initialPortfolio={portfolio}
      token={session.accessToken}
    />
  )
}
