"use client"

// features/shared-home/components/site-chrome.tsx

import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { SiteFooter } from "@/features/shared-home/components/site-footer"
import { SiteHeader } from "@/features/shared-home/components/site-header"

type SiteChromeProps = {
  children: React.ReactNode
  session?: {
    isLoggedIn: boolean
    user?: {
      id: number
      name: string
      email: string
      role: "user" | "company" | "admin"
      avatar?: string
    } | null
  }
}

// صفحات تخفي Header + Footer
const AUTH_ROUTES = new Set([
  "sign-in", "sign-up", "forgot-password", "verify-email", "reset-password"
])

export function SiteChrome({ children, session }: SiteChromeProps) {
  const pathname = usePathname() ?? "/"

  const { hideHeader, hideFooter, isDashboard } = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean)
    const lastSegment = segments.at(-1) ?? ""

    // Auth pages: إخفاء كل شيء
    if (AUTH_ROUTES.has(lastSegment)) {
      return { hideHeader: true, hideFooter: true, isDashboard: false }
    }

    // Dashboard: هيدر + فوتر كامل حسب التصميم
    if (segments.includes("dashboard")) {
      return { hideHeader: false, hideFooter: false, isDashboard: true }
    }

    return { hideHeader: false, hideFooter: false, isDashboard: false }
  }, [pathname])

  return (
    <>
      {!hideHeader && (
        <SiteHeader
          initialIsLoggedIn={session?.isLoggedIn}
          initialUser={session?.user}
          isDashboard={isDashboard}
        />
      )}
      <main className="flex-1">{children}</main>
      {!hideFooter && <SiteFooter />}
    </>
  )
}