"use client"

import { useState, type ComponentProps, type FormEvent } from "react"
import Image from "next/image"
import { BriefcaseBusiness } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PrimaryButton } from "@/components/ui/primary-button"
import { StaggerInView, StaggerItem } from "@/features/shared-home"
import { JobsListing } from "@/features/jobs/components/jobs-listing"
import type { Category, Job } from "@/lib/api/types"

type JobsPageClientProps = {
  locale: string
  jobs: Job[]
  total: number
  categories: Category[]
  hero: {
    eyebrow: string
    title: string
    description: string
    searchPlaceholder: string
    search: string
  }
  listingLabels: ComponentProps<typeof JobsListing>["labels"]
  stateOptions: string[]
  categoryOptions: string[]
}

export function JobsPageClient({
  locale,
  jobs,
  total,
  categories,
  hero,
  listingLabels,
  stateOptions,
  categoryOptions,
}: JobsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAppliedSearch(searchQuery.trim())
  }

  return (
    <>
      <div className="relative overflow-hidden">
        <Image
          src="/home/hero/hero-bg-image.png"
          alt=""
          fill
          className="pointer-events-none object-cover opacity-[0.12] mix-blend-overlay"
          aria-hidden
          priority
        />
        <StaggerInView className="relative mx-auto flex max-w-[866px] flex-col items-center gap-7 py-[62px] text-center">
          <StaggerItem>
            <div className="flex w-full flex-col items-center gap-7 text-center">
              <p className="inline-flex items-center gap-2 rounded-[8px] bg-[rgba(64,160,202,0.25)] px-4 py-2 text-[12px] leading-[1.16] text-[#40A0CA]">
                <BriefcaseBusiness className="h-4 w-4" />
                {hero.eyebrow}
              </p>
              <h1 className="font-heading text-balance text-[36px] leading-[1.16] font-bold text-[#171717] sm:text-[52px]">
                {hero.title}
              </h1>
              <p className="max-w-[690px] text-[16px] leading-normal text-[#525252]">
                {hero.description}
              </p>
              <form
                className="mt-2 flex w-full max-w-[584px] flex-col gap-3 sm:flex-row"
                onSubmit={handleSearch}
              >
                <Input
                  name="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={hero.searchPlaceholder}
                  className="h-[52px] rounded-[6px] border-[#c4d9e8] bg-[#e8f2ff] text-[#123854] placeholder:text-[#89a1b3]"
                />
                <PrimaryButton
                  type="submit"
                  className="h-[52px] min-w-[138px] shrink-0 rounded-[8px] text-[18px] font-medium sm:w-auto"
                >
                  {hero.search}
                </PrimaryButton>
              </form>
            </div>
          </StaggerItem>
        </StaggerInView>
      </div>

      <JobsListing
        locale={locale}
        jobs={jobs}
        total={total}
        categories={categories}
        searchQuery={appliedSearch}
        labels={listingLabels}
        stateOptions={stateOptions}
        categoryOptions={categoryOptions}
      />
    </>
  )
}
