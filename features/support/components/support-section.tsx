import { PrimaryButton } from "@/components/ui/primary-button"
import { Card, CardContent } from "@/components/ui/card"
import { getTranslations } from "next-intl/server"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"
import { CircleHelp, SendHorizonal } from "lucide-react"

export async function SupportSection() {
  const t = await getTranslations("Landing.support")

  return (
    <SectionShell stagger={false} className="bg-white py-[56px] lg:py-[72px]">
      <Card className="overflow-hidden rounded-[24px] border border-[#75C7EE] bg-[url('/contact/button-noise.png'),radial-gradient(140%_140%_at_50%_0%,#2D9FD5_0%,#0A79B4_45%,#076193_100%)] bg-size-[150px_150px,auto] bg-blend-[plus-lighter,normal] text-white shadow-[0_14px_36px_rgba(0,86,133,0.28),inset_0_0_0_1px_rgba(232,242,255,0.45),inset_0_0_30px_rgba(232,242,255,0.22)]">
        <CardContent className="px-6 py-10 text-center sm:px-10 lg:px-12 lg:py-14">
          <StaggerInView className="mx-auto max-w-[760px] space-y-5">
            <StaggerItem>
              <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[12px] leading-none font-medium text-[#e8f2ff]">
                <span className="inline-block size-1.5 rounded-full bg-[#a9e2ff]" />
                {t("eyebrow")}
              </p>
            </StaggerItem>
            <StaggerItem>
              <h2 className="text-balance text-[34px] leading-[1.2] font-semibold lg:text-[50px]">{t("title")}</h2>
            </StaggerItem>
            <StaggerItem>
              <p className="mx-auto max-w-[700px] text-[18px] leading-[1.35] font-normal text-[#d7e7f1]">{t("description")}</p>
            </StaggerItem>
            <StaggerItem>
              <div className="flex flex-wrap justify-center gap-4 pt-3">
                <PrimaryButton className="h-[50px] w-auto min-w-[160px] rounded-[14px] bg-white bg-none px-6 text-[20px] font-semibold text-[#006EA8] shadow-none hover:bg-[#eef7ff]">
                  <CircleHelp className="size-4" />
                  {t("actions.faqs")}
                </PrimaryButton>
                <PrimaryButton className="h-[50px] w-auto min-w-[180px] rounded-[14px] px-6 text-[20px] font-semibold">
                  <SendHorizonal className="size-4" />
                  {t("actions.contact")}
                </PrimaryButton>
              </div>
            </StaggerItem>
          </StaggerInView>
        </CardContent>
      </Card>
    </SectionShell>
  )
}
