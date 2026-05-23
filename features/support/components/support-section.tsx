import { Link } from "@/i18n/navigation"
import { getTranslations } from "next-intl/server"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"
import Image from "next/image"
import { cn } from "@/lib/utils"

function SupportChatIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-6 w-6 shrink-0", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        opacity="0.4"
        d="M8 10.5H16M8 14H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3 11.5C3 7.36 6.36 4 10.5 4H13.5C17.64 4 21 7.36 21 11.5V14.5C21 18.64 17.64 22 13.5 22H12L8 20V22H6.5C4.01 22 2 19.99 2 17.5V11.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export async function SupportSection() {
  const t = await getTranslations("Landing.support")

  return (
    <SectionShell stagger={false} className="overflow-visible py-12 sm:py-14 lg:py-[72px]">
      <div className="relative isolate overflow-hidden rounded-[32px] bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#398DB3_0%,#2D7494_100%)] bg-size-[200px_200px,auto] bg-blend-[plus-lighter,normal] px-6 py-12 text-white shadow-[0_0_0_5px_#FFFFFF,0_0_0_4px_#C2E3FA,0_4px_5px_rgba(75,183,231,0.15),0_10px_13px_rgba(75,183,231,0.22),0_24px_32px_rgba(75,183,231,0.19),0_42px_107px_rgba(123,190,255,0.34)] sm:px-10 sm:py-16 lg:px-14 lg:py-[82px]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: "url('/contact/button-noise.png')",
            backgroundSize: "420px 420px",
          }}
          aria-hidden
        />

        <StaggerInView className="relative mx-auto flex max-w-[596px] flex-col items-center gap-10 text-center">
          <div className="space-y-6">
            <StaggerItem>
              <div className="mx-auto inline-flex items-center gap-2 rounded-lg bg-[rgba(64,160,202,0.5)] px-4 py-2 text-[12px] capitalize leading-[1.16] text-white">
                <Image src="/footer/icon-link.svg" alt="" width={16} height={16} />
                {t("eyebrow")}
              </div>
            </StaggerItem>
            <StaggerItem>
              <h2 className="font-heading text-balance text-[28px] font-bold capitalize leading-[1.5] sm:text-[32px] lg:text-[36px]">
                {t("title")}
              </h2>
            </StaggerItem>
            <StaggerItem>
              <p className="mx-auto max-w-[500px] text-[14px] leading-[1.16] text-[#F5F5F5] sm:text-[16px]">
                {t("description")}
              </p>
            </StaggerItem>
          </div>

          <StaggerItem>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact#faq"
                className="inline-flex h-11 min-w-[180px] items-center justify-center gap-2 rounded-xl bg-white px-4 text-[16px] font-medium text-[#006EA8] shadow-[inset_0_1px_4px_2px_#C2DDFF] transition-colors hover:bg-[#eef7ff]"
              >
                <Image src="/faqs.svg" alt="faqs" width={20} height={20} />
                {t("actions.faqs")}
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-11 min-w-[180px] items-center justify-center gap-2 rounded-xl bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#006EA8_0%,#005685_100%)] bg-size-[120px_120px,auto] bg-blend-[plus-lighter,normal] px-4 text-[16px] font-medium text-white shadow-[0_0_0_5px_#FFFFFF,0_0_0_4px_#E8F2FF,0_4px_5px_rgba(0,86,133,0.15),0_10px_13px_rgba(0,86,133,0.22),0_24px_32px_rgba(0,86,133,0.19)] transition-[filter] hover:brightness-105"
              >
                <Image src="/contact.svg" alt="contact" width={20} height={20} />
                {t("actions.contact")}
              </Link>
            </div>
          </StaggerItem>
        </StaggerInView>
      </div>
    </SectionShell>
  )
}
