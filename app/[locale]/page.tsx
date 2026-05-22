import { CategoriesSection } from "@/features/categories"
import { HeroSection } from "@/features/hero"
import { JobsSection } from "@/features/jobs"
import { NewsSection } from "@/features/news"
import { ProcessSection } from "@/features/process"
import { getHomeSurfaceClassName } from "@/features/shared-home"
import { SupportSection } from "@/features/support"
import { TestimonialsSection } from "@/features/testimonials"

export default async function Home() {
  return (
    <main className={`flex-1 ${getHomeSurfaceClassName()}`}>
      <HeroSection />
      <CategoriesSection />
      <ProcessSection />
      <JobsSection />
      <TestimonialsSection />
      <NewsSection />
      <SupportSection />
    </main>
  )
}
