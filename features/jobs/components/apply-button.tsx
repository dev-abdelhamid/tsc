"use client"

import * as React from "react"
import { useRouter } from "@/i18n/navigation"

type ApplyButtonProps = {
  jobId: number
  locale?: string
  label?: string
}

export default function ApplyButton({ jobId, locale = "ar", label = "Apply" }: ApplyButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const handleApply = () => {
    if (loading) return
    setLoading(true)
    router.push(`/jobs/${jobId}/apply`)
  }

  return (
    <button
      type="button"
      onClick={handleApply}
      disabled={loading}
      className="mt-8 h-[44px] w-full rounded-[12px] text-[16px] font-medium bg-gradient-to-br from-[#006EA8] to-[#005685] text-white hover:opacity-95 disabled:opacity-60 transition"
      title={label}
    >
      {loading ? (locale === "ar" ? "جاري..." : "Loading...") : label}
    </button>
  )
}

