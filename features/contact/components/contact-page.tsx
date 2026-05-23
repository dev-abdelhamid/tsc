import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { PrimaryButton } from "@/components/ui/primary-button"
import { Textarea } from "@/components/ui/textarea"
import { ContactInfoCard } from "./contact-info-card"
import { getContactFaqs } from "@/features/contact/services/contact-faqs.service"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"
import { Mail, MapPin, Phone, Send, SendHorizonal } from "lucide-react"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import type { ReactNode } from "react"

export async function ContactPage() {
  const t = await getTranslations("Landing.contact")
  const footerT = await getTranslations("Landing.footer")
  const faqs = getContactFaqs()

  return (
    <main className="flex-1 bg-white">

      <SectionShell stagger={false} className="relative bg-white py-[72px]">
        <div className="absolute inset-0 opacity-[0.05]">
          <Image src="/contact/noise-bg.png" alt="" fill className="object-cover" />
        </div>
        <StaggerInView className="relative space-y-8">
          <StaggerItem>
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-[8px] bg-[rgba(64,160,202,0.25)] px-4 py-2 text-[12px] leading-[1.16] text-[#40A0CA]">
              <SendHorizonal className="h-4 w-4" />
              {t("eyebrow")}
            </p>
            <div className="max-w-[643px] space-y-6">
              <h1 className="font-heading text-[48px] leading-[1.16] font-bold text-[#171717]">{t("title")}</h1>
              <p className="text-[16px] leading-normal text-[#525252]">{t("description")}</p>
            </div>
          </div>
          </StaggerItem>

          <StaggerItem>
          <div className="grid overflow-hidden rounded-[16px] border border-[#d4d4d4] bg-white lg:grid-cols-2">
            <div className="relative min-h-[520px]">
              <Image src="/contact/contact-map.png" alt={t("mapAlt")} fill className="object-cover" />
            </div>

            <div className="space-y-16 p-8 md:p-16">
              <h2 className="bg-[linear-gradient(270deg,#032C44_0%,#41A0CA_100%)] bg-clip-text font-heading text-[36px] leading-[1.16] font-bold text-transparent">
                {t("form.title")}
              </h2>
              <form className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <label className="text-base font-medium text-[#262626]">{t("form.nameLabel")}</label>
                    <Input
                      placeholder={t("form.namePlaceholder")}
                      className="h-auto rounded-none border-0 border-b-[0.5px] border-[#d4d4d4] px-0 py-2 text-[14px] placeholder:text-[#d4d4d4] focus-visible:ring-0"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-base font-medium text-[#262626]">{t("form.emailLabel")}</label>
                    <Input
                      placeholder={t("form.emailPlaceholder")}
                      className="h-auto rounded-none border-0 border-b-[0.5px] border-[#d4d4d4] px-0 py-2 text-[14px] placeholder:text-[#d4d4d4] focus-visible:ring-0"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-base font-medium text-[#262626]">{t("form.phoneLabel")}</label>
                    <Input
                      placeholder={t("form.phonePlaceholder")}
                      className="h-auto rounded-none border-0 border-b-[0.5px] border-[#d4d4d4] px-0 py-2 text-[14px] placeholder:text-[#d4d4d4] focus-visible:ring-0"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-base font-medium text-[#262626]">{t("form.subjectLabel")}</label>
                    <Input
                      placeholder={t("form.subjectPlaceholder")}
                      className="h-auto rounded-none border-0 border-b-[0.5px] border-[#d4d4d4] px-0 py-2 text-[14px] placeholder:text-[#d4d4d4] focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-base font-medium text-[#262626]">{t("form.messageLabel")}</label>
                  <Textarea
                    placeholder={t("form.messagePlaceholder")}
                    className="min-h-[88px] resize-none rounded-none border-0 border-b-[0.5px] border-[#d4d4d4] px-0 py-2 text-[14px] placeholder:text-[#d4d4d4] focus-visible:ring-0"
                  />
                </div>

                <PrimaryButton>
                  <Send className="h-4 w-4" />
                  {t("form.send")}
                </PrimaryButton>
              </form>
            </div>
          </div>
          </StaggerItem>
        </StaggerInView>
      </SectionShell>

      <section className="relative py-[46px]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#001222_0%,#032C44_100%)]" />
        <div className="absolute inset-0 opacity-[0.05]">
          <Image src="/contact/noise-bg.png" alt="" fill className="object-cover" />
        </div>
        <SectionShell stagger={false} className="relative bg-transparent py-0">
          <StaggerInView className="grid gap-4 md:grid-cols-3">
            <StaggerItem>
              <ContactInfoCard icon={<Phone className="h-12 w-12 text-[#40A0CA]" />} label={t("info.phoneLabel")} value={footerT("contact.phone")} />
            </StaggerItem>
            <StaggerItem>
              <ContactInfoCard icon={<Mail className="h-12 w-12 text-[#40A0CA]" />} label={t("info.emailLabel")} value={footerT("contact.email")} />
            </StaggerItem>
            <StaggerItem>
              <ContactInfoCard icon={<MapPin className="h-12 w-12 text-[#40A0CA]" />} label={t("info.addressLabel")} value={footerT("contact.address")} />
            </StaggerItem>
          </StaggerInView>
        </SectionShell>
      </section>

      <SectionShell id="faq" stagger={false} className="relative scroll-mt-24 bg-white py-[112px]">
        <div className="absolute inset-0 opacity-[0.05]">
          <Image src="/contact/noise-bg.png" alt="" fill className="object-cover" />
        </div>
        <StaggerInView className="relative mx-auto max-w-[866px] space-y-16">
          <StaggerItem>
          <div className="space-y-6 text-center">
            <p className="inline-flex items-center gap-2 rounded-[8px] bg-[rgba(64,160,202,0.25)] px-4 py-2 text-[12px] leading-[1.16] text-[#40A0CA]">
              <SendHorizonal className="h-4 w-4" />
              {t("faq.eyebrow")}
            </p>
            <h2 className="font-heading text-[48px] leading-[1.16] font-bold text-[#171717]">{t("faq.title")}</h2>
            <p className="text-[16px] leading-normal text-[#525252]">{t("faq.description")}</p>
          </div>
          </StaggerItem>

          <StaggerItem>
          <Accordion type="single" defaultValue={faqs[1]?.id} collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border-b border-[#d4d4d4]">
                <AccordionTrigger className="py-4 text-left no-underline hover:no-underline">
                  <div className="flex items-center gap-1 text-[18px] leading-normal font-semibold text-[#262626]">
                    <span className="bg-[linear-gradient(270deg,#032C44_0%,#41A0CA_100%)] bg-clip-text text-[20px] font-extrabold text-transparent">
                      Q.
                    </span>
                    {t(`faq.items.${faq.questionKey}`)}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-base leading-normal text-[#262626]">
                  {t(`faq.items.${faq.answerKey}`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          </StaggerItem>
        </StaggerInView>
      </SectionShell>
    </main>
  )
}

