import Image from "next/image"
import styles from "./site-footer.module.css"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getLocale } from "next-intl/server"
import { getSettings } from "@/lib/api/services/settings.service"

/* ──────────────────────── Inline SVG social icons ──────────────────────── */
/* These match the exact SVGs used in the profile page (/Linked_accounts/)
   but rendered inline so we can control fill color for the dark footer.    */

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.4" d="M10.0473 1.45801H9.95201C8.12646 1.458 6.69253 1.45799 5.57302 1.6085C4.42582 1.76274 3.5156 2.08527 2.80043 2.80043C2.08527 3.5156 1.76274 4.42582 1.6085 5.57302C1.45799 6.69254 1.458 8.12644 1.45801 9.95201V10.0473C1.458 11.8729 1.45799 13.3068 1.6085 14.4263C1.76274 15.5735 2.08527 16.4838 2.80043 17.1989C3.5156 17.9141 4.42582 18.2366 5.57302 18.3908C6.69254 18.5413 8.12642 18.5413 9.95201 18.5413H10.0473C11.8729 18.5413 13.3068 18.5413 14.4263 18.3908C15.5735 18.2366 16.4838 17.9141 17.1989 17.1989C17.9141 16.4838 18.2366 15.5735 18.3908 14.4263C18.5413 13.3068 18.5413 11.8729 18.5413 10.0473V9.95201C18.5413 8.12646 18.5413 6.69254 18.3908 5.57302C18.2366 4.42582 17.9141 3.5156 17.1989 2.80043C16.4838 2.08527 15.5735 1.76274 14.4263 1.6085C13.3068 1.45799 11.8729 1.458 10.0473 1.45801Z" fill="currentColor"/>
      <path d="M14.166 5.62501L13.2674 5.625C12.5378 5.62495 11.8889 5.62489 11.3651 5.69532C10.7958 5.77187 10.2208 5.94839 9.75093 6.41826C9.28102 6.88814 9.10452 7.46306 9.02802 8.03243C8.9576 8.55625 8.9576 9.20509 8.95768 9.93475V10.625H8.33268C7.75738 10.625 7.29102 11.0914 7.29102 11.6667C7.29102 12.242 7.75738 12.7083 8.33268 12.7083H8.95768V18.5407C9.27535 18.5417 9.60652 18.5417 9.95168 18.5417H10.047C10.3922 18.5417 10.7233 18.5417 11.041 18.5407V12.7083H12.4993C13.0747 12.7083 13.541 12.242 13.541 11.6667C13.541 11.0914 13.0747 10.625 12.4993 10.625H11.041V10C11.041 9.18492 11.0433 8.67834 11.0928 8.31002C11.1374 7.9776 11.2034 7.91194 11.2231 7.8924L11.2241 7.8914L11.2251 7.89039C11.2446 7.87077 11.3103 7.80477 11.6427 7.76008C12.011 7.71055 12.5176 7.70834 13.3327 7.70834H14.166C14.7413 7.70834 15.2077 7.24197 15.2077 6.66668C15.2077 6.09138 14.7413 5.62501 14.166 5.62501Z" fill="currentColor"/>
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.4" d="M10.0473 1.45801H9.95201C8.12646 1.458 6.69253 1.45799 5.57302 1.6085C4.42582 1.76274 3.5156 2.08527 2.80043 2.80043C2.08527 3.5156 1.76274 4.42582 1.6085 5.57302C1.45799 6.69254 1.458 8.12644 1.45801 9.95201V10.0473C1.458 11.8729 1.45799 13.3068 1.6085 14.4263C1.76274 15.5735 2.08527 16.4838 2.80043 17.1989C3.5156 17.9141 4.42582 18.2366 5.57302 18.3908C6.69254 18.5413 8.12642 18.5413 9.95201 18.5413H10.0473C11.8729 18.5413 13.3068 18.5413 14.4263 18.3908C15.5735 18.2366 16.4838 17.9141 17.1989 17.1989C17.9141 16.4838 18.2366 15.5735 18.3908 14.4263C18.5413 13.3068 18.5413 11.8729 18.5413 10.0473V9.95201C18.5413 8.12646 18.5413 6.69254 18.3908 5.57302C18.2366 4.42582 17.9141 3.5156 17.1989 2.80043C16.4838 2.08527 15.5735 1.76274 14.4263 1.6085C13.3068 1.45799 11.8729 1.458 10.0473 1.45801Z" fill="currentColor"/>
      <path d="M5.83333 7.91602C6.29357 7.91602 6.66667 8.28911 6.66667 8.74935V14.166C6.66667 14.6263 6.29357 14.9993 5.83333 14.9993C5.37309 14.9993 5 14.6263 5 14.166V8.74935C5 8.28911 5.37309 7.91602 5.83333 7.91602Z" fill="currentColor"/>
      <path d="M9.92588 7.98992C9.79505 7.701 9.50413 7.5 9.1663 7.5C8.70613 7.5 8.33301 7.87309 8.33301 8.33333V14.1667C8.33301 14.6269 8.70613 15 9.1663 15C9.62655 15 9.99963 14.6269 9.99963 14.1667V10.8333C9.99963 9.91283 10.7459 9.16667 11.6663 9.16667C12.5868 9.16667 13.333 9.91283 13.333 10.8333V14.1667C13.333 14.6269 13.7061 15 14.1663 15C14.6266 15 14.9996 14.6269 14.9996 14.1667V10.8333C14.9996 8.99242 13.5073 7.5 11.6663 7.5C11.0285 7.5 10.4325 7.67917 9.92588 7.98992Z" fill="currentColor"/>
      <path d="M5.83919 6.87435C6.41449 6.87435 6.88086 6.40798 6.88086 5.83268C6.88086 5.25738 6.41449 4.79102 5.83919 4.79102H5.83171C5.25641 4.79102 4.79004 5.25738 4.79004 5.83268C4.79004 6.40798 5.25641 6.87435 5.83171 6.87435H5.83919Z" fill="currentColor"/>
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.4" d="M10.0473 1.45801C11.8729 1.458 13.3068 1.45799 14.4263 1.6085C15.5735 1.76274 16.4838 2.08527 17.1989 2.80043C17.9141 3.5156 18.2366 4.42582 18.3908 5.57302C18.5413 6.69254 18.5413 8.12643 18.5413 9.95204V10.0473C18.5413 11.8729 18.5413 13.3068 18.3908 14.4263C18.2366 15.5735 17.9141 16.4838 17.1989 17.1989C16.4838 17.914 15.5735 18.2366 14.4263 18.3909C13.3068 18.5414 11.8729 18.5414 10.0473 18.5414H9.95201C8.12642 18.5414 6.69254 18.5414 5.57302 18.3909C4.42582 18.2366 3.5156 17.914 2.80043 17.1989C2.08527 16.4838 1.76274 15.5735 1.6085 14.4263C1.45799 13.3068 1.458 11.8729 1.45801 10.0473V9.95204C1.458 8.12644 1.45799 6.69254 1.6085 5.57302C1.76274 4.42582 2.08527 3.5156 2.80043 2.80043C3.5156 2.08527 4.42582 1.76274 5.57302 1.6085C6.69254 1.45799 8.12644 1.458 9.95201 1.45801H10.0473Z" fill="currentColor"/>
      <path d="M5.27653 5.54847C5.38338 5.3395 5.59831 5.20801 5.83301 5.20801H8.14783C8.34851 5.20801 8.53701 5.30438 8.65451 5.46707L10.7487 8.36679L13.7244 5.39107C13.9685 5.14699 14.3642 5.14699 14.6083 5.39107C14.8523 5.63514 14.8523 6.03087 14.6083 6.27495L11.49 9.39321L14.673 13.8004C14.8104 13.9907 14.8297 14.2419 14.7228 14.4509C14.616 14.6599 14.401 14.7914 14.1663 14.7914H11.8515C11.6508 14.7914 11.4623 14.695 11.3448 14.5323L9.25068 11.6326L6.27495 14.6083C6.03088 14.8524 5.63515 14.8524 5.39107 14.6083C5.14699 14.3642 5.14699 13.9685 5.39107 13.7244L8.50934 10.6061L5.32633 6.19894C5.18892 6.00867 5.16968 5.75745 5.27653 5.54847Z" fill="currentColor"/>
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.3 8.4c-.8 0-1.4.6-1.4 1.4 0 .8.6 1.4 1.4 1.4.8 0 1.4-.6 1.4-1.4 0-.8-.6-1.4-1.4-1.4z" fill="currentColor"/>
      <path d="M16 10.2c-3.3 0-5.9 2.7-5.9 5.9s2.7 5.9 5.9 5.9 5.9-2.7 5.9-5.9-2.6-5.9-5.9-5.9zm0 9.7c-2.1 0-3.8-1.7-3.8-3.8 0-2.1 1.7-3.8 3.8-3.8 2.1 0 3.8 1.7 3.8 3.8 0 2.1-1.7 3.8-3.8 3.8z" fill="currentColor"/>
      <path d="M20.8 4h-9.5C7.2 4 4 7.2 4 11.2v9.5c0 4 3.2 7.2 7.2 7.2h9.5c4 0 7.2-3.2 7.2-7.2v-9.5C28 7.2 24.8 4 20.8 4zm4.9 16.8c0 2.7-2.2 5-5 5h-9.5c-2.7 0-5-2.2-5-5v-9.5c0-2.7 2.2-5 5-5h9.5c2.7 0 5 2.2 5 5v9.5z" fill="currentColor"/>
    </svg>
  )
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022zM10 15.5l6-3.5-6-3.5v7z" fill="currentColor"/>
    </svg>
  )
}

