import { getTranslations } from "next-intl/server"
import { ProcessSection } from "@/features/process"
import { SupportSection } from "@/features/support"
import { AboutIntroSection } from "./about-intro-section"
import { AboutStorySection } from "./about-story-section"



export async function AboutPage() {
  const aboutT = await getTranslations("Landing.about")

  return (
    <main className="flex-1 bg-[#f8fbff]">

      <AboutIntroSection
        eyebrow={aboutT("intro.eyebrow")}
        title={aboutT("intro.title")}
        descriptionOne={aboutT("intro.descriptionOne")}
        descriptionTwo={aboutT("intro.descriptionTwo")}
      />

      <ProcessSection />

      <AboutStorySection
        eyebrow={aboutT("story.eyebrow")}
        title={aboutT("story.title")}
        missionTabLabel={aboutT("story.tabs.mission")}
        visionTabLabel={aboutT("story.tabs.vision")}
        developmentTabLabel={aboutT("story.tabs.development")}
        descriptionOne={aboutT("story.descriptionOne")}
        descriptionTwo={aboutT("story.descriptionTwo")}
      />

      <SupportSection />
    </main>
  )
}
