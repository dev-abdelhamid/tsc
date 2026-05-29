import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"
import { getNewsForLocale } from "@/features/news/lib/news-fallback"
import { formatNewsDate } from "@/features/news/lib/format-news-date"
import { resolveNewsImageUrl } from "@/features/news/lib/resolve-news-image"
import { NewsCalendarIcon, NewsEyebrowGlobe } from "@/features/news/components/news-icons"
import { NewsReadMoreButton } from "@/features/news/components/news-read-more-button"
import { cn } from "@/lib/utils"

type NewsSectionProps = {
  override?: {
    title?: string
    description?: string
  }
}

export async function NewsSection({ override }: NewsSectionProps) {
  const locale = await getLocale()
  const t = await getTranslations("Landing.news")
  const items = await getNewsForLocale(locale, t, { per_page: 4 })

  const featured = items[0]
  const sideItems = items.slice(1, 4)
  const title = override?.title ?? t("title")
  const description = override?.description ?? t("description")

  if (!featured) return null

  return (
    <SectionShell id="news" stagger={false} className="overflow-visible bg-[#E8F2FF] py-12 sm:py-16 lg:py-[82px]">
      <StaggerInView className="flex flex-col gap-6 text-start">
        <StaggerItem>
          <div className="inline-flex items-center gap-2 rounded-lg bg-[rgba(64,160,202,0.25)] px-4 py-2 text-[12px] leading-[1.16] font-normal text-[#002B46]">
            <NewsEyebrowGlobe />
            {t("eyebrow")}
          </div>
        </StaggerItem>
        <StaggerItem>
          <h2 className="max-w-[866px] font-heading text-[28px] font-bold capitalize leading-[1.5] text-[#171717] sm:text-[32px] lg:text-[36px]">
            {title}
          </h2>
        </StaggerItem>
        <StaggerItem>
          <p className="max-w-[500px] text-[14px] font-normal leading-[1.16] text-[#525252] sm:text-[16px]">
            {description}
          </p>
        </StaggerItem>
      </StaggerInView>

      <StaggerInView className="mt-10 grid gap-8 overflow-visible lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10">
        <StaggerItem className="overflow-visible">
          <article className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-2xl">
              <Image
                src={resolveNewsImageUrl(featured.image, 0)}
                alt={featured.title}
                width={1287}
                height={858}
                className="h-[min(72vw,445px)] w-full object-cover"
                unoptimized={resolveNewsImageUrl(featured.image, 0).startsWith("http")}
              />
            </div>
            <div className="space-y-5">
              <h3 className="font-heading text-[24px] font-bold leading-[1.2] text-[#171717] sm:text-[28px] lg:text-[32px]">
                {featured.title}
              </h3>
              <p className="max-w-[620px] text-[16px] leading-[1.35] text-[#525252] sm:text-[18px] lg:text-[20px]">
                {featured.excerpt}
              </p>
              <NewsReadMoreButton href={`/news/${featured.slug}`} label={t("readMore")} />
            </div>
          </article>
        </StaggerItem>

        <StaggerItem className="flex flex-col gap-6">
          {sideItems.map((item, idx) => {
            const dateLabel = formatNewsDate(
              item.published_at,
              locale,
              t(`items.${["second", "third", "fourth"][idx] ?? "second"}.date`)
            )

            return (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group block overflow-visible rounded-2xl transition-opacity hover:opacity-95"
              >
                <article className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
                  <Image
                    src={resolveNewsImageUrl(item.image, idx + 1)}
                    alt={item.title}
                    width={223}
                    height={223}
                    className="h-[180px] w-full shrink-0 rounded-[14px] object-cover sm:h-[223px] sm:w-[223px]"
                    unoptimized={resolveNewsImageUrl(item.image, idx + 1).startsWith("http")}
                  />
                  <div className="flex min-h-[180px] flex-1 flex-col justify-between gap-4 sm:min-h-[223px]">
                    <div className="space-y-2">
                      <h3 className="font-heading text-[20px] font-bold leading-[1.2] text-[#171717] transition-colors group-hover:text-[#006EA8] sm:text-[24px] lg:text-[28px]">
                        {item.title}
                      </h3>
                      <p className="line-clamp-3 text-[14px] leading-[1.35] text-[#525252] sm:text-[16px]">
                        {item.excerpt}
                      </p>
                    </div>
                    <p className="inline-flex items-center gap-2 text-[14px] leading-[1.16] text-[#525252] sm:text-[16px]">
                      <NewsCalendarIcon className="h-5 w-5 text-[#40A0CA]" />
                      {dateLabel}
                    </p>
                  </div>
                </article>
              </Link>
            )
          })}
        </StaggerItem>
      </StaggerInView>

      <StaggerInView className="mt-8 flex justify-center lg:justify-start">
        <StaggerItem>
          <Link
            href="/news"
            className={cn(
              "inline-flex items-center gap-2 text-[16px] font-medium text-[#006EA8] underline-offset-4 hover:underline"
            )}
          >
            {t("viewAll")}
          </Link>
        </StaggerItem>
      </StaggerInView>
    </SectionShell>
  )
}
