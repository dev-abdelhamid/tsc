import Image from "next/image"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"

type AboutIntroSectionProps = {
  eyebrow: string
  title: string
  descriptionOne: string
  descriptionTwo: string
}

export function AboutIntroSection({ eyebrow, title, descriptionOne, descriptionTwo }: AboutIntroSectionProps) {
  return (
    <SectionShell stagger={false} className="bg-white py-[72px] lg:py-[84px]">
      <StaggerInView className="space-y-10 lg:space-y-12">
        <StaggerItem>
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            <div className="space-y-5 lg:col-span-5">
              <p className="inline-flex w-fit items-center rounded-[8px] bg-[#eaf4fb] px-3 py-1.5 text-sm font-medium text-[#0f7abd]">{eyebrow}</p>
              <h1 className="max-w-[560px] text-balance text-[44px] leading-[1.08] font-bold text-[#001222] lg:text-[56px]">{title}</h1>
            </div>

            <p className="max-w-[520px] text-[17px] leading-relaxed text-[#385066] lg:col-span-3">{descriptionOne}</p>

            <p className="max-w-[520px] text-[17px] leading-relaxed text-[#385066] lg:col-span-4">{descriptionTwo}</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="relative min-h-[320px] lg:min-h-[390px]">
            <div className="absolute bottom-0 h-[250px] w-[66%] overflow-hidden rounded-[12px] border border-[#dce9f4] shadow-[0_20px_42px_rgba(0,25,45,0.16)] ltr:left-0 rtl:right-0 lg:h-[300px]">
              <Image src="/home/content/news-2.png" alt="" fill className="object-cover" sizes="(min-width: 1024px) 48vw, 100vw" />
            </div>
            <div className="absolute top-[55px] h-[190px] w-[50%] overflow-hidden rounded-[12px] border-4 border-white shadow-[0_22px_40px_rgba(0,25,45,0.22)] ltr:right-[2%] rtl:left-[2%] lg:h-[235px]">
              <Image src="/home/content/testimonial-right-2.png" alt="" fill className="object-cover" sizes="(min-width: 1024px) 34vw, 70vw" />
            </div>
          </div>
        </StaggerItem>
      </StaggerInView>
    </SectionShell>
  )
}
