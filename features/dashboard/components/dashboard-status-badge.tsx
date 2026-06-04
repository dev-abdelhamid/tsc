import { CheckCircle, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type JobStatus = "approved" | "rejected" | "pending" | "accepted" | "reviewed"

type StatusConfig = {
  label: { ar: string; en: string }
  className: string
  icon: typeof CheckCircle
}

const CONFIG: Record<JobStatus, StatusConfig> = {
  approved: {
    label: { ar: "مقبول", en: "Approved" },
    className: "bg-[#E7D7FA] border-[#B66FED] text-[#9333CD]",
    icon: CheckCircle,
  },
  accepted: {
    label: { ar: "مقبول", en: "Accepted" },
    className: "bg-[#D1FAE5] border-[#A7F3D0] text-[#065F46]",
    icon: CheckCircle,
  },
  rejected: {
    label: { ar: "مرفوض", en: "Rejected" },
    className: "bg-[#FDEDED] border-[#F78E8E] text-[#F53334]",
    icon: XCircle,
  },
  pending: {
    label: { ar: "قيد المراجعة", en: "Pending" },
    className: "bg-[#FFEEDE] border-[#FCB304] text-[#FCB304]",
    icon: Clock,
  },
  reviewed: {
    label: { ar: "تمت المراجعة", en: "Reviewed" },
    className: "bg-[#DBEAFE] border-[#BFDBFE] text-[#1E40AF]",
    icon: Clock,
  },
}

export function DashboardStatusBadge({
  status,
  label,
  locale,
}: {
  status: string
  label?: string
  locale?: string
}) {
  const key = (status in CONFIG ? status : "pending") as JobStatus
  const cfg = CONFIG[key]
  const Icon = cfg.icon
  const isAr = locale === "ar"
  const displayLabel = label ?? (isAr ? cfg.label.ar : cfg.label.en)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-normal",
        cfg.className
      )}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-100" aria-hidden />
      {displayLabel}
    </span>
  )
}
