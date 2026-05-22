import { JobsSection } from "@/features/jobs"
import { getHomeSurfaceClassName } from "@/features/shared-home"
import { TestimonialsSection } from "@/features/testimonials"

export default function JobsRoutePage() {
  return (
    <main className={`flex-1 ${getHomeSurfaceClassName()}`}>
      <JobsSection />
      <TestimonialsSection />
    </main>
  )
}
