import { CategoriesSection } from "@/features/categories"
import { HeroSection } from "@/features/hero"
import { JobsSection } from "@/features/jobs"
import { NewsSection } from "@/features/news"
import { ProcessSection } from "@/features/process"
import { SupportSection } from "@/features/support"
import { TestimonialsSection } from "@/features/testimonials"
import { getHomePageContent } from "@/lib/api/services/home-page.service"
import { getSettings } from "@/lib/api/services/settings.service"
import { setRequestLocale } from "next-intl/server"

export const dynamic = "force-dynamic"

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const homeContent = await getHomePageContent(locale)
  
  // Try to get hero_stats from settings
  try {
    const settings = await getSettings(locale)
    const heroStatsSetting = settings.find((s) => s.key === "hero_stats")
    if (heroStatsSetting?.value) {
      const value = heroStatsSetting.value
      if (typeof value === "object" && value !== null) {
        const statsValue = value as Record<string, unknown>
        const total = statsValue.total || statsValue[locale] || "13k+"
        homeContent.sections.categories.heroStats = {
          total: String(total),
          unit: "",
        }
      } else if (typeof value === "string") {
        homeContent.sections.categories.heroStats = {
          total: value,
          unit: "",
        }
      }
    }
  } catch (error) {
    console.log("[Home] Could not load hero_stats from settings:", error)
    // Continue with default values
  }

  return (
    <main className="flex-1">
      <HeroSection
        title={homeContent.hero.title}
        description={homeContent.hero.description}
      />
      <CategoriesSection override={homeContent.sections.categories} />
      <ProcessSection
        steps={homeContent.processSteps}
        title={homeContent.process.title}
        description={homeContent.process.description}
      />
      <JobsSection override={homeContent.sections.jobs} />
      <TestimonialsSection override={homeContent.sections.testimonials} />
      <NewsSection override={homeContent.sections.news} />
      <SupportSection override={homeContent.sections.footer} />
    </main>
  )
}
