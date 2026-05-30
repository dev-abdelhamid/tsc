import type { Metadata } from "next"
import { Cairo, Encode_Sans, Geist_Mono } from "next/font/google"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { DirectionProvider } from "@/components/ui/direction"
import { routing } from "@/i18n/routing"
import { SiteChrome } from "@/features/shared-home"
import { getSession } from "@/lib/session"
import "../globals.css"

const cairo = Cairo({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  display: "swap",
})

const encodeSans = Encode_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

type MetadataProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "HomePage" })

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()
  
  // ✅ جلب الجلسة
  const session = await getSession().catch(() => null)
  
  // ✅ تحويل الجلسة لـ Plain Object (بدون دوال أو خصائص معقدة)
  const sessionData = session ? {
    isLoggedIn: !!session.isLoggedIn,
    user: session.isLoggedIn && session.user ? {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      avatar: session.user.avatar,
    } : null,
  } : undefined

  const direction = locale === "ar" ? "rtl" : "ltr"
  const fontVariable = locale === "ar" ? cairo.variable : encodeSans.variable

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${fontVariable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-white">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <DirectionProvider dir={direction} direction={direction}>
            {/* ✅ تمرير Plain Object فقط */}
            <SiteChrome session={sessionData}>
              {children}
            </SiteChrome>
          </DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}