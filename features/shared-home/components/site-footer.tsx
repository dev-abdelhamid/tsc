"use client"

import Image from "next/image"
import styles from "./site-footer.module.css"
import { useTranslations, useLocale } from "next-intl"
import { Link } from "@/i18n/navigation"

export function SiteFooter() {
  const t = useTranslations("Landing.footer")
  const contactT = useTranslations("Landing.contact")
  const locale = useLocale()
  const isRTL = locale === "ar"

  return (
    <footer dir={isRTL ? "rtl" : "ltr"} className="relative w-full overflow-hidden bg-[#001222] text-white">
      <div className="pointer-events-none absolute -left-40 bottom-0 z-0 h-[468px] w-[468px] rounded-full bg-[#005685] blur-[200px]" aria-hidden />
      <div className="pointer-events-none absolute -right-20 top-20 z-0 h-[468px] w-[468px] rounded-full bg-[#005685] blur-[200px]" aria-hidden />

      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 ${styles.bgLinear}`} />
        <div className={`absolute inset-0 ${styles.bgRadial}`} />
        <div className={`absolute inset-0 opacity-[0.06] ${styles.noiseBg}`} />
        {/* Full-bleed decorative background image */}
        <div className="absolute inset-0 z-0" aria-hidden>
          <div className="absolute inset-0 relative">
            <Image
              src="/home/hero/hero-bg-image.png"
              alt=""
              fill
              className="object-cover opacity-40 mix-blend-overlay pointer-events-none"
            />
          </div>
    
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-14 lg:px-[100px] lg:pt-14 lg:pb-8">
     
        {/* Top Section */}
        <div className="flex flex-col justify-between gap-10 border-b border-[#003F64] pb-10 lg:flex-row lg:gap-20">
          {/* Column 1: Brand & Desc */}
          <div className="flex flex-col gap-6 lg:max-w-[474px]">
            <Link href="/">
              <Image 
                src="/footer/footer-logo.svg" 
                alt={t("brand")} 
                width={93} 
                height={124} 
                className="h-[124px] w-[93px] object-contain"
              />
            </Link>
            <p className="text-[16px] leading-normal font-normal text-[#F5F5F5]">
              {contactT("footerDescription")}
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="flex size-10 items-center justify-center transition-transform hover:scale-110" aria-label="Instagram">
                <Image src="/footer/social-instagram.svg" alt="" width={40} height={40} className="size-10 object-contain" />
              </Link>
              <Link href="#" className="flex size-10 items-center justify-center transition-transform hover:scale-110" aria-label="Telegram">
                <Image src="/footer/social-telegram.svg" alt="" width={40} height={40} className="size-10 object-contain" />
              </Link>
              <Link href="#" className="flex size-10 items-center justify-center transition-transform hover:scale-110" aria-label="YouTube">
                <Image src="/footer/social-youtube.svg" alt="" width={40} height={40} className="size-10 object-contain" />
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[20px] font-bold leading-[1.16] text-[#40A0CA]">
              {t("quickLinks.title")}
            </h3>
            <nav className="flex flex-col gap-5">
              {["about", "jobs", "services", "contact"].map((item) => (
                <Link 
                  key={item} 
                  href={`/${item}`} 
                  className="group flex items-center gap-3 text-[16px] leading-[1.16] text-[#F5F5F5] transition-colors hover:text-[#40A0CA]"
                >
                  <Image src="/footer/icon-link.svg" alt="" width={16} height={16} className="transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  {t(`quickLinks.items.${item}`)}
                </Link>
              ))}

              {/* Admin links removed (per design request) */}
            </nav>
          </div>

          {/* Column 3: Contact Us */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[20px] font-bold leading-[1.16] text-[#40A0CA]">
              {t("contact.title")}
            </h3>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 text-[16px] leading-[1.16] text-[#F5F5F5]">
                <Image src="/footer/icon-phone.svg" alt="" width={24} height={24} />
                <span dir="ltr">{t("contact.phone")}</span>
              </div>
              <div className="flex items-center gap-3 text-[16px] leading-[1.16] text-[#F5F5F5]">
                <Image src="/footer/icon-mail.svg" alt="" width={24} height={24} />
                <span>{t("contact.email")}</span>
              </div>
              <div className="flex items-center gap-3 text-[16px] leading-[1.16] text-[#F5F5F5]">
                <Image src="/footer/icon-location.svg" alt="" width={24} height={24} />
                <span className="max-w-[250px]">{t("contact.address")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-6 pt-8 lg:flex-row">
          <div className="flex items-center gap-2 text-[14px] font-medium leading-normal text-white">
            <Image src="/footer/copyright-icon.svg" alt="" width={20} height={20} />
            <span>2026</span>
            <span className="text-[#40A0CA]">Jobs-Tsc</span>
            <span>. All rights Reserved</span>
          </div>

          <div className="flex items-center gap-6 text-[16px] leading-[1.16] text-[#F5F5F5]">
            <Link href="/terms" className="transition-colors hover:text-[#40A0CA]">
              {contactT("legal.terms")}
            </Link>
            <div className="h-4 w-px bg-[#40A0CA]" />
            <Link href="/faqs" className="transition-colors hover:text-[#40A0CA]">
              {contactT("legal.faqs")}
            </Link>
            <div className="h-4 w-px bg-[#40A0CA]" />
            <Link href="/privacy" className="transition-colors hover:text-[#40A0CA]">
              {contactT("legal.privacy")}
            </Link>
          </div>
        </div>
        
      </div>
    </footer>
  )
}
