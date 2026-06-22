import Image from "next/image"
import type { Job } from "@/lib/api/types"
import { resolveJobImageUrl } from "@/features/jobs/lib/resolve-job-image"

import { useLocale } from "next-intl"
import { getLocalizedName } from "@/features/jobs/lib/job-display"

type JobDetailHeroProps = {
  job: Job
  companyName: string
  industryFallback: string
}

export function JobDetailHero({ job, companyName, industryFallback }: JobDetailHeroProps) {
  const locale = useLocale()
  const industry =
    getLocalizedName(job.company?.company_type?.name || job.category?.name, locale) || industryFallback
  const bannerSrc = resolveJobImageUrl(job.image) ?? "/home/hero/hero-bg-image.png"
  const displayCompany = job.company?.name ?? companyName

  return (
    <div className="bg-white pt-6 sm:pt-8">
      <div className="mx-auto max-w-[1312px] px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Banner cover image */}
          <div className="relative h-[220px] overflow-hidden rounded-[16px] sm:h-[300px] lg:h-[378px]">
            <Image
              src={bannerSrc}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1312px) 100vw, 1312px"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,18,34,0.08)_0%,rgba(0,18,34,0.35)_100%)]" />
          </div>

          {/* Logo overlapping the banner bottom border */}
          <div className="absolute start-6 -bottom-9 z-20 size-[72px] overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_8px_24px_rgba(0,43,70,0.12)] sm:size-[88px] sm:-bottom-11">
            {job.company?.logo ? (
              <img
                src={job.company.logo}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center bg-[#e8f2ff] text-[18px] font-bold text-[#006EA8]">
                {displayCompany.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Text content below the banner */}
        <div className="mt-11 sm:mt-14 text-start px-2">
          <h1 className="text-[28px] font-bold leading-[1.2] text-[#262626] sm:text-[36px]">
            {displayCompany}
          </h1>
          <p className="mt-1 text-[16px] leading-[1.2] text-[#525252]">{industry}</p>
        </div>
      </div>
    </div>
  )
}
