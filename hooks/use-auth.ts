// hooks/use-auth.ts
"use client"
import { useState, useCallback } from "react"
import { useRouter } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import { login } from "@/lib/api/services/auth.service"

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
      } catch (err: any) {
        setError(err.message || "فشل تسجيل الدخول")
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
      company_type_id?: number
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
        if (!res.ok) throw new Error(data.message || "فشل التسجيل")

        router.push("/dashboard")
        router.refresh()
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [locale, router]
  )

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
      router.refresh()
    } catch {
      // ignore
    }
  }, [router])

  return { signIn, signUp, signOut, loading, error }
}
