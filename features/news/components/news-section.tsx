import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { getTranslations } from "next-intl/server"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"
import { getNewsKeys } from "@/features/news/services/news.service"
import { PrimaryButton } from "@/components/ui/primary-button"
import { CalendarDays, SendHorizonal } from "lucide-react"

export async function NewsSection() {
  const t = await getTranslations("Landing.news")
  const news = getNewsKeys()

  return (
    <SectionShell id="news" stagger={false} className="bg-[#E8F2FF] py-[82px]">
      <StaggerInView className="space-y-4">
        <StaggerItem>
          <p className="inline-flex items-center gap-2 rounded-[8px] bg-[rgba(64,160,202,0.25)] px-4 py-2 text-[12px] leading-[1.16] font-normal text-[#40A0CA]">
            <SendHorizonal className="h-4 w-4" />
            {t("eyebrow")}
          </p>
        </StaggerItem>
        <StaggerItem>
          <h2 className="max-w-[866px] text-balance text-[52px] leading-[1.05] font-bold text-[#171717]">{t("title")}</h2>
        </StaggerItem>
        <StaggerItem>
          <p className="max-w-[500px] text-[16px] leading-[1.35] font-normal text-[#525252]">{t("description")}</p>
        </StaggerItem>
      </StaggerInView>

      <StaggerInView className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <StaggerItem>
          <article className="space-y-5">
            <Image src="/home/content/news-feature.png" alt="" width={1287} height={858} className="h-[445px] w-full object-cover" />
            <div className="space-y-5">
              <h3 className="text-[52px] leading-[1.05] font-medium text-[#171717]">{t("items.first.title")}</h3>
              <p className="max-w-[620px] text-[20px] leading-tight text-[#525252]">{t("items.first.description")}</p>
              <Link href="/news/first">
                <PrimaryButton className="h-[52px] w-[220px] text-[20px] font-medium">
                  {t("readMore")}
                </PrimaryButton>
              </Link>
            </div>
          </article>
        </StaggerItem>
        <StaggerItem className="space-y-5">
          {news.slice(1).map((item, idx) => (
            <Link key={item} href={`/news/${item}`} className="block">
              <article className="flex h-[223px] items-start gap-8 self-stretch">
                <Image
                  src={`/home/content/news-${idx + 1}.png`}
                  alt=""
                  width={223}
                  height={223}
                  className="h-[223px] w-[223px] rounded-[14px] object-cover"
                />
                <div className="flex flex-1 flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-[48px] leading-[1.05] font-medium text-[#171717]">{t(`items.${item}.title`)}</h3>
                    <p className="text-[16px] leading-tight text-[#525252]">{t(`items.${item}.description`)}</p>
                  </div>
                  <p className="inline-flex items-center gap-2 text-[16px] leading-[1.16] text-[#525252]">
                    <CalendarDays className="h-4 w-4 text-[#40A0CA]" />
                    {t(`items.${item}.date`)}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </StaggerItem>
      </StaggerInView>
    </SectionShell>
  )
}
