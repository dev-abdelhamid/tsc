"use client"

import Image from "next/image"
import { useState } from "react"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"

type AboutStorySectionProps = {
  eyebrow: string
  title: string
  missionTabLabel: string
  visionTabLabel: string
  developmentTabLabel: string
  descriptionOne: string
  descriptionTwo: string
  storyImageSrc: string
  storyImageAlt: string
}

export function AboutStorySection({
  eyebrow,
  title,
  missionTabLabel,
  visionTabLabel,
  developmentTabLabel,
  descriptionOne,
  descriptionTwo,
  storyImageSrc,
  storyImageAlt,
}: AboutStorySectionProps) {
  const tabs = [
    { key: "mission", label: missionTabLabel },
    { key: "vision", label: visionTabLabel },
    { key: "development", label: developmentTabLabel },
  ] as const
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>("mission")
  const isRemoteImage = /^https?:\/\//.test(storyImageSrc)

  return (
    <SectionShell stagger={false} className="bg-white py-[82px]">
      <StaggerInView className="grid items-center gap-8 lg:grid-cols-2">
        <StaggerItem>
          <div className="space-y-5">
            <p className="inline-flex items-center rounded-[8px] bg-[#eaf4fb] px-3 py-2 text-sm font-medium text-[#0f7abd]">
              {eyebrow}
            </p>
            <h2 className="max-w-[540px] text-balance text-[44px] leading-[1.12] font-bold text-[#001222]">
              {title}
            </h2>
            <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label={title}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key

                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive ? "true" : "false"}
                    onClick={() => setActiveTab(tab.key)}
                    className={
                      isActive
                        ? "inline-flex h-11 items-center rounded-full bg-[#eaf4fb] px-5 text-sm font-semibold text-[#0f7abd]"
                        : "inline-flex h-11 items-center rounded-full border border-[#d7e4ef] bg-white px-5 text-sm font-medium text-[#8da2b6]"
                    }
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
            <p className="max-w-[620px] text-[16px] leading-relaxed text-[#385066]">{descriptionOne}</p>
            <p className="max-w-[620px] text-[16px] leading-relaxed text-[#385066]">{descriptionTwo}</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="relative h-[330px] w-full overflow-hidden rounded-[14px] border border-[#dce9f4] shadow-[0_20px_42px_rgba(0,25,45,0.16)]">
            <Image
              src={storyImageSrc}
              alt={storyImageAlt}
              fill
              unoptimized={isRemoteImage}
              className="object-cover"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
        </StaggerItem>
      </StaggerInView>
    </SectionShell>
  )
}
