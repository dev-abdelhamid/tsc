import { Bookmark } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { PrimaryButton } from "@/components/ui/primary-button"
import type { Job } from "@/lib/api/types"
import {
  formatAgeRange,
  formatApplicationDeadline,
  formatDetailEmployment,
  formatGenderForDetail,
  formatJobSalaryRange,
} from "@/features/jobs/lib/job-display"
import { RelatedJobCard } from "@/features/jobs/components/related-job-card"
import ApplyButton from "@/features/jobs/components/apply-button"


type JobDetailSidebarProps = {
  job: Job
  locale: string
  relatedJobs: Job[]
  labels: {
    monthly: string
    details: string
    industry: string
    employmentType: string
    vacancy: string
    gender: string
    age: string
    applicationDeadline: string
    applyForJob: string
    relatedJobs: string
    postedAgo: string
    companySubLabel: string
  }
  applyHref?: string
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-8 px-2 py-0">
      <span className="text-[16px] leading-[1.16] text-[#A3A3A3]">{label}</span>
      <span className="text-end text-[16px] font-semibold leading-[1.16] text-[#525252]">
        {value}
      </span>
    </div>
  )
}

export function JobDetailSidebar({
  job,
  locale,
  relatedJobs,
  labels,
  applyHref = "/sign-in",
}: JobDetailSidebarProps) {
  const industry = job.company?.company_type?.name || job.category?.name
  const employment = formatDetailEmployment(job)
  const salaryRange = formatJobSalaryRange(job)
  const ageRange = formatAgeRange(job, "")
  const deadline = formatApplicationDeadline(job.application_deadline, locale)
  const genderLabel = job.gender ? formatGenderForDetail(job.gender) : null

  const showSalary = salaryRange !== "—"
  const showIndustry = Boolean(industry?.trim())
  const showEmployment = Boolean(employment)
  const showVacancy = job.vacancy != null
  const showGender = Boolean(genderLabel)
  const showAge = Boolean(ageRange)
  const showDeadline = Boolean(job.application_deadline?.trim())

  const hasDetails =
    showIndustry ||
    showEmployment ||
    showVacancy ||
    showGender ||
    showAge ||
    showDeadline

  return (
    <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-[16px] bg-white p-8 shadow-[0_8px_32px_rgba(0,43,70,0.06)]">
        {showSalary ? (
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[32px] font-black leading-[1.16] text-[#262626] sm:text-[40px]">
                {salaryRange}
              </p>
              <p className="mt-1 text-[14px] font-medium leading-[1.16] text-[#525252]">
                {labels.monthly}
              </p>
            </div>
            <button
              type="button"
              className="rounded-full p-1 text-[#40A0CA] transition hover:bg-[#e8f2ff]"
              aria-label="Bookmark"
            >
              <Bookmark className="size-8 fill-[#40A0CA]/25 stroke-[#40A0CA]" />
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-full p-1 text-[#40A0CA] transition hover:bg-[#e8f2ff]"
              aria-label="Bookmark"
            >
              <Bookmark className="size-8 fill-[#40A0CA]/25 stroke-[#40A0CA]" />
            </button>
          </div>
        )}

        {hasDetails ? (
          <>
            <h3 className="mt-8 text-[12px] leading-[1.16] text-[#A3A3A3]">{labels.details}</h3>
            <div className="mt-6 flex flex-col gap-5">
              {showIndustry ? <DetailRow label={labels.industry} value={industry!} /> : null}
              {showEmployment ? (
                <DetailRow label={labels.employmentType} value={employment!} />
              ) : null}
              {showVacancy ? (
                <DetailRow label={labels.vacancy} value={String(job.vacancy)} />
              ) : null}
              {showGender ? <DetailRow label={labels.gender} value={genderLabel!} /> : null}
              {showAge ? <DetailRow label={labels.age} value={ageRange} /> : null}
              {showDeadline ? <DetailRow label={labels.applicationDeadline} value={deadline} /> : null}
            </div>
          </>
        ) : null}

        {/* Client-side apply button with optimistic update */}
        <PrimaryButton asChild className="mt-8 h-[44px] w-full rounded-[12px] text-[16px] font-medium">
          {/* Replace link with client ApplyButton component */}
          {/* @ts-ignore */}
          <div>
            {/* Using client component */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <ApplyButton jobId={job.id} locale={locale} label={labels.applyForJob} />
          </div>
        </PrimaryButton>

      </div>

      {relatedJobs.length > 0 ? (
        <div className="flex flex-col gap-8">
          <h3 className="text-[32px] font-semibold leading-[1.5] text-[#002B46]">
            {labels.relatedJobs}
          </h3>
          <div className="flex flex-col gap-4">
            {relatedJobs.map((related) => (
              <RelatedJobCard
                key={related.id}
                job={related}
                locale={locale}
                postedAgoFallback={labels.postedAgo}
                companySubLabel={labels.companySubLabel}
              />
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  )
}
