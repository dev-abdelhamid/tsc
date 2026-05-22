"use client"

import * as React from "react"
import Image from "next/image"
import { Bell, ChevronDown, Check, User } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { PrimaryButton } from "@/components/ui/primary-button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

type NavItemKey = "home" | "about" | "services" | "jobs" | "news" | "contact"

type SiteHeaderProps = {
  activeItem?: NavItemKey
  initialIsLoggedIn?: boolean
  initialUser?: any
  isDashboard?: boolean
}

const NAV_ITEMS: Array<{ key: NavItemKey; href: string }> = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "services", href: "/#categories" },
  { key: "jobs", href: "/jobs" },
  { key: "news", href: "/news" },
  { key: "contact", href: "/contact" },
]

const LOCALE_OPTIONS = [
  { locale: "de", label: "Deutsch", flag: "🇩🇪" },
  { locale: "en", label: "English", flag: "🇬🇧" },
  { locale: "ar", label: "العربية", flag: "🇸" },
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
  isDashboard = false 
}: SiteHeaderProps) {
  const t = useTranslations("Landing.hero")
  const currentLocale = useLocale()
  const pathname = usePathname() ?? "/"
  const [showNotifications, setShowNotifications] = React.useState(false)
  const notificationsRef = React.useRef<HTMLDivElement>(null)
  const isRTL = currentLocale === "ar"
  
  const [authState, setAuthState] = React.useState<{
    isLoggedIn: boolean
    user: any
    checked: boolean
  }>(() => ({
    isLoggedIn: initialIsLoggedIn || false,
    user: initialUser || null,
    checked: !!initialIsLoggedIn,
  }))

  const [notifications] = React.useState<Notification[]>([
    {
      id: 1,
      title: isRTL ? "أنت في الـ Top 40" : "You're in the Top 40",
      description: isRTL 
        ? "أخبار رائعة! أنت حالياً مصنف ضمن أفضل 40 شريك" 
        : "Great news! You are currently ranked among the top 40 partners",
      time: "May 5, 1:30 PM",
      read: false,
    },
  ])

  const activeNav = React.useMemo(() => {
    if (activeItem) return activeItem
    const item = NAV_ITEMS.find((item) => {
      if (item.href === "/") return pathname === "/"
      return pathname.startsWith(item.href)
    })
    return item?.key
  }, [activeItem, pathname])

  const currentLocaleOption = LOCALE_OPTIONS.find((opt) => opt.locale === currentLocale) ?? LOCALE_OPTIONS[0]
  const unreadCount = notifications.filter((n) => !n.read).length
  const { isLoggedIn, user } = authState

  const checkAuth = React.useCallback(async () => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("auth_user")
        const storedTokens = localStorage.getItem("auth_tokens")
        
        if (storedUser && storedTokens) {
          const parsedUser = JSON.parse(storedUser)
          const parsedTokens = JSON.parse(storedTokens)
          
          if (parsedTokens.access_token) {
            setAuthState({
              isLoggedIn: true,
              user: parsedUser,
              checked: true,
            })
            return
          }
        }
      } catch (e) {
        console.warn("Failed to read localStorage auth:", e)
      }
    }
    
    try {
      const res = await fetch(`/${currentLocale}/api/session`, {
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" }
      })
      
      if (res.ok) {
        const data = await res.json()
        setAuthState({
          isLoggedIn: data.isLoggedIn || false,
          user: data.user || null,
          checked: true,
        })
        
        if (data.isLoggedIn && data.user && typeof window !== "undefined") {
          localStorage.setItem("auth_user", JSON.stringify(data.user))
        }
      } else {
        setAuthState({ isLoggedIn: false, user: null, checked: true })
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setAuthState({ isLoggedIn: false, user: null, checked: true })
    }
  }, [currentLocale])

  React.useEffect(() => {
    if (initialIsLoggedIn !== undefined) {
      setAuthState({
        isLoggedIn: initialIsLoggedIn,
        user: initialUser || null,
        checked: true,
      })
      return
    }
    
    if (!authState.checked) {
      checkAuth()
    }
  }, [initialIsLoggedIn, initialUser, authState.checked, checkAuth])

  React.useEffect(() => {
    if (!initialIsLoggedIn) {
      checkAuth()
    }
  }, [currentLocale, pathname, initialIsLoggedIn, checkAuth])

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  if (!authState.checked) {
    return (
      <header className="relative w-full overflow-hidden bg-[#001222]">
        <div className="mx-auto flex h-[128px] max-w-[1512px] items-center justify-between px-6 lg:px-[100px]">
          <div className="h-16 w-16 bg-gray-700/50 rounded animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-11 w-20 bg-gray-700/50 rounded animate-pulse" />
            <div className="h-11 w-11 bg-gray-700/50 rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className={cn(
      "relative w-full overflow-hidden shadow-2xl transition-all",
      isDashboard ? "bg-[#001222]" : "bg-[#001222]"
    )}>
      <div className="pointer-events-none absolute top-0 -start-[10%] h-full w-[40%] bg-[#80CDF6] opacity-10 blur-[120px]" />
      <div className="pointer-events-none absolute top-0 -end-[10%] h-full w-[40%] bg-[#80CDF6] opacity-10 blur-[120px]" />

      <div className="mx-auto flex h-[128px] max-w-[1512px] items-center justify-between px-6 lg:px-[100px]">
        <Link href="/" aria-label="Talent Seeker" className="relative z-50 shrink-0">
          <Image 
            src="/home/hero/hero-logo.svg" 
            alt="Talent Seeker" 
            width={64} 
            height={64} 
            className="h-14 w-14 lg:h-16 lg:w-16" 
            loading="eager"
            priority
          />
        </Link>

        {!isDashboard && (
          <nav className="relative z-50 hidden items-center gap-4 lg:flex">
            {NAV_ITEMS.map((item, index) => (
              <React.Fragment key={item.key}>
                {index > 0 && <div className="h-[18px] w-px bg-white/20" aria-hidden="true" />}
                <Link
                  href={item.href}
                  className={cn(
                    "px-2 text-[16px] leading-[1.16] font-normal text-white transition-all duration-200 hover:text-[#7CCEF3] hover:scale-105",
                    activeNav === item.key && "text-[#40A0CA] font-semibold"
                  )}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="relative z-50 flex items-center gap-3 lg:gap-4 overflow-visible">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-[44px] gap-2 rounded-[12px] border border-[#40A0CA]/50 bg-transparent px-3 text-white hover:bg-white/10 transition-all"
              >
                <ChevronDown className="h-4 w-4 text-white/90" />
                <span className="text-lg">{currentLocaleOption.flag}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[190px] rounded-[12px] border border-[#cfe7f7] bg-white p-1 z-[100]">
              {LOCALE_OPTIONS.map((option) => (
                <DropdownMenuItem key={option.locale} asChild className="rounded-[8px] px-2 py-2 text-[#032C44]">
                  <Link locale={option.locale} href={pathname} className="flex w-full items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{option.flag}</span>
                      {option.label}
                    </span>
                    {option.locale === currentLocale && <Check className="h-4 w-4 text-[#006EA8]" />}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isLoggedIn && (
            <div className="relative" ref={notificationsRef}>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-[44px] w-[44px] rounded-[12px] bg-gradient-to-br from-[#006EA8] to-[#005685] hover:from-[#005685] hover:to-[#003F64] shadow-[0px_42px_107px_rgba(123,190,255,0.34)] transition-all hover:scale-105"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 top-[52px] w-[380px] bg-white rounded-[16px] shadow-2xl border border-gray-100 z-[9999] max-h-[500px] overflow-hidden pointer-events-auto">
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#006EA8]/5 to-[#005685]/5">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {isRTL ? "الإشعارات" : "Notifications"}
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 hover:bg-gray-50 cursor-pointer transition-all",
                          !notification.read && "bg-blue-50/60"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            notification.read ? "bg-gray-100" : "bg-gradient-to-br from-[#006EA8] to-[#005685]"
                          )}>
                            <Bell className={cn("w-5 h-5", notification.read ? "text-gray-400" : "text-white")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-semibold truncate", notification.read ? "text-gray-600" : "text-gray-900")}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.description}</p>
                            <p className="text-[10px] text-gray-400 mt-2">{notification.time}</p>
                          </div>
                          {!notification.read && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-2" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ✅ User Profile - بدون زر الخروج (يظهر فقط في السايدبار) */}
          {isLoggedIn ? (
            <Link href="/dashboard" className="hidden sm:block">
              <div className="h-[44px] w-[44px] rounded-full bg-gradient-to-br from-[#006EA8] to-[#005685] p-0.5 shadow-[0px_42px_107px_rgba(123,190,255,0.34)] cursor-pointer hover:shadow-[0px_50px_120px_rgba(123,190,255,0.4)] transition-all hover:scale-105">
                <div className="h-full w-full rounded-full bg-white p-0.5 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || "User"}
                      width={40}
                      height={40}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-[#006EA8]" />
                  )}
                </div>
              </div>
            </Link>
          ) : (
            <Link href="/sign-in">
              <PrimaryButton className="w-[120px] lg:w-[150px] hover:shadow-lg transition-all hover:scale-105">
                {t("login")}
              </PrimaryButton>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}