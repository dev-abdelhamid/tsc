"use client"

import * as React from "react"
import Image from "next/image"
import { Bell, ChevronDown, Check, Menu, User as UserIcon, X, ExternalLink } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { safeTranslate } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { PrimaryButton } from "@/components/ui/primary-button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Link, stripLocalePrefix, usePathname } from "@/i18n/navigation"
import { useDashboardMobileMenu } from "@/features/shared-home/components/dashboard-mobile-menu-context"
import { cn } from "@/lib/utils"
import type { User } from "@/lib/api/types"
import { SharedSidebar } from "./shared-sidebar"

type NavItemKey = "home" | "about" | "services" | "jobs" | "news" | "contact"

type SiteHeaderProps = {
  activeItem?: NavItemKey
  initialIsLoggedIn?: boolean
  initialUser?: User | null
  isDashboard?: boolean
  onMobileMenuClick?: () => void
}

const NAV_ITEMS: Array<{ key: NavItemKey; href: string }> = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "jobs", href: "/jobs" },
  { key: "news", href: "/news" },
  { key: "contact", href: "/contact" },
]

const LOCALE_OPTIONS = [
  { locale: "de", label: "Deutsch", flag: "🇩🇪" },
  { locale: "en", label: "English", flag: "🇬" },
  { locale: "ar", label: "العربية", flag: "🇸🇦" },
] as const

interface Notification {
  id: number
  title: string
  description: string
  time: string
  read: boolean
}

