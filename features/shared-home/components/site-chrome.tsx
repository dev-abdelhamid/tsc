"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { stripLocalePrefix } from "@/i18n/navigation"
import { DashboardMobileMenuProvider } from "@/features/shared-home/components/dashboard-mobile-menu-context"
import { SiteHeader } from "@/features/shared-home/components/site-header"

type SiteChromeProps = {
  children: React.ReactNode
  footer?: React.ReactNode
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

// Type the global window marker to avoid `any` casts and lint errors.
declare global {
  interface Window {
    __CANONICAL_USER?: {
      id?: number
      name?: string
      email?: string
      role?: string | Record<string, unknown>
      avatar?: string
    }
  }
}

const AUTH_ROUTES = new Set(["sign-in", "sign-up", "forgot-password", "verify-email"])

export function SiteChrome({ children, footer, session }: SiteChromeProps) {
  const pathname = usePathname() ?? "/"

  const isAuthPage = React.useMemo(() => {
    const segments = pathname.split("/").filter(Boolean)
    const lastSegment = segments.at(-1)
    return lastSegment ? AUTH_ROUTES.has(lastSegment) : false
  }, [pathname])

  // Use the server-provided `session` prop as the authoritative initial
  // client state. Provide a stable plain object to avoid undefined props
  // reaching `SiteHeader` which would cause transient skeleton renders.
  const [initialSessionState, setInitialSessionState] = React.useState<typeof session>(() => session ?? { isLoggedIn: false, user: null })

  // Keep the initial session state in sync when the server re-renders
  // (for example after `SessionPersist` calls `router.refresh()`). We
  // intentionally use state so the value is stable during the first
  // hydration but accepts updates from subsequent server renders.
  React.useEffect(() => {
    setInitialSessionState(session ?? { isLoggedIn: false, user: null })
  }, [session])

  // Compute `isDashboard` dynamically on every render based on the current pathname.
  // This ensures that navigating between dashboard and public pages updates the
  // layout, headers, and footers correctly. Since usePathname is consistent between
  // SSR and hydration, this will not cause hydration mismatches.
  const isDashboard = React.useMemo(() => {
    const normalizedPath = stripLocalePrefix(pathname)
    const segments = (normalizedPath ?? "/").split("/").filter(Boolean)
    return segments.includes("dashboard")
  }, [pathname])

  return (
    <DashboardMobileMenuProvider>
      {!isAuthPage && (
        <SiteHeader
          initialIsLoggedIn={initialSessionState?.isLoggedIn}
          initialUser={initialSessionState?.user}
          isDashboard={isDashboard}
        />
      )}

      {isDashboard ? children : <main className="flex-1">{children}</main>}

      {!isAuthPage && !isDashboard && footer}
    </DashboardMobileMenuProvider>
  )
}

