"use client"

import { useMemo } from "react"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"
import { motion } from "motion/react"
import { useLocale, useTranslations } from "next-intl"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"

export function TestimonialsSection() {
  const t = useTranslations("Landing.testimonials")
  const locale = useLocale()
  const items = [
    { key: "jacob", image: "/home/content/testimonial-left.png", quoteFrom: "jacob" },
    { key: "ronald", image: "/home/content/testimonial-center.png", quoteFrom: "ronald" },
    { key: "albert", image: "/home/content/testimonial-right-1.png", quoteFrom: "albert" },
    { key: "lina", image: "/home/content/testimonial-right-2.png", quoteFrom: "lina" },
    { key: "youssef", image: "/home/content/testimonial-left.png", quoteFrom: "youssef" },
    { key: "nora", image: "/home/content/testimonial-center.png", quoteFrom: "nora" },
  ] as const
  const autoplay = useMemo(() => Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true }), [])
  const isRtl = locale === "ar"

  return (
    <SectionShell stagger={false} className="overflow-hidden bg-[#f8fcff] py-[82px]">
      <StaggerInView className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[600px] space-y-4">
          <StaggerItem>
            <p className="inline-flex rounded-full bg-[#e7f3fb] px-3 py-2 text-[12px] leading-none font-medium text-[#40A0CA]">{t("eyebrow")}</p>
          </StaggerItem>
          <StaggerItem>
            <h2 className="text-balance text-[36px] leading-normal font-bold text-[#171717]">{t("title")}</h2>
          </StaggerItem>
          <StaggerItem>
            <p className="max-w-[560px] text-[16px] leading-[1.35] font-normal text-[#525252]">{t("description")}</p>
          </StaggerItem>
        </div>
        <StaggerItem className="hidden items-center gap-5 lg:flex">
          <span className="h-px w-16 bg-[#b7d8e8]" />
          <span className="h-px w-16 bg-[#1f4960]" />
        </StaggerItem>
      </StaggerInView>

      <StaggerInView className="relative left-1/2 mt-8 w-screen -translate-x-1/2 px-6 lg:px-[72px]">
        <Carousel
          opts={{ loop: true, align: "start", direction: isRtl ? "rtl" : "ltr" }}
          plugins={[autoplay]}
          className="w-full"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <CarouselContent className="ml-0">
            {items.map((item, index) => (
              <CarouselItem key={`${item.key}-${index}`} className="pl-0 pr-6 md:basis-1/2 xl:basis-1/4 xl:pr-8">
                <StaggerItem>
                <motion.article initial="rest" whileHover="hover" className="space-y-6">
                  <div className="relative">
                    <Image
                      src={item.image}
                      alt=""
                      width={445}
                      height={445}
                      className="h-[320px] w-full rounded-[28px] object-cover xl:h-[420px]"
                    />
                    <motion.div
                      variants={{
                        rest: { opacity: 0, y: 36, scale: 0.94, rotate: -7 },
                        hover: {
                          opacity: 1,
                          y: -8,
                          scale: 1,
                          rotate: -5,
                          transition: {
                            type: "spring",
                            stiffness: 280,
                            damping: 24,
                            mass: 0.7,
                            opacity: { duration: 0.2, ease: "easeOut" },
                          },
                        },
                      }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="pointer-events-none absolute bottom-2 left-4 right-4 h-[250px] rounded-[32px] border-0 bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#006EA8_0%,#005685_100%)] bg-size-[120px_120px,auto] bg-blend-[plus-lighter,normal] text-white shadow-[0px_42px_107px_rgba(123,190,255,0.34),0px_24.7206px_32.2574px_rgba(0,86,133,0.1867),0px_10.2677px_13.3981px_rgba(0,86,133,0.22),0px_3.71362px_4.84582px_rgba(0,86,133,0.1533),0px_0px_0px_4px_#E8F2FF,0px_0px_0px_5px_#FFFFFF,inset_0px_1px_18px_2px_#E8F2FF,inset_0px_1px_4px_2px_#C2DDFF] xl:h-[360px] xl:w-[390px] xl:max-w-none"
                    >
                      <Card className="h-full border-0 bg-transparent shadow-none">
                      <CardContent className="flex h-full flex-col items-start justify-between gap-10 p-[40px_24px]">
                        <p className="text-[20px] leading-[1.3]">{t(`items.${item.quoteFrom}.quote`)}</p>
                        <div className="space-y-3">
                          <p className="text-[22px] leading-[1.16]">{t(`items.${item.quoteFrom}.role`)}</p>
                          <p className="text-[52px] leading-[1.05] font-bold xl:text-[46px]">{t(`items.${item.quoteFrom}.name`)}</p>
                        </div>
                      </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                  <div>
                    <p className="text-[20px] text-[#525252]">{t(`items.${item.key}.role`)}</p>
                    <p className="text-[44px] leading-[1.05] font-bold text-[#171717]">{t(`items.${item.key}.name`)}</p>
                  </div>
                </motion.article>
                </StaggerItem>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </StaggerInView>
    </SectionShell>
  )
}
