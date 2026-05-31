import Image from "next/image"
import styles from "./site-footer.module.css"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getLocale } from "next-intl/server"
import { getSettings } from "@/lib/api/services/settings.service"

export async function SiteFooter() {
  const locale = await getLocale()
  const t = await getTranslations("Landing.footer")
  const contactT = await getTranslations("Landing.contact")
  const isRTL = locale === "ar"

  // Fetch contact settings from API
  let contactPhone = ""
  let contactEmail = ""
  let contactAddress = ""
  let facebookUrl = "#"
  let linkedinUrl = "#"
  let instagramUrl = "#"
  let footerDescription = ""

  try {
    const settings = await getSettings(locale)
    contactPhone = String(settings.find((s) => s.key === "contact_phone")?.value || "")
    contactEmail = String(settings.find((s) => s.key === "contact_email")?.value || "")
    contactAddress = String(settings.find((s) => s.key === "contact_address")?.value || "")
    facebookUrl = String(settings.find((s) => s.key === "facebook_url")?.value || "#")
    linkedinUrl = String(settings.find((s) => s.key === "linkedin_url")?.value || "#")
    instagramUrl = String(settings.find((s) => s.key === "instagram_url")?.value || "#")

    const footerDescSetting = settings.find((s) => s.key === "footer_description")?.value
    if (footerDescSetting) {
      if (typeof footerDescSetting === "object" && footerDescSetting !== null) {
        const obj = footerDescSetting as Record<string, string>
        footerDescription = obj[locale] || obj.en || obj.ar || ""
      } else if (typeof footerDescSetting === "string") {
        try {
          const parsed = JSON.parse(footerDescSetting)
          footerDescription = parsed[locale] || parsed.en || parsed.ar || footerDescSetting
        } catch {
          footerDescription = footerDescSetting
        }
      }
    }
  } catch {
    // Use translation fallbacks
  }

  const displayPhone = contactPhone || t("contact.phone")
  const displayEmail = contactEmail || t("contact.email")
  const displayAddress = contactAddress || t("contact.address")
  const displayDescription = footerDescription || contactT("footerDescription")

  if (!facebookUrl || facebookUrl === "") facebookUrl = "#"
  if (!linkedinUrl || linkedinUrl === "") linkedinUrl = "#"
  if (!instagramUrl || instagramUrl === "") instagramUrl = "#"

  return (
    <footer dir={isRTL ? "rtl" : "ltr"} className="relative w-full overflow-hidden bg-[#001222] text-white">
      <div className="pointer-events-none absolute -left-40 bottom-0 z-0 h-[468px] w-[468px] rounded-full bg-[#005685] blur-[200px]" aria-hidden />
      <div className="pointer-events-none absolute -right-20 top-20 z-0 h-[468px] w-[468px] rounded-full bg-[#005685] blur-[200px]" aria-hidden />

      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 ${styles.bgLinear}`} />
        <div className={`absolute inset-0 ${styles.bgRadial}`} />
        <div className={`absolute inset-0 opacity-[0.06] ${styles.noiseBg}`} />
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
            <Link locale={locale} href="/">
              <Image
                src="/footer/footer-logo.svg"
                alt={t("brand")}
                width={93}
                height={124}
                className="h-[124px] w-[93px] object-contain"
              />
            </Link>
            <p className="text-[16px] leading-normal font-normal text-[#F5F5F5]">
              {displayDescription}
            </p>
            <div className="flex items-center gap-6">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center transition-transform hover:scale-110"
                aria-label="Instagram"
              >
                <Image src="/footer/social-instagram.svg" alt="" width={40} height={40} className="size-10 object-contain" />
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center transition-transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <Image src="/footer/social-telegram.svg" alt="" width={40} height={40} className="size-10 object-contain" />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center transition-transform hover:scale-110"
                aria-label="Facebook"
              >
                <Image src="/footer/social-youtube.svg" alt="" width={40} height={40} className="size-10 object-contain" />
              </a>
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
                  locale={locale}
                  href={`/${item}`}
                  className="group flex items-center gap-3 text-[16px] leading-[1.16] text-[#F5F5F5] transition-colors hover:text-[#40A0CA]"
                >
                  <Image
                    src="/footer/icon-link.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                  />
                  {t(`quickLinks.items.${item}`)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Contact Us */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[20px] font-bold leading-[1.16] text-[#40A0CA]">
              {t("contact.title")}
            </h3>
            <div className="flex flex-col gap-5">
              {displayPhone && (
                <div className="flex items-center gap-3 text-[16px] leading-[1.16] text-[#F5F5F5]">
                  <Image src="/footer/icon-phone.svg" alt="" width={24} height={24} />
                  <a href={`tel:${displayPhone}`} dir="ltr" className="hover:text-[#40A0CA] transition-colors">
                    {displayPhone}
                  </a>
                </div>
              )}
              {displayEmail && (
                <div className="flex items-center gap-3 text-[16px] leading-[1.16] text-[#F5F5F5]">
                  <Image src="/footer/icon-mail.svg" alt="" width={24} height={24} />
                  <a href={`mailto:${displayEmail}`} className="hover:text-[#40A0CA] transition-colors">
                    {displayEmail}
                  </a>
                </div>
              )}
              {displayAddress && (
                <div className="flex items-start gap-3 text-[16px] leading-[1.16] text-[#F5F5F5]">
                  <Image src="/footer/icon-location.svg" alt="" width={24} height={24} className="mt-0.5 shrink-0" />
                  <span className="max-w-[250px]">{displayAddress}</span>
                </div>
              )}
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
            <Link locale={locale} href="/terms" className="transition-colors hover:text-[#40A0CA]">
              {contactT("legal.terms")}
            </Link>
            <div className="h-4 w-px bg-[#40A0CA]" />
            <Link locale={locale} href="/faqs" className="transition-colors hover:text-[#40A0CA]">
              {contactT("legal.faqs")}
            </Link>
            <div className="h-4 w-px bg-[#40A0CA]" />
            <Link locale={locale} href="/privacy" className="transition-colors hover:text-[#40A0CA]">
              {contactT("legal.privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
