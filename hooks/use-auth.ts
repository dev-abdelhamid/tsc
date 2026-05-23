"use client"

import { useState, useCallback } from "react"
import { useRouter } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import { login } from "@/lib/api/services/auth.service"

function clearLocalAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_tokens")
    localStorage.removeItem("auth_user")
  }
}

function formatApiError(data: {
  message?: string
  errors?: Record<string, string[]>
}): string {
  const parts: string[] = []
  if (data.message) parts.push(data.message)
  if (data.errors) {
    for (const [key, msgs] of Object.entries(data.errors)) {
      const label = key.replace(/\[|\]/g, "").replace(/_/g, " ")
      parts.push(`${label}: ${msgs.join(", ")}`)
    }
  }
  return parts.join(" — ") || "حدث خطأ"
}

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const locale = useLocale()

  const signIn = useCallback(
    async (email: string, password: string, type: "user" | "company" = "user") => {
      setLoading(true)
      setError(null)
      try {
        const { user, tokens } = await login(email, password, type, locale)

        const storeRes = await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": locale,
          },
          body: JSON.stringify({ user, tokens }),
        })

        const storeData = await storeRes.json()
        if (!storeRes.ok) {
          throw new Error(storeData.message || "فشل حفظ الجلسة المحلية")
        }

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "auth_tokens",
            JSON.stringify({
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              token_type: tokens.token_type,
              expires_in: tokens.expires_in,
            })
          )
          localStorage.setItem("auth_user", JSON.stringify(user))
        }

        router.push("/dashboard")
        router.refresh()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "فشل تسجيل الدخول"
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [locale, router]
  )

  const signUp = useCallback(
    async (formData: {
      name: string
      email: string
      phone: string
      password: string
      password_confirmation: string
      type: "user" | "company"
      company_name?: string
      country_id?: number
      accept_terms_and_privacy?: boolean
    }) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": locale,
          },
          body: JSON.stringify(formData),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(formatApiError(data))

        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
        router.refresh()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "فشل التسجيل"
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [locale, router]
  )

  const forgotPassword = useCallback(
    async (email: string) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept-Language": locale },
          body: JSON.stringify({ email }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "فشل الإرسال")
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "فشل الإرسال"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [locale]
  )

  const verifyResetCode = useCallback(
    async (email: string, code: string) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/auth/verify-reset-code", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept-Language": locale },
          body: JSON.stringify({ email, code }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "رمز غير صحيح")
        return data.token as string
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "رمز غير صحيح"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [locale]
  )

  const resetPassword = useCallback(
    async (token: string, password: string, password_confirmation: string) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept-Language": locale },
          body: JSON.stringify({ token, password, password_confirmation }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "فشل إعادة التعيين")
        router.push("/sign-in")
        router.refresh()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "فشل إعادة التعيين"
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [locale, router]
  )

  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept-Language": locale },
          body: JSON.stringify({ email, code }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "فشل التحقق")
        router.push("/sign-in")
        router.refresh()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "فشل التحقق"
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [locale, router]
  )

  const resendVerification = useCallback(
    async (email: string) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/auth/resend-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept-Language": locale },
          body: JSON.stringify({ email }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "فشل إعادة الإرسال")
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "فشل إعادة الإرسال"
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [locale]
  )

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    } catch (err) {
      console.warn(err)
      // ignore
    } finally {
      clearLocalAuth()
      setLoading(false)
      router.push("/sign-in")
      router.refresh()
    }
  }, [router])

  return {
    signIn,
    signUp,
    signOut,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    verifyEmail,
    resendVerification,
    loading,
    error,
  }
}
