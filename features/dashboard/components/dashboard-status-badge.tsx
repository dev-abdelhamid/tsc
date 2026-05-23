import { CheckCircle, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type JobStatus = "approved" | "rejected" | "pending" | "accepted" | "reviewed"

const CONFIG: Record<
  JobStatus,
  { label: string; className: string; icon: typeof CheckCircle }
> = {
  approved: {
    label: "Approved",
    className: "bg-[#E7D7FA] border-[#B66FED] text-[#9333CD]",
    icon: CheckCircle,
  },
  accepted: {
    label: "Accepted",
    className: "bg-[#D1FAE5] border-[#A7F3D0] text-[#065F46]",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    className: "bg-[#FDEDED] border-[#F78E8E] text-[#F53334]",
    icon: XCircle,
  },
  pending: {
    label: "Pending",
    className: "bg-[#FFEEDE] border-[#FCB304] text-[#FCB304]",
    icon: Clock,
  },
  reviewed: {
    label: "Reviewed",
    className: "bg-[#DBEAFE] border-[#BFDBFE] text-[#1E40AF]",
    icon: Clock,
  },
}

export function DashboardStatusBadge({
  status,
  label,
}: {
  status: string
  label?: string
}) {
  const key = (status in CONFIG ? status : "pending") as JobStatus
  const cfg = CONFIG[key]
  const Icon = cfg.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-normal",
        cfg.className
      )}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-100" aria-hidden />
      {label ?? cfg.label}
    </span>
  )
}
