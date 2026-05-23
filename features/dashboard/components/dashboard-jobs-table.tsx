import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { DashboardStatusBadge } from "./dashboard-status-badge"

export type DashboardJobRow = {
  id: number
  title: string
  column2: string | number
  deadline: string
  status: "approved" | "rejected" | "pending" | "accepted" | "reviewed"
  detailsHref: string
}

type DashboardJobsTableProps = {
  title: string
  rows: DashboardJobRow[]
  col2Label: string
  emptyMessage: string
  detailsLabel: string
  isRTL?: boolean
  jobTitleLabel?: string
  deadlineLabel?: string
  statusLabel?: string
  actionsLabel?: string
}

export function DashboardJobsTable({
  title,
  rows,
  col2Label,
  emptyMessage,
  detailsLabel,
  isRTL,
  jobTitleLabel = "Job Title",
  deadlineLabel = "Deadline",
  statusLabel = "Status",
  actionsLabel = "Actions",
}: DashboardJobsTableProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <h2 className="text-xl font-semibold capitalize leading-[150%] text-[#262626]">{title}</h2>

      <div className="w-full overflow-x-auto rounded-[8px]">
        {/* Table header */}
        <div
          className="flex min-w-[720px] items-center rounded-t-[8px] bg-gradient-to-l from-[#032C44] to-[#41A0CA] text-white"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div className="w-[28%] shrink-0 px-2 py-2 text-base font-normal">{jobTitleLabel}</div>
          <div className="flex flex-1 justify-center px-2 py-2 text-base font-normal">{col2Label}</div>
          <div className="flex flex-1 justify-center px-2 py-2 text-base font-normal">{deadlineLabel}</div>
          <div className="flex flex-1 justify-center px-2 py-2 text-base font-normal">{statusLabel}</div>
          <div className="flex flex-1 justify-end px-2 py-2 text-base font-normal">{actionsLabel}</div>
        </div>

        {/* Rows */}
        <div className="min-w-[720px] rounded-b-[8px] border border-t-0 border-gray-100">
          {rows.length === 0 ? (
            <p className="bg-white px-4 py-12 text-center text-sm text-gray-500">{emptyMessage}</p>
          ) : (
            rows.map((row, index) => (
              <div
                key={row.id}
                className={cn(
                  "flex items-center border-b border-gray-50 last:border-0",
                  index % 2 === 0 ? "bg-white" : "bg-gradient-to-l from-[#032C44]/10 to-[#41A0CA]/10"
                )}
                dir={isRTL ? "rtl" : "ltr"}
              >
                <div className="flex w-[28%] shrink-0 items-center gap-2 px-2 py-3 text-base font-medium text-[#262626]">
                  <Image
                    src="/dashboard/jobs.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4 shrink-0 opacity-100 [filter:brightness(0)_saturate(100%)_invert(50%)_sepia(10%)_saturate(500%)_hue-rotate(176deg)]"
                    aria-hidden
                  />
                  <span className="truncate">{row.title}</span>
                </div>
                <div className="flex flex-1 justify-center px-2 py-3 text-base text-[#262626]">
                  {row.column2}
                </div>
                <div className="flex flex-1 justify-center px-2 py-3 text-base text-[#262626]">
                  {row.deadline}
                </div>
                <div className="flex flex-1 justify-center px-2 py-3">
                  <DashboardStatusBadge status={row.status} />
                </div>
                <div className="flex flex-1 justify-end px-2 py-3">
                  <Link
                    href={row.detailsHref}
                    className="inline-flex items-center gap-2 rounded-[8px] bg-gradient-to-b from-[#006EA8] to-[#005685] px-4 py-2 text-xs font-normal text-white shadow-[inset_0_1px_18px_2px_#E8F2FF,inset_0_1px_4px_2px_#C2DDFF] hover:opacity-95"
                  >
                    <Image src="/dashboard/jobs.svg" alt="" width={16} height={16} className="h-4 w-4 brightness-0 invert" />
                    {detailsLabel}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
