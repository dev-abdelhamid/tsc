"use client"

import * as React from "react"
import { useRouter } from "@/i18n/navigation"
import { PrimaryButton } from "@/components/ui/primary-button"

type ApplyButtonProps = {
  jobId: number
  locale?: string
  label?: string
}

export default function ApplyButton({ jobId, locale = "ar", label = "Apply" }: ApplyButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [shouldHide, setShouldHide] = React.useState(false)

  React.useEffect(() => {
    const userStr = localStorage.getItem("auth_user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user && (user.role === "company" || user.role === "admin")) {
          setShouldHide(true)
        }
      } catch (e) {
        // ignore
      }
    }
  }, [])

  const handleApply = () => {
    if (loading) return
    setLoading(true)
    router.push(`/jobs/${jobId}/apply`)
  }

  if (shouldHide) return null

  return (
    <PrimaryButton
      type="button"
      onClick={handleApply}
      disabled={loading}
      className="mt-8"
    >
      {loading ? (locale === "ar" ? "جاري..." : "Loading...") : label}
    </PrimaryButton>
  )
}

