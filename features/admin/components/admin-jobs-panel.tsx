"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import type { Job } from "@/lib/api/types"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { pickLocalizedName } from "@/features/admin/lib/localized-name"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { approveJobAction, rejectJobAction } from "@/features/admin/actions/admin-actions"
import { AdminTableCell, AdminTableRow, AdminTableShell } from "./admin-table-shell"
import { cn } from "@/lib/utils"

type Tab = "pending" | "approved" | "rejected" | "all"

function mapStatus(status: string): "pending" | "approved" | "rejected" {
  if (status === "approved" || status === "active") return "approved"
  if (status === "rejected") return "rejected"
  return "pending"
}

export function AdminJobsPanel({
  jobs,
  locale,
  initialTab = "pending",
}: {
  jobs: Job[]
  locale: string
  initialTab?: Tab
}) {
  const t = useTranslations("Admin.jobs")
  const router = useRouter()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (tab === "all") return jobs
    return jobs.filter((j) => mapStatus(j.status) === tab)
  }, [jobs, tab])

  const tabs: { id: Tab; label: string }[] = [
    { id: "pending", label: t("tabs.pending") },
    { id: "approved", label: t("tabs.approved") },
    { id: "rejected", label: t("tabs.rejected") },
    { id: "all", label: t("tabs.all") },
  ]

  const columns = [
    { key: "title", label: t("columns.title"), className: "w-[26%]" },
    { key: "company", label: t("columns.company"), className: "w-[18%]" },
    { key: "category", label: t("columns.category"), className: "w-[14%]" },
    { key: "salary", label: t("columns.salary"), className: "w-[14%]" },
    { key: "status", label: t("columns.status"), className: "w-[12%]" },
    { key: "actions", label: t("columns.actions"), className: "w-[16%]" },
  ]

  const statusLabels: Record<string, string> = {
    pending: t("status.pending"),
    approved: t("status.approved"),
    rejected: t("status.rejected"),
  }

  function runAction(action: () => Promise<{ ok: boolean; message?: string }>) {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        setError(result.message ?? t("error"))
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              tab === item.id
                ? "bg-gradient-to-l from-[#032C44] to-[#41A0CA] text-white"
                : "border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p>
      )}

      <AdminTableShell columns={columns} isEmpty={filtered.length === 0} emptyMessage={t("empty")}>
        {filtered.map((job, index) => {
          const status = mapStatus(job.status)
          const salary =
            job.salary_from != null && job.salary_to != null
              ? `€${job.salary_from} – €${job.salary_to}`
              : "—"

          return (
            <AdminTableRow key={job.id} striped={index % 2 === 1}>
              <AdminTableCell className="w-[26%] font-medium">{getJobTitle(job, locale)}</AdminTableCell>
              <AdminTableCell className="w-[18%]">{job.company?.name ?? "—"}</AdminTableCell>
              <AdminTableCell className="w-[14%]">
                {pickLocalizedName(job.category?.name, locale)}
              </AdminTableCell>
              <AdminTableCell className="w-[14%]">{salary}</AdminTableCell>
              <AdminTableCell className="w-[12%]">
                <DashboardStatusBadge status={status} label={statusLabels[status]} />
              </AdminTableCell>
              <AdminTableCell className="w-[16%]">
                {status === "pending" ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => runAction(() => approveJobAction(job.id, locale))}
                      className="rounded-lg bg-[#D1FAE5] px-3 py-1.5 text-xs font-semibold text-[#065F46] hover:bg-[#A7F3D0] disabled:opacity-50"
                    >
                      {t("approve")}
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => runAction(() => rejectJobAction(job.id, locale))}
                      className="rounded-lg bg-[#FEE2E2] px-3 py-1.5 text-xs font-semibold text-[#991B1B] hover:bg-[#FECACA] disabled:opacity-50"
                    >
                      {t("reject")}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-[#9CA3AF]">—</span>
                )}
              </AdminTableCell>
            </AdminTableRow>
          )
        })}
      </AdminTableShell>
    </div>
  )
}
