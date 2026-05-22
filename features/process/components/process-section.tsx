import { getTranslations } from "next-intl/server"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"
import { getProcessSteps } from "@/features/process/services/process.service"
import { UserRound, ClipboardList, BriefcaseBusiness, Globe } from "lucide-react"

const icons: Record<string, React.ElementType> = {
  createAccount: UserRound,
  completeProfile: ClipboardList,
  apply: BriefcaseBusiness,
}

const CurvedArrow = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 220 40"
    fill="none"
    preserveAspectRatio="xMidYMid meet"
  >
    <path
      d="M6 27C58 12 126 12 202 27"
      stroke="#41A0CA"
      strokeWidth="1.8"
      strokeDasharray="4 5"
      fill="none"
    />
    <path
      d="M196 22L206 27L196 33"
      stroke="#41A0CA"
      strokeWidth="1.8"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export async function ProcessSection() {
  const t = await getTranslations("Landing.process")
  const steps = getProcessSteps()

  return (
    <SectionShell stagger={false} className="relative overflow-hidden bg-[#001222] py-[72px] lg:py-[88px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center_bottom,rgba(65,160,202,0.42)_0%,rgba(65,160,202,0.18)_28%,rgba(0,18,34,0)_72%)]" />
      <StaggerInView className="relative space-y-6 text-center">
        <StaggerItem>
          <div className="mx-auto flex w-fit items-center gap-2 rounded-[8px] bg-[#04324F] px-4 py-2">
            <Globe className="h-[14px] w-[14px] text-[#40A0CA]" />
            <span className="text-[12px] leading-[1.16] font-normal text-[#40A0CA]">{t("eyebrow")}</span>
          </div>
        </StaggerItem>
        <StaggerItem>
          <h2 className="mx-auto max-w-[866px] text-balance font-heading text-[38px] leading-[1.16] font-bold text-[#F5F5F5] lg:text-[52px]">
            {t("title")}
          </h2>
        </StaggerItem>
        <StaggerItem>
          <p className="mx-auto max-w-[500px] text-[16px] leading-normal text-[#D4D4D4]">
            {t("description")}
          </p>
        </StaggerItem>
      </StaggerInView>

      <StaggerInView className="relative mt-20 grid gap-12 md:grid-cols-3">
        <div className="pointer-events-none absolute top-[18px] left-[20%] right-[53%] hidden md:block">
          <CurvedArrow className="h-[30px] w-full" />
        </div>
        <div className="pointer-events-none absolute top-[18px] left-[53%] right-[20%] hidden md:block">
          <CurvedArrow className="h-[30px] w-full" />
        </div>

        {steps.map((step) => {
          const IconComponent = icons[step] || UserRound
          return (
            <StaggerItem key={step}>
              <div className="relative flex flex-col items-center text-center">
                <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#144A69] shadow-[0_0_24px_rgba(65,160,202,0.2)]">
                  <IconComponent className="h-5 w-5 text-[#6BC1E6]" strokeWidth={2} />
                </div>
                <h3 className="mt-6 text-[20px] leading-[1.16] font-bold text-[#F5F5F5]">{t(`steps.${step}.title`)}</h3>
                <p className="mt-3 max-w-[280px] text-[16px] leading-normal text-[#D4D4D4]">{t(`steps.${step}.description`)}</p>
              </div>
            </StaggerItem>
          )
        })}
      </StaggerInView>
    </SectionShell>
  )
}
