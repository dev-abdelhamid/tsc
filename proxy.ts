import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { routing } from "./i18n/routing"

// إنشاء middleware الترجمة من next-intl
const intlMiddleware = createMiddleware(routing)

// المسارات التي لا تتطلب مصادقة
const PUBLIC_PATHS = [
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
 * التحقق من أن المسار عام (بدون الحاجة للمصادقة)
 */
function isPublicPath(pathname: string): boolean {
  // إزالة locale من البداية
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?:\/|$)/, "/")
  return PUBLIC_PATHS.some((publicPath) => pathWithoutLocale.startsWith(publicPath))
}

/**
 * التحقق من أن المستخدم موثق (له session/token)
 */
async function isAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    // التحقق من وجود cookie الجلسة
    const sessionCookie = request.cookies.get("talent_seeker_session")
    if (sessionCookie) {
      return true
    }

    // التحقق من وجود Authorization header
    const authHeader = request.headers.get("Authorization")
    if (authHeader?.startsWith("Bearer ")) {
      return true
    }

    return false
  } catch {
    return false
  }
}

/**
 * الـ middleware الرئيسي - يدمج الترجمة والمصادقة
 */
export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // السماح برسائل API بدون تحقق من المصادقة
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/public")) {
    return NextResponse.next()
  }

  // تطبيق middleware الترجمة أولاً
  const response = intlMiddleware(request)

  // إذا كان الرد يحتوي على redirect (مثل توجيه اللغة)
  if (response?.status === 307 || response?.status === 308) {
    return response
  }

  // التحقق من المسارات العامة
  if (isPublicPath(pathname)) {
    // إضافة headers أمان أساسية حتى للمسارات العامة
    const responseWithHeaders = NextResponse.next()
    responseWithHeaders.headers.set("X-Content-Type-Options", "nosniff")
    responseWithHeaders.headers.set("X-Frame-Options", "DENY")
    responseWithHeaders.headers.set("X-XSS-Protection", "1; mode=block")
    responseWithHeaders.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    return responseWithHeaders
  }

  // التحقق من المسارات التي تتطلب مصادقة
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated(request)) {
      // إعادة توجيه للدخول إذا كان المسار يتطلب مصادقة
      const locale = pathname.split("/")[1] || "ar"
      return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url))
    }
  }

  // إضافة headers أمان إضافية
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-authenticated", "true")
  requestHeaders.set("x-timestamp", new Date().toISOString())

  // إنشاء رد جديد مع Headers الأمان
  const responseWithHeaders = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // إضافة headers الأمان للرد
  responseWithHeaders.headers.set("X-Content-Type-Options", "nosniff")
  responseWithHeaders.headers.set("X-Frame-Options", "DENY")
  responseWithHeaders.headers.set("X-XSS-Protection", "1; mode=block")
  responseWithHeaders.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  responseWithHeaders.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

  return responseWithHeaders
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
