"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { invalidateSessionCache } from "@/hooks/use-auth"

type Props = {
  needsClientPersist?: boolean
  initialTokens?: { access_token?: string; refresh_token?: string } | null
}

export default function SessionPersist({ needsClientPersist, initialTokens }: Props = {}) {
  const router = useRouter()
  const lastPersistedTokenRef = useRef<string | null>(null)

  useEffect(() => {
    try {
      // Prefer explicit props when caller passes tokens (admin pages)
      let tokens = initialTokens ?? null

      // If no explicit tokens provided, attempt to read inert template inserted by server layout
      if (!tokens) {
        const tpl = document.getElementById("__INITIAL_AUTH_TOKENS") as HTMLTemplateElement | null
        if (tpl) {
          const text = tpl.textContent || tpl.innerHTML || ""
          if (text) {
            try {
              tokens = JSON.parse(text)
            } catch {
              tokens = null
            }
          }
        }
      }

      if (!tokens && !needsClientPersist) return

      const currentToken = (tokens as any)?.access_token || (tokens as any)?.accessToken || ""

      // Break infinite loops if the token hasn't changed
      if (currentToken && lastPersistedTokenRef.current === currentToken) {
        return
      }
      lastPersistedTokenRef.current = currentToken || ""

      // Post tokens to the server to persist httpOnly refresh cookie.
      ;(async () => {
        try {
          const resp = await fetch("/api/auth/session", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: { tokens: { access_token: currentToken } } }),
            cache: "no-store",
          })

          // If persistence succeeded, invalidate client session cache so
          // UI components re-fetch and reflect the logged-in state.
          if (resp && resp.ok) {
            try {
              invalidateSessionCache()
              // also refresh server components if present
              try {
                router.refresh()
              } catch {}
            } catch {}
          }
        } catch (e) {
          // best-effort; do not throw
          // eslint-disable-next-line no-console
          console.warn("SessionPersist: failed to persist tokens", e)
        } finally {
          try {
            const tpl = document.getElementById("__INITIAL_AUTH_TOKENS") as HTMLTemplateElement | null
            if (tpl) tpl.remove()
          } catch {}
        }
      })()
    } catch (e) {
      // ignore errors in persistence flow
    }
  }, [needsClientPersist, initialTokens, router])

  return null
}

