"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"
import { getJobFilterKeys, getJobKeys } from "@/features/jobs/services/jobs.service"
import { PrimaryButton } from "@/components/ui/primary-button"
import { MoveUpRight } from "lucide-react"

const jobCategoryMap: Record<string, string> = {
  frontend: "development",
  marketing: "marketing",
  uiux: "design",
  sales: "marketing",
  hr: "marketing",
  accounting: "medical",
}

export function JobsSection() {
  const t = useTranslations("Landing.jobs")
  const jobs = getJobKeys()
  const filters = getJobFilterKeys()
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("all")
  const [activeJob, setActiveJob] = useState<string | null>(null)

  const visibleJobs = useMemo(() => {
    if (activeFilter === "all") return jobs
    return jobs.filter((job) => jobCategoryMap[job] === activeFilter)
  }, [activeFilter, jobs])

  return (
    <SectionShell id="jobs" stagger={false} className="bg-white py-[82px]">
      <StaggerInView className="space-y-4 text-center">
        <StaggerItem>
          <p className="text-[12px] leading-[1.16] font-normal text-[#40A0CA]">{t("eyebrow")}</p>
        </StaggerItem>
        <StaggerItem>
          <h2 className="mx-auto max-w-[866px] text-balance text-[48px] leading-[1.05] font-bold text-[#171717] md:text-[52px]">
            {t("title")}
          </h2>
        </StaggerItem>
        <StaggerItem>
          <p className="mx-auto max-w-[500px] text-[24px] leading-[1.16] font-normal text-[#525252] md:text-[28px]">
            {t("description")}
          </p>
        </StaggerItem>
      </StaggerInView>

      <StaggerInView className="mx-auto mt-8 flex w-fit flex-wrap justify-center gap-3">
        {filters.map((filter) => (
          <StaggerItem key={filter}>
          <button
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-[64px] border px-4 py-2 text-[18px] font-medium uppercase transition-colors ${
              activeFilter === filter
                ? "border-[#0082C5] bg-[linear-gradient(180deg,#006EA8_0%,#005685_100%)] text-white"
                : "border-[#78A3BE] bg-white text-[#8A8F94] hover:border-[#0082C5] hover:bg-[linear-gradient(180deg,#006EA8_0%,#005685_100%)] hover:text-white"
            }`}
          >
            {t(`filters.${filter}`)}
          </button>
          </StaggerItem>
        ))}
      </StaggerInView>

      <StaggerInView className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleJobs.map((job) => (
          <StaggerItem key={job}>
          <Card
            onMouseEnter={() => setActiveJob(job)}
            onMouseLeave={() => setActiveJob((current) => (current === job ? null : current))}
            onClick={() => setActiveJob(job)}
            className={`group cursor-pointer rounded-[8px] border border-[#78A3BE] transition-colors ${
              activeJob === job
                ? "bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#006EA8_0%,#005685_100%)] bg-size-[180px_180px,auto] bg-blend-[plus-lighter,normal] text-white shadow-[0_0_0_2px_rgba(120,163,190,0.1),0_18px_38px_rgba(0,86,133,0.25)]"
                : "bg-white hover:bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#006EA8_0%,#005685_100%)] hover:bg-size-[180px_180px,auto] hover:bg-blend-[plus-lighter,normal] hover:text-white hover:shadow-[0_0_0_2px_rgba(120,163,190,0.1),0_18px_38px_rgba(0,86,133,0.25)]"
            }`}
          >
            <CardContent className="space-y-4 p-5">
              <Badge
                className="w-fit rounded-[64px] bg-[linear-gradient(180deg,#006EA8_0%,#005685_100%)] px-3 py-1 text-[12px] text-white group-hover:bg-white/20"
              >
                {t(`items.${job}.department`)}
              </Badge>
              <h3 className="text-[20px] leading-[1.16] font-bold text-[#262626] group-hover:text-white">
                {t(`items.${job}.title`)}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-[16px] leading-[1.16] font-medium text-[#002B46] group-hover:text-white">$1200 /month</p>
                <p className="text-[16px] leading-[1.16] font-medium text-[#002B46] group-hover:text-white">{t(`items.${job}.type`)}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-full border border-[#78A3BE] group-hover:border-white/60">
                  <span className="size-4 rounded-full border border-[#78A3BE] group-hover:border-white/70" />
                </div>
                <p className="text-[16px] leading-[1.16] font-normal text-[#525252] group-hover:text-[#e8f2ff]">
                  {t(`items.${job}.company`)}
                </p>
              </div>
              <PrimaryButton className="h-[44px] rounded-[10px] text-[24px] font-medium">
                {t("moreDetails")}
                <MoveUpRight className="size-5" />
              </PrimaryButton>
            </CardContent>
          </Card>
          </StaggerItem>
        ))}
      </StaggerInView>

      <StaggerInView className="mt-8 flex justify-center">
        <StaggerItem>
          <PrimaryButton className="h-11 w-auto rounded-[10px] px-8 text-[24px] font-medium">{t("showAll")}</PrimaryButton>
        </StaggerItem>
      </StaggerInView>
    </SectionShell>
  )
}