/* ──────────────────────── Social link config ──────────────────────── */
type SocialConfig = {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const SOCIAL_PLATFORMS: SocialConfig[] = [
  { key: "facebook_url", label: "Facebook", icon: FacebookIcon },
  { key: "linkedin_url", label: "LinkedIn", icon: LinkedInIcon },
  { key: "twitter_url", label: "X", icon: XIcon },
  { key: "instagram_url", label: "Instagram", icon: InstagramIcon },
  { key: "youtube_url", label: "YouTube", icon: YouTubeIcon },
]

export async function SiteFooter() {
  const locale = await getLocale()
  const t = await getTranslations("Landing.footer")
  const contactT = await getTranslations("Landing.contact")
  const isRTL = locale === "ar"

  // Fetch contact settings from API
  let contactPhone = ""
  let contactEmail = ""
  let contactAddress = ""
  let footerDescription = ""

  // Social URLs from settings
  const socialUrls: Record<string, string> = {}

  try {
    const settings = await getSettings(locale)
    contactPhone = String(settings.find((s) => s.key === "contact_phone")?.value || "")
    contactEmail = String(settings.find((s) => s.key === "contact_email")?.value || "")
    contactAddress = String(settings.find((s) => s.key === "contact_address")?.value || "")

    // Read all social URLs
    for (const platform of SOCIAL_PLATFORMS) {
      const val = settings.find((s) => s.key === platform.key)?.value
      socialUrls[platform.key] = val ? String(val) : ""
    }

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

  // Build active social links (only ones with real URLs)
  const activeSocials = SOCIAL_PLATFORMS.filter((p) => {
    const url = socialUrls[p.key]
    return url && url !== "#" && url.trim() !== ""
  })

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
            {/* Social Media Icons */}
            {activeSocials.length > 0 && (
              <div className="flex items-center gap-4">
                {activeSocials.map((platform) => {
                  const IconComponent = platform.icon
                  return (
                    <a
                      key={platform.key}
                      href={socialUrls[platform.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-all duration-200 hover:scale-110 hover:border-[#40A0CA]/40 hover:bg-[#40A0CA]/15 hover:text-white"
                      aria-label={platform.label}
                    >
                      <IconComponent className="size-5" />
                    </a>
                  )
                })}
              </div>
            )}
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
