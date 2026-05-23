"use client"

import { useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { Check, FileText, X } from "lucide-react"
import { updateApplicationStatusAction } from "@/features/company-jobs/actions/application-actions"
import { cn } from "@/lib/utils"

export function ApplicationRowActions({
  applicationId,
  jobId,
  locale,
  status,
  cvUrl,
}: {
  applicationId: number
  jobId: number
  locale: string
  status: string
  cvUrl?: string | null
}) {
  const t = useTranslations("CompanyJobs")
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const runStatus = (next: "accepted" | "rejected") => {
    startTransition(async () => {
      const result = await updateApplicationStatusAction(
        applicationId,
        jobId,
        next,
        locale
      )
      if (result.ok) router.refresh()
      else alert(result.message)
    })
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        disabled={pending || status === "accepted"}
        onClick={() => runStatus("accepted")}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#B66FED] bg-[#E7D7FA] px-3 text-sm font-medium text-[#9333CD] transition hover:opacity-90 disabled:opacity-50"
        )}
      >
        <Check className="size-4" aria-hidden />
        {t("applicationsPage.approve")}
      </button>
      <button
        type="button"
        disabled={pending || status === "rejected"}
        onClick={() => runStatus("rejected")}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#F78E8E] bg-[#FDEDED] px-3 text-sm font-medium text-[#F53334] transition hover:opacity-90 disabled:opacity-50"
      >
        <X className="size-4" aria-hidden />
        {t("applicationsPage.reject")}
      </button>
      {cvUrl ? (
        <a
          href={cvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#78A3BE] bg-white px-3 text-sm font-medium text-[#006EA8] transition hover:bg-[#F5F9FC]"
        >
          <FileText className="size-4" aria-hidden />
          {t("applicationsPage.details")}
        </a>
      ) : (
        <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] px-3 text-sm text-[#A3A3A3]">
          <FileText className="size-4" aria-hidden />
          {t("applicationsPage.details")}
        </span>
      )}
    </div>
  )
}
