import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getTranslations } from "next-intl/server"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"
import { getCategoryKeys } from "@/features/categories/services/categories.service"
import { Globe, ShoppingBasket, ArrowUpRight } from "lucide-react"

export async function CategoriesSection() {
  const t = await getTranslations("Landing.categories")
  const categories = getCategoryKeys()

  return (
    <SectionShell id="categories" stagger={false} className="bg-white py-[82px]">
      <StaggerInView className="space-y-4">
        <StaggerItem>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F4FA] px-3 py-1.5 text-[12px] font-medium text-[#40A0CA]">
            <Globe className="h-4 w-4" />
            {t("eyebrow")}
          </div>
        </StaggerItem>
        <StaggerItem>
          <h2 className="max-w-[866px] text-balance text-[36px] leading-normal font-bold text-[#171717]">
            {t("title")}
          </h2>
        </StaggerItem>
        <StaggerItem>
          <p className="max-w-[500px] text-[16px] leading-[1.16] font-normal text-[#525252]">{t("description")}</p>
        </StaggerItem>
      </StaggerInView>

      <StaggerInView className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {categories.map((key) => (
          <StaggerItem key={key}>
            <Card className="group relative min-h-[220px] cursor-pointer rounded-[8px] border border-[#d4d4d4] bg-white transition-all hover:border-[#4BB7E7] hover:bg-[linear-gradient(180deg,#2D7494_0%,#398DB3_100%)] hover:shadow-[0_0_0_5px_rgba(255,255,255,1),0_0_0_4px_rgba(194,227,250,1),0_4px_5px_rgba(75,183,231,0.15),0_10px_13px_rgba(75,183,231,0.22),0_24px_32px_rgba(75,183,231,0.19)]">
              <CardContent className="flex h-full flex-col items-start p-6">
                <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full border border-[#40A0CA] bg-white transition-colors group-hover:border-white group-hover:bg-white">
                  <ShoppingBasket className="h-5 w-5 text-[#40A0CA] transition-colors group-hover:text-[#2D7494]" />
                </div>

                <div className="mt-auto space-y-2">
                  <p className="text-[20px] leading-[1.16] font-bold text-[#262626] transition-colors group-hover:text-white">
                    {t(`items.${key}.label`)}
                  </p>
                  <p className="text-[12px] font-medium text-[#525252] transition-colors group-hover:text-white/90">
                    {t(`items.${key}.vacancy`)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}

        <StaggerItem>
          <Card className="min-h-[220px] rounded-[8px] border border-[#4BB7E7] bg-[linear-gradient(180deg,#2D7494_0%,#398DB3_100%)] text-white shadow-[0_0_0_5px_rgba(255,255,255,1),0_0_0_4px_rgba(194,227,250,1),0_4px_5px_rgba(75,183,231,0.15),0_10px_13px_rgba(75,183,231,0.22),0_24px_32px_rgba(75,183,231,0.19)]">
            <CardContent className="flex h-full flex-col justify-between gap-6 p-6">
              <div className="space-y-4">
                <p className="text-[64px] leading-[1.16] font-medium">13k+</p>
                <p className="text-[16px] leading-[1.16] font-normal">{t("metricLabel")}</p>
              </div>
              <Button
                variant="outline"
                className="h-[44px] w-full justify-between rounded-[8px] border-white/40 bg-transparent px-4 text-white hover:bg-white/10 hover:text-white"
              >
                {t("showMore")}
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerInView>
    </SectionShell>
  )
}