export function SiteHeader({ 
  activeItem, 
  initialIsLoggedIn, 
  initialUser,
  isDashboard = false,
  onMobileMenuClick 
}: SiteHeaderProps) {
  const t = useTranslations("Landing.hero")
  const currentLocale = useLocale()
  const rawPathname = usePathname()
  const normalizedHref = stripLocalePrefix(rawPathname ?? "/")
  const pathname = normalizedHref || "/"
  const safeT = (key: string, fallback?: string) => safeTranslate(t, key, fallback)
  const mobileMenu = useDashboardMobileMenu()
  const [showNotifications, setShowNotifications] = React.useState(false)
  const [publicMobileMenuOpen, setPublicMobileMenuOpen] = React.useState(false)
  const notificationsRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const isRTL = currentLocale === "ar"
  
  const [authState, setAuthState] = React.useState<{ isLoggedIn: boolean; user: User | null; checked: boolean }>(() => ({
    isLoggedIn: initialIsLoggedIn || false,
    user: initialUser || null,
    checked: !!initialIsLoggedIn,
  }))

  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [notificationsLoading, setNotificationsLoading] = React.useState(false)
  const [unreadCount, setUnreadCount] = React.useState(0)

  const activeNav = React.useMemo(() => {
    if (activeItem) return activeItem
    return NAV_ITEMS.find((item) => item.href === "/" ? pathname === "/" : pathname.startsWith(item.href))?.key
  }, [activeItem, pathname])

  const currentLocaleOption = LOCALE_OPTIONS.find((opt) => opt.locale === currentLocale) ?? LOCALE_OPTIONS[0]
  const { isLoggedIn, user } = authState

  React.useEffect(() => {
    let mounted = true
    const checkAuth = async () => {
      if (initialIsLoggedIn !== undefined) {
        setAuthState({ isLoggedIn: initialIsLoggedIn, user: initialUser || null, checked: true })
        return
      }
      
      try {
        if (typeof window !== "undefined") {
          const tokens = JSON.parse(localStorage.getItem("auth_tokens") || "{}")
          if (tokens.access_token) {
            setAuthState({ isLoggedIn: true, user: JSON.parse(localStorage.getItem("auth_user") || "null"), checked: true })
            return
          }
        }
        
        const res = await fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          setAuthState({ isLoggedIn: !!data.isLoggedIn, user: data.user || null, checked: true })
          if (data.isLoggedIn && typeof window !== "undefined") {
            localStorage.setItem("auth_user", JSON.stringify(data.user))
          }
        } else {
          setAuthState({ isLoggedIn: false, user: null, checked: true })
        }
      } catch {
        setAuthState({ isLoggedIn: false, user: null, checked: true })
      }
    }

    if (!authState.checked) checkAuth()
    return () => { mounted = false }
  }, [initialIsLoggedIn, initialUser, authState.checked])

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (showNotifications && notificationsRef.current && !notificationsRef.current.contains(e.target as Node) && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showNotifications])

  React.useEffect(() => {
    if (!isLoggedIn) return
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/notifications/unread-count", { credentials: "include", cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          if (typeof data.unread_count === "number") setUnreadCount(data.unread_count)
        }
      } catch {}
    }
    fetchUnread()
  }, [isLoggedIn])

  React.useEffect(() => {
    if (!isLoggedIn || !showNotifications) return
    let mounted = true
    const fetchNotifications = async () => {
      setNotificationsLoading(true)
      try {
        const res = await fetch("/api/notifications?page=1", { credentials: "include", cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        const list = Array.isArray(data.data) ? data.data : []
        setNotifications(list.map((n: any) => ({
          id: n.id, title: n.title, description: n.body || n.message || "",
          time: n.created_at ? new Date(n.created_at).toLocaleString(currentLocale === "ar" ? "ar-EG" : currentLocale) : "",
          read: Boolean(n.read_at),
        })))
      } catch {} finally { if (mounted) setNotificationsLoading(false) }
    }
    fetchNotifications()
    return () => { mounted = false }
  }, [isLoggedIn, showNotifications, currentLocale])

  const markAsRead = async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    try { await fetch(`/api/notifications/${id}/read`, { method: "POST", credentials: "include" }) } catch {}
  }

  const closePublicMobileMenu = React.useCallback(() => setPublicMobileMenuOpen(false), [])

  if (!authState.checked) {
    return <header className="relative z-50 w-full bg-[#001222]"><div className="mx-auto flex h-[88px] max-w-[1512px] items-center justify-between px-4 sm:px-6 lg:h-[128px] lg:px-4"><div className="h-12 w-12 rounded bg-gray-700/50 animate-pulse lg:h-16 lg:w-16" /><div className="flex items-center gap-3"><div className="h-10 w-16 rounded bg-gray-700/50 animate-pulse" /><div className="h-10 w-10 rounded-full bg-gray-700/50 animate-pulse" /></div></div></header>
  }

  return (
    <header className={cn("sticky top-0 z-50 w-full bg-[#001222] shadow-lg transition-all", isDashboard && "bg-[#001222]")}>
      <div className="relative z-50 mx-auto flex h-[88px] w-full max-w-full items-center justify-between gap-3 px-4 sm:px-6 lg:h-[128px] lg:gap-6 lg:px-6" style={{ maxWidth: "1512px" }}>
        {/* اللوجو */}
        <Link locale={currentLocale} href="/" className="flex shrink-0 items-center">
          <Image src="/home/hero/hero-logo.svg" alt="Brand" width={220} height={88} className="h-[56px] w-auto sm:h-[72px] lg:h-[92px]" loading="eager" priority />
        </Link>

        {/* روابط سطح المكتب */}
        {!isDashboard && (
          <nav className="hidden lg:flex lg:items-center lg:gap-4 flex-1 justify-center">
            {NAV_ITEMS.map((item, i) => (
              <React.Fragment key={item.key}>
                {i > 0 && <div className="h-[18px] w-px bg-white/20" />}
                <Link locale={currentLocale} href={item.href} className={cn("whitespace-nowrap px-2 text-[16px] text-white transition hover:text-[#7CCEF3] hover:scale-105", activeNav === item.key && "font-semibold text-[#40A0CA]")}>
                  {safeT(`nav.${item.key}`, item.key)}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* ✅ الأزرار - الترتيب الصحيح للداشبورد */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">
          {/* ✅ 1. الإشعارات أولاً (في الداشبورد) */}
          {isLoggedIn && (
            <div className="relative" ref={notificationsRef}>
              <Button 
                ref={buttonRef} 
                variant="ghost" 
                size="icon" 
                className="relative h-10 w-10 rounded-[12px] bg-gradient-to-br from-[#006EA8] to-[#005685] hover:scale-105 transition" 
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-[9998]" onClick={() => setShowNotifications(false)} />
                  <div className={cn("fixed top-[64px] lg:top-[128px] z-[9999] max-h-[min(60vh,450px)] w-[min(96vw,360px)] overflow-hidden rounded-[16px] border border-gray-100 bg-white shadow-2xl pointer-events-auto", isRTL ? "left-[16px]" : "right-[16px]")}>
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-[#006EA8]/5 to-[#005685]/5">
                      <h3 className="font-bold text-gray-900 text-lg">{isRTL ? "الإشعارات" : "Notifications"}</h3>
                      <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 hover:bg-gray-100" onClick={() => setShowNotifications(false)}><X className="h-4 w-4 text-gray-500" /></Button>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                      {notificationsLoading && <div className="p-6 text-center text-sm text-gray-500">{isRTL ? "جاري التحميل..." : "Loading..."}</div>}
                      {!notificationsLoading && notifications.length === 0 && <div className="p-6 text-center text-sm text-gray-500">{isRTL ? "لا توجد إشعارات" : "No notifications"}</div>}
                      {notifications.map(n => (
                        <div key={n.id} className={cn("p-4 hover:bg-gray-50 cursor-pointer transition", !n.read && "bg-blue-50/60")} onClick={() => markAsRead(n.id)}>
                          <div className="flex gap-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", n.read ? "bg-gray-100" : "bg-gradient-to-br from-[#006EA8] to-[#005685]")}>
                              <Bell className={cn("w-5 h-5", n.read ? "text-gray-400" : "text-white")} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm font-semibold truncate", n.read ? "text-gray-600" : "text-gray-900")}>{n.title}</p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.description}</p>
                              <p className="text-[10px] text-gray-400 mt-2">{n.time}</p>
                            </div>
                            {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-2" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ✅ 2. زر اللغة */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 gap-1.5 rounded-[12px] border border-[#40A0CA]/50 bg-transparent px-2.5 text-white hover:bg-white/10 sm:h-[44px]">
                <span className="text-base">{currentLocaleOption.flag}</span>
                <ChevronDown className="hidden h-4 w-4 text-white/90 sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"} sideOffset={8} className={cn("w-48 rounded-[12px] border-[#cfe7f7] bg-white p-1", isRTL && "text-end")}>
              {LOCALE_OPTIONS.map(opt => (
                <DropdownMenuItem key={opt.locale} asChild className="rounded-[8px] px-2 py-2">
                  <Link locale={opt.locale} href={pathname} className="flex items-center justify-between gap-2">
                    <span>{opt.flag} {opt.label}</span>
                    {opt.locale === currentLocale && <Check className="h-4 w-4 text-[#006EA8]" />}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ✅ 3. تسجيل الدخول / البروفايل */}
          {isLoggedIn ? (
            <Link locale={currentLocale} href="/dashboard" className="hidden sm:block shrink-0">
              <div className="h-10 w-10 cursor-pointer rounded-[12px] bg-gradient-to-br from-[#006EA8] to-[#005685] p-0.5 hover:scale-105 transition">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[10px] bg-white">
                  {user?.avatar ? <Image src={user.avatar} alt={user.name || "User"} width={40} height={40} className="h-full w-full object-cover" /> : <UserIcon className="h-5 w-5 text-[#006EA8]" />}
                </div>
              </div>
            </Link>
          ) : (
            <Link locale={currentLocale} href="/sign-in" className="hidden sm:block shrink-0">
              <PrimaryButton className="h-10 px-4 text-[14px] font-medium rounded-[12px] min-w-[100px]">
                {safeT("login", "Sign in")}
              </PrimaryButton>
            </Link>
          )}

          {/* ✅ 4. زر القائمة (Menu) - يكون أخيراً في الداشبورد */}
          {isDashboard ? (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-[12px] border-white/20 bg-white/5 text-white hover:bg-white/10 lg:hidden" 
              onClick={() => onMobileMenuClick?.() || mobileMenu.open()}
            >
              <Menu className="h-5 w-5" />
            </Button>
          ) : (
            /* قائمة الموبايل للموقع العادي */
            <Sheet open={publicMobileMenuOpen} onOpenChange={setPublicMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-[12px] border-white/20 bg-white/5 text-white hover:bg-white/10 lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side={isRTL ? "right" : "left"} 
                className="w-[min(100vw,310px)] p-0 lg:hidden bg-[#F8FAFC]"
              >
                <SheetTitle className="sr-only">{isRTL ? "القائمة" : "Menu"}</SheetTitle>
                
                <div className={cn(
                  "relative flex items-center justify-between px-4 py-4 border-b border-[#E5E7EB]",
                  "bg-gradient-to-r from-[#006EA8] to-[#005685]",
                  isRTL ? "flex-row-reverse" : ""
                )}>
                  <SheetClose asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>

                  <Link locale={currentLocale} href="/" className="flex shrink-0 items-center bg-white rounded-[12px] p-2 shadow-lg">
                    <Image 
                      src="/home/hero/hero-logo.svg" 
                      alt="Brand" 
                      width={144} 
                      height={46} 
                      className="h-9 w-auto" 
                    />
                  </Link>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-2 shadow-sm">
                    <SharedSidebar 
                      items={[
                        { icon: "/dashboard/dashboard.svg", label: t("nav.home"), href: "/" },
                        { icon: "/dashboard/profile.svg", label: t("nav.about"), href: "/about" },
                        { icon: "/dashboard/education_Info.svg", label: t("nav.services"), href: "/services" },
                        { icon: "/dashboard/jobs.svg", label: t("nav.jobs"), href: "/jobs" },
                        { icon: "/dashboard/tickets.svg", label: t("nav.news"), href: "/news" },
                        { icon: "/dashboard/favourites.svg", label: t("nav.contact"), href: "/contact" },
                      ]} 
                      isRTL={isRTL} 
                      onNavigate={closePublicMobileMenu} 
                    />
                  </div>

                  {isLoggedIn ? (
                    <Link 
                      locale={currentLocale} 
                      href="/dashboard" 
                      onClick={closePublicMobileMenu} 
                      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[12px] border border-[#006EA8]/30 bg-gradient-to-r from-[#EBF5FB] to-[#F0F9FF] px-4 text-[#006EA8] font-semibold text-[14px] transition-all hover:border-[#006EA8]/60 hover:shadow-md active:scale-[0.98]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {isRTL ? "لوحة التحكم" : "Dashboard"}
                    </Link>
                  ) : (
                    <Link 
                      locale={currentLocale} 
                      href="/sign-in" 
                      onClick={closePublicMobileMenu} 
                      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[12px] bg-gradient-to-br from-[#006EA8] to-[#005685] px-4 text-white font-semibold text-[14px] shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
                    >
                      {safeT("login", "Sign in")}
                    </Link>
                  )}
                </div>

                <div className="px-4 pb-4">
                  <div className="h-1 w-full rounded-full bg-gradient-to-r from-[#80CDF6] via-[#006EA8] to-[#005685] opacity-60" />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  )
}