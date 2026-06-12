'use client'

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"

export interface AuthUser {
  id: number
  name: string
  email: string
  phone?: string
  avatar?: string
  role?: string
  roles?: string[]
}

// ── Module-level cache shared across all hook instances ──────────────────────
let cachedUser: AuthUser | null = null
let isFetchingUser = false
let hasFetchedUser = false
const listeners = new Set<(u: AuthUser | null) => void>()
const refetchListeners = new Set<() => void>()

function emit(user: AuthUser | null) {
  cachedUser = user
  listeners.forEach((l) => l(user))
}

/** Force all mounted useAuth instances to re-fetch on next render */
export function invalidateSessionCache() {
  cachedUser = null
  hasFetchedUser = false
  refetchListeners.forEach((r) => r())
}

/** Update the cached user data without a refetch (e.g. after profile update) */
export function updateSessionUser(partial: Partial<AuthUser>) {
  const base = cachedUser || ({} as AuthUser)
  const updated = { ...base, ...partial }
  hasFetchedUser = true
  emit(updated)
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(cachedUser)
  const [isLoading, setIsLoading] = useState(!hasFetchedUser)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const isAuthPage = pathname ? (
    pathname.includes("/sign-in") || 
    pathname.includes("/sign-up") || 
    pathname.includes("/forgot-password") || 
    pathname.includes("/reset-password") || 
    pathname.includes("/verify")
  ) : false

  const fetchProfile = useCallback(async (force = false) => {
    if (hasFetchedUser && !force) {
      setUser(cachedUser)
      setIsLoading(false)
      return
    }

    if (isFetchingUser) return

    isFetchingUser = true
    setIsLoading(true)
    try {
      const res = await fetch(`/api/auth/profile?t=${Date.now()}`, { cache: "no-store" })
      hasFetchedUser = true
      if (res.ok) {
        const data = await res.json()
        const userObj = data?.data || data
        emit(userObj)
        setError(null)
      } else if (res.status === 401) {
        emit(null)
      } else {
        const errData = await res.json().catch(() => ({}))
        setError(errData.message || "Failed to load profile")
      }
    } catch {
      setError("Network error fetching profile")
    } finally {
      isFetchingUser = false
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    const onChange = (u: AuthUser | null) => setUser(u)
    const onRefetch = () => {
      fetchProfile(true)
    }
    listeners.add(onChange)
    refetchListeners.add(onRefetch)
    
    if (!isAuthPage) {
      fetchProfile()
    } else {
      setIsLoading(false)
    }

    return () => {
      listeners.delete(onChange)
      refetchListeners.delete(onRefetch)
    }
  }, [fetchProfile, isAuthPage])

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch { /* ignore */ } finally {
      hasFetchedUser = true
      emit(null)
      setIsLoading(false)
      router.push("/sign-in")
      router.refresh()
    }
  }, [router])

  // ── Sign In ─────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string, type = "user") => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Login failed")
      const role = data.role || type
      hasFetchedUser = false
      emit(data.user)
      fetchProfile(true).catch(() => {})
      router.replace(`/dashboard/${role}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router, fetchProfile])

  // ── Sign Up ─────────────────────────────────────────────────────────────────
  const signUp = useCallback(async (payload: {
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
    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, String(v))
      })
      const res = await fetch("/api/auth/register", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Registration failed")

      // If email verification required
      if (data.pendingVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(payload.email)}`)
        return
      }

      hasFetchedUser = false
      if (data.user) emit(data.user)
      fetchProfile(true).catch(() => {})
      router.replace(`/dashboard/${payload.type}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router, fetchProfile])

  // ── Forgot Password ─────────────────────────────────────────────────────────
  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("email", email)
      const res = await fetch("/api/auth/forgot-password", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to send reset email")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Verify Reset Code ───────────────────────────────────────────────────────
  const verifyResetCode = useCallback(async (email: string, code: string): Promise<string> => {
    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("code", code)
      const res = await fetch("/api/auth/verify-reset-code", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Invalid code")
      return data?.data?.token || data?.token || ""
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Reset Password ──────────────────────────────────────────────────────────
  const resetPassword = useCallback(async (token: string, password: string, password_confirmation: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("token", token)
      formData.append("password", password)
      formData.append("password_confirmation", password_confirmation)
      const res = await fetch("/api/auth/reset-password", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to reset password")
      router.push("/sign-in")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // ── Verify Email ────────────────────────────────────────────────────────────
  const verifyEmail = useCallback(async (email: string, code: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("code", code)
      const res = await fetch("/api/auth/verify", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Verification failed")
      router.push("/sign-in?verified=1")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // ── Resend Verification ─────────────────────────────────────────────────────
  const resendVerification = useCallback(async (email: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("email", email)
      const res = await fetch("/api/auth/resend-verification", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to resend verification")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend verification")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    user,
    isLoading,
    /** @deprecated use isLoading */
    loading: isLoading,
    error,
    isAuthenticated: !!user,
    logout,
    /** @deprecated use logout */
    signOut: logout,
    signIn,
    signUp,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    verifyEmail,
    resendVerification,
    refetch: () => fetchProfile(true),
  }
}

/**
 * Compat alias — components that imported `useSession` from `@/hooks/use-auth`
 * previously got a lightweight object; now we just surface the same useAuth data.
 */
export function useSession() {
  const { user, isLoading, isAuthenticated } = useAuth()
  return {
    user,
    isLoggedIn: isAuthenticated,
    isLoading,
    checked: !isLoading,
  }
}
