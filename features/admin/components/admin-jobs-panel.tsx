"use client"

import { useMemo, useState, useTransition } from "react"
import { Link, useRouter } from "@/i18n/navigation"
import { useTranslations, useLocale } from "next-intl"
import type { Job } from "@/lib/api/types"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { pickLocalizedName } from "@/features/admin/lib/localized-name"
import { formatJobSalaryRange } from "@/features/jobs/lib/job-display"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { approveJobAction, rejectJobAction } from "@/features/admin/actions/admin-actions"
import { AdminTableCell, AdminTableRow, AdminTableShell } from "./admin-table-shell"
import { DashboardStatCard } from "@/features/dashboard/components/dashboard-stat-card"
import { cn } from "@/lib/utils"

type Tab = "pending" | "approved" | "rejected" | "all"

function mapStatusForTab(status: string): "pending" | "approved" | "rejected" {
  if (status === "approved" || status === "active" || status === "stopped") return "approved"
  if (status === "rejected") return "rejected"
  return "pending"
}

function mapStatusForBadge(status: string): "pending" | "approved" | "rejected" | "stopped" {
  if (status === "approved" || status === "active") return "approved"
  if (status === "rejected") return "rejected"
  if (status === "stopped") return "stopped"
  return "pending"
}

export function AdminJobsPanel({
  jobs,
  initialTab = "pending",
  serverCounts,
}: {
  jobs: Job[]
  locale: string
  initialTab?: Tab
  serverCounts?: { total: number; pending: number; approved: number; rejected: number }
}) {
  const t = useTranslations("Admin.jobs")
  const tDashboard = useTranslations("Admin.dashboard")
  const router = useRouter()
  const locale = useLocale()
  const isRTL = locale === "ar"
  const [tab, setTab] = useState<Tab>(initialTab)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (tab === "all") return jobs
    return jobs.filter((j) => mapStatusForTab(j.status) === tab)
  }, [jobs, tab])

  const statusCounts = useMemo(() => {
    if (serverCounts) {
      return serverCounts
    }

    return {
      total: jobs.length,
      pending: jobs.filter((job) => mapStatusForTab(job.status) === "pending").length,
      approved: jobs.filter((job) => mapStatusForTab(job.status) === "approved").length,
      rejected: jobs.filter((job) => mapStatusForTab(job.status) === "rejected").length,
    }
  }, [jobs, serverCounts])

  // الترتيب الأساسي الثابت (نفس الترتيب في كل اللغات)
  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: t("tabs.all") },
    { id: "pending", label: t("tabs.pending") },
    { id: "approved", label: t("tabs.approved") },
    { id: "rejected", label: t("tabs.rejected") },
  ]

  const columns = [
    { key: "title", label: t("columns.title"), className: "w-[20%]" },
    { key: "company", label: t("columns.company"), className: "w-[16%]" },
    { key: "category", label: t("columns.category"), className: "w-[12%]" },
    { key: "createdAt", label: isRTL ? "تاريخ الطلب" : "Request Date", className: "w-[14%]" },
    { key: "salary", label: t("columns.salary"), className: "w-[12%]" },
    { key: "status", label: t("columns.status"), className: "w-[10%]" },
    { key: "actions", label: t("columns.actions"), className: "w-[16%]" },
  ]

  const statusLabels: Record<string, string> = {
    pending: t("status.pending"),
    approved: t("status.approved"),
    rejected: t("status.rejected"),
    stopped: isRTL ? "موقوفة" : "Stopped",
  }

  const summaryCards = [
    { key: "total", label: t("summary.total"), value: statusCounts.total, icon: "/dashboard/jobs.svg", href: "/dashboard/admin/jobs?status=all" },
    { key: "pending", label: t("summary.pending"), value: statusCounts.pending, icon: "/dashboard/tickets.svg", href: "/dashboard/admin/jobs?status=pending" },
    { key: "approved", label: t("summary.published"), value: statusCounts.approved, icon: "/dashboard/education_Info.svg", href: "/dashboard/admin/jobs?status=approved" },
    { key: "rejected", label: t("summary.rejected"), value: statusCounts.rejected, icon: "/dashboard/logout.svg", href: "/dashboard/admin/jobs?status=rejected" },
  ]

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

  function handleTabChange(nextTab: Tab) {
    setTab(nextTab)
    router.push(`/dashboard/admin/jobs?status=${nextTab}`)
  }

  return (
    <div className={cn("flex flex-col gap-4", isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <DashboardStatCard
            key={card.key}
            iconSrc={card.icon}
            title={card.label}
            value={card.value}
            viewAllHref={card.href}
            viewAllLabel={tDashboard("viewAll")}
            locale={locale}
            isRTL={isRTL}
          />
        ))}
      </div>

      {/* Tabs - نفس الترتيب في كل اللغات، التدرج يعتمد على اتجاه اللغة */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleTabChange(item.id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              tab === item.id
                ? isRTL
                  ? "bg-gradient-to-r from-[#032C44] to-[#41A0CA] text-white"
                  : "bg-gradient-to-l from-[#032C44] to-[#41A0CA] text-white"
                : "border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {/* Table */}
      <AdminTableShell 
        columns={columns} 
        isEmpty={filtered.length === 0} 
        emptyMessage={t("empty")}
        isRTL={isRTL}
      >
        {filtered.map((job, index) => {
          const status = mapStatusForBadge(job.status)
          const salary = formatJobSalaryRange(job)
          const formattedDate = (() => {
            const dateVal = job.created_at || (job as any).createdAt
            if (!dateVal) return "—"
            try {
              return new Date(dateVal).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            } catch {
              return "—"
            }
          })()

          return (
            <AdminTableRow 
              key={job.id} 
              striped={index % 2 === 1}
              onClick={() => router.push(`/dashboard/admin/jobs/${job.id}`)}
            >
              <AdminTableCell className="w-[20%] font-medium">
                {getJobTitle(job, locale)}
              </AdminTableCell>
              <AdminTableCell className="w-[16%]">
                {job.company?.name ?? "—"}
              </AdminTableCell>
              <AdminTableCell className="w-[12%]">
                {pickLocalizedName(job.category?.name, locale)}
              </AdminTableCell>
              <AdminTableCell className="w-[14%] text-xs">
                {formattedDate}
              </AdminTableCell>
              <AdminTableCell className="w-[12%]">{salary}</AdminTableCell>
              <AdminTableCell className="w-[10%]">
                <DashboardStatusBadge 
                  status={status} 
                  label={statusLabels[status]} 
                  locale={locale}
                />
              </AdminTableCell>
              <AdminTableCell className="w-[16%]">
                <div 
                  className={cn("flex flex-wrap gap-2", isRTL && "flex-row-reverse")}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    locale={locale}
                    href={`/dashboard/admin/jobs/${job.id}`}
                    className="rounded-lg border border-[#DCEBFF] bg-[#F6FBFF] px-3 py-1.5 text-xs font-semibold text-[#006EA8] hover:bg-[#EAF6FF]"
                  >
                    {t("viewDetails")}
                  </Link>
                  {status === "pending" && (
                    <>
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
                    </>
                  )}
                </div>
              </AdminTableCell>
            </AdminTableRow>
          )
        })}
      </AdminTableShell>
    </div>
  )
}