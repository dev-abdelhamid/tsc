import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { getTranslations } from "next-intl/server"
import { PrimaryButton } from "@/components/ui/primary-button"
import { SectionShell } from "@/features/shared-home"

export async function SupportSection() {
  const t = await getTranslations("Landing.support")

  return (
    <SectionShell stagger={false} className="overflow-visible bg-white py-12 sm:py-14 lg:py-[72px]">
      <div className="relative isolate overflow-hidden rounded-[32px] bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#398DB3_0%,#2D7494_100%)] bg-[length:200px_200px,auto] bg-blend-[plus-lighter,normal] px-6 py-12 text-white shadow-[0_0_0_5px_#FFFFFF,0_0_0_4px_#C2E3FA,0_4px_5px_rgba(75,183,231,0.15),0_10px_13px_rgba(75,183,231,0.22),0_24px_32px_rgba(75,183,231,0.19),0_42px_107px_rgba(123,190,255,0.34)] sm:px-10 sm:py-16 lg:px-14 lg:py-[82px]">
        <div
          className="pointer-events-none absolute inset-0 bg-[url('/contact/button-noise.png')] bg-[length:420px_420px] opacity-[0.15] mix-blend-overlay"
          aria-hidden
        />

        <div className="relative z-[1] flex flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold tracking-[0.06em] text-white/95">
            <Image src="/footer/icon-link.svg" alt="" width={16} height={16} aria-hidden />
            <span>{t("eyebrow")}</span>
          </div>

          <div className="space-y-4">
            <h2 className="mx-auto max-w-[760px] text-balance font-[family-name:var(--font-encode-sans-narrow)] text-[30px] font-bold leading-[1.1] text-white sm:text-[36px] lg:text-[42px]">
              {t("title")}
            </h2>
            <p className="mx-auto max-w-[640px] text-sm leading-7 text-white/90 sm:text-base">
              {t("description")}
            </p>
          </div>

          <div className="mt-2 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Link
              href="/faqs"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-white/20 bg-white px-5 py-3 text-sm font-semibold text-[#006EA8] shadow-[0_10px_12px_rgba(0,0,0,0.08)] transition hover:bg-[#F4FBFF]"
            >
              <Image src="/faqs.svg" alt="" width={18} height={18} aria-hidden />
              <span>{t("actions.faqs")}</span>
            </Link>

            <PrimaryButton asChild className="h-11 min-w-[210px] px-5 text-sm font-semibold">
              <Link href="/contact">
                <Image src="/contact.svg" alt="" width={18} height={18} aria-hidden />
                <span>{t("actions.contact")}</span>
              </Link>
            </PrimaryButton>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
