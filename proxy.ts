import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { routing } from "./i18n/routing"

// إنشاء middleware الترجمة من next-intl
const intlMiddleware = createMiddleware(routing)

// المسارات التي لا تتطلب مصادقة (بدون locale)
const PUBLIC_PATHS = [
  "/",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/verify-email",
  "/terms",
  "/privacy",
  "/faqs",
  "/contact",
  "/about",
  "/services",
  "/jobs",
  "/news",
]

/**
 * إزالة locale من بداية المسار
 */
function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(?:ar|en|de)(?:\/|$)/, "/")
}

/**
 * التحقق من أن المسار عام
 */
function isPublicPath(pathname: string): boolean {
  const bare = stripLocale(pathname)
  if (bare === "/") return true
  return PUBLIC_PATHS.some((p) => p !== "/" && bare.startsWith(p))
}

/**
 * التحقق من أن المستخدم موثق (له session/token)
 */
function isAuthenticated(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get("talent_seeker_session")
  if (sessionCookie) return true

  const authHeader = request.headers.get("Authorization")
  if (authHeader?.startsWith("Bearer ")) return true

  return false
}

/**
 * الـ proxy الرئيسي - يدمج الترجمة والمصادقة
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // تمرير طلبات API بدون تدخل
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // 1) دائمًا نمرر الطلب عبر next-intl أولاً (هو من سيعيد توجيه / → /ar)
  const intlResponse = intlMiddleware(request)

  // إذا أعاد next-intl إعادة توجيه (مثل / → /ar)، نرسل الـ redirect فورًا
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse
  }

  // 2) تحديد اللغة من URL
  const localeMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/)
  const urlLocale = localeMatch?.[1] || routing.defaultLocale

  // 3) التحقق من حماية الداشبورد
  const bare = stripLocale(pathname)
  if (bare.startsWith("/dashboard")) {
    if (!isAuthenticated(request)) {
      return NextResponse.redirect(new URL(`/${urlLocale}/sign-in`, request.url))
    }
  }

  // 4) نضيف headers اللغة والأمان على الاستجابة من intlMiddleware
  intlResponse.headers.set("X-Content-Type-Options", "nosniff")
  intlResponse.headers.set("X-Frame-Options", "DENY")
  intlResponse.headers.set("X-XSS-Protection", "1; mode=block")
  intlResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  if (!isPublicPath(pathname)) {
    intlResponse.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
  }

  return intlResponse
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}