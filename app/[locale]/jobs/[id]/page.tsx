import { notFound } from "next/navigation"
import { JobDetailPage } from "@/features/jobs/components/job-detail-page"

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export default async function JobDetailRoutePage({ params }: Props) {
  const { id } = await params
  const jobId = Number(id)
  if (!Number.isFinite(jobId) || jobId <= 0) notFound()

  return <JobDetailPage jobId={jobId} />
}
