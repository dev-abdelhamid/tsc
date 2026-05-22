import Image from "next/image"
import { CalendarDays, Camera, CirclePlay, SendHorizonal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { getTranslations } from "next-intl/server"
import { getNewsKeys } from "@/features/news/services/news.service"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"

const NEWS_IMAGES = {
  featured: "/home/content/news-feature.png",
  first: "/home/content/news-1.png",
  second: "/home/content/news-2.png",
  third: "/home/content/news-3.png",
  fourth: "/home/content/news-1.png",
  fifth: "/home/content/news-2.png",
  sixth: "/home/content/news-3.png",
} as const

export async function NewsPage() {
  const newsT = await getTranslations("Landing.news")
  const t = await getTranslations("Landing.newsPage")
  const footerT = await getTranslations("Landing.footer")
  const contactT = await getTranslations("Landing.contact")
  const keys = getNewsKeys().slice(0, 3)
  const ctaButtonClassName =
    "h-[44px] w-[220px] rounded-[12px] border border-white bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#006EA8_0%,#005685_100%)] bg-size-[300px_300px,auto] bg-blend-overlay px-4 text-[16px] font-medium text-white shadow-[0_0_0_5px_rgba(255,255,255,1),0_0_0_4px_rgba(232,242,255,1),0_4px_5px_rgba(0,86,133,0.15),0_10px_13px_rgba(0,86,133,0.22),0_25px_32px_rgba(0,86,133,0.19),0_42px_107px_rgba(123,190,255,0.34),inset_0_1px_4px_2px_rgba(194,221,255,1),inset_0_1px_18px_2px_rgba(232,242,255,1)] hover:brightness-105"

  return (
    <main className="flex-1 bg-white">

      <SectionShell stagger={false} className="py-[71px] pb-[98px]">
        <StaggerInView className="space-y-16">
          <StaggerItem>
          <div className="max-w-[643px] space-y-6">
            <p className="inline-flex items-center gap-2 rounded-[8px] bg-[rgba(64,160,202,0.25)] px-4 py-2 text-[12px] leading-[1.16] text-[#40A0CA]">
              <SendHorizonal className="h-4 w-4" />
              {newsT("eyebrow")}
            </p>
            <h1 className="font-heading text-[36px] leading-normal font-bold text-[#171717]">{newsT("title")}</h1>
            <p className="max-w-[500px] text-[16px] leading-normal text-[#525252]">{newsT("description")}</p>
          </div>
          </StaggerItem>

          <StaggerItem>
          <article className="grid items-center gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-[16px]">
              <Image src={NEWS_IMAGES.featured} alt={t("featured.imageAlt")} width={860} height={445} className="h-[445px] w-full object-cover" />
            </div>

            <div className="flex h-full flex-col justify-between gap-8 py-8">
              <div className="space-y-8">
                <h2 className="text-[32px] leading-[1.16] font-bold text-[#171717]">{t("featured.title")}</h2>
                <p className="text-[20px] leading-normal text-[#525252]">{t("content.opening")}</p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <Link href="/news/first">
                  <Button className={ctaButtonClassName}>{newsT("readMore")}</Button>
                </Link>
                <p className="inline-flex items-center gap-2 text-[16px] leading-[1.16] text-[#525252]">
                  <CalendarDays className="h-4 w-4 text-[#40A0CA]" />
                  {t("featured.date")}
                </p>
              </div>
            </div>
          </article>
          </StaggerItem>

          <StaggerInView className="grid gap-8 md:grid-cols-3">
            {keys.map((key) => (
              <StaggerItem key={key}>
              <article className="space-y-4">
                <div className="overflow-hidden rounded-[16px]">
                  <Image src={NEWS_IMAGES[key]} alt={t(`items.${key}.imageAlt`)} width={416} height={223} className="h-[223px] w-full object-cover" />
                </div>

                <div className="space-y-6 py-4">
                  <div className="space-y-6">
                    <h3 className="text-[24px] leading-[1.16] font-bold text-[#171717]">{t(`items.${key}.title`)}</h3>
                    <p className="text-[16px] leading-normal text-[#525252]">{t(`items.${key}.description`)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/news/${key}`}>
                      <Button className={ctaButtonClassName}>{newsT("readMore")}</Button>
                    </Link>
                    <p className="inline-flex items-center gap-2 text-[16px] leading-[1.16] text-[#525252]">
                      <CalendarDays className="h-4 w-4 text-[#40A0CA]" />
                      {t(`items.${key}.date`)}
                    </p>
                  </div>
                </div>
              </article>
              </StaggerItem>
            ))}
          </StaggerInView>
        </StaggerInView>
      </SectionShell>

    </main>
  )
}
