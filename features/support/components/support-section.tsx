import { Link } from "@/i18n/navigation"
import { getTranslations } from "next-intl/server"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"
import Image from "next/image"
import styles from "./support-section.module.css"
import { cn } from "@/lib/utils"

function SupportChatIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-6 w-6 shrink-0", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        opacity="0.4"
        d="M8 10.5H16M8 14H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3 11.5C3 7.36 6.36 4 10.5 4H13.5C17.64 4 21 7.36 21 11.5V14.5C21 18.64 17.64 22 13.5 22H12L8 20V22H6.5C4.01 22 2 19.99 2 17.5V11.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export async function SupportSection() {
  const t = await getTranslations("Landing.support")

  return (
    <SectionShell stagger={false} className="overflow-visible py-12 sm:py-14 lg:py-[72px]">
      <div className={styles.ctaWrapper}>
        <div className={styles.ctaCard}>
          <div className={styles.textureOverlay} aria-hidden />
          <StaggerInView className="relative mx-auto flex max-w-[596px] flex-col items-center gap-10 text-center">
            <div className="space-y-6">
              <StaggerItem>
                <div className={styles.ctaTag}>
                  <Image src="/footer/icon-link.svg" alt="" width={16} height={16} />
                  {t("eyebrow")}
                </div>
              </StaggerItem>
              <StaggerItem>
                <h2 className={styles.ctaTitle}>{t("title")}</h2>
              </StaggerItem>
              <StaggerItem>
                <p className={styles.ctaDesc}>{t("description")}</p>
              </StaggerItem>
            </div>

            <StaggerItem>
              <div className={styles.ctaButtons}>
                <Link href="/contact#faq" className={styles.btnFaq}>
                  <span className={styles.btnIconWrap}>
                    <Image src="/faqs.svg" alt="faqs" width={18} height={18} className={styles.btnIcon} />
                  </span>
                  <span>{t("actions.faqs")}</span>
                </Link>

                <Link href="/contact" className={styles.btnContact}>
                  <span className={styles.btnIconWrap}>
                    <Image src="/contact.svg" alt="contact" width={18} height={18} className={styles.btnIcon} />
                  </span>
                  <span>{t("actions.contact")}</span>
                </Link>
              </div>
            </StaggerItem>
          </StaggerInView>
        </div>
      </div>
    </SectionShell>
  )
}
