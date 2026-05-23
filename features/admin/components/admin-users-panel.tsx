"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import type { User } from "@/lib/api/types"
import { deleteUserAction } from "@/features/admin/actions/admin-actions"
import { AdminTableCell, AdminTableRow, AdminTableShell } from "./admin-table-shell"
import { cn } from "@/lib/utils"

type RoleFilter = "all" | "user" | "company" | "admin"

const ROLE_COLORS: Record<string, string> = {
  user: "bg-[#DBEAFE] text-[#1E40AF]",
  company: "bg-[#FCE7F3] text-[#9D174D]",
  admin: "bg-[#FEF3C7] text-[#92400E]",
}

export function AdminUsersPanel({ users, locale }: { users: User[]; locale: string }) {
  const t = useTranslations("Admin.users")
  const router = useRouter()
  const [role, setRole] = useState<RoleFilter>("all")
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (role === "all") return users
    return users.filter((u) => u.role === role)
  }, [users, role])

  const filters: { id: RoleFilter; label: string }[] = [
    { id: "all", label: t("filters.all") },
    { id: "user", label: t("filters.user") },
    { id: "company", label: t("filters.company") },
    { id: "admin", label: t("filters.admin") },
  ]

  const columns = [
    { key: "name", label: t("columns.name"), className: "w-[22%]" },
    { key: "email", label: t("columns.email"), className: "w-[28%]" },
    { key: "phone", label: t("columns.phone"), className: "w-[18%]" },
    { key: "role", label: t("columns.role"), className: "w-[14%]" },
    { key: "actions", label: t("columns.actions"), className: "w-[18%]" },
  ]

  function handleDelete(userId: number | string) {
    if (!confirm(t("deleteConfirm"))) return
    setError(null)
    startTransition(async () => {
      const result = await deleteUserAction(userId, locale)
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
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setRole(f.id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              role === f.id
                ? "bg-gradient-to-l from-[#032C44] to-[#41A0CA] text-white"
                : "border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p>
      )}

      <AdminTableShell columns={columns} isEmpty={filtered.length === 0} emptyMessage={t("empty")}>
        {filtered.map((user, index) => (
          <AdminTableRow key={user.id} striped={index % 2 === 1}>
            <AdminTableCell className="w-[22%] font-medium">{user.name}</AdminTableCell>
            <AdminTableCell className="w-[28%]">{user.email}</AdminTableCell>
            <AdminTableCell className="w-[18%]">{user.phone || "—"}</AdminTableCell>
            <AdminTableCell className="w-[14%]">
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                  ROLE_COLORS[user.role] ?? ROLE_COLORS.user
                )}
              >
                {t(`roles.${user.role}`)}
              </span>
            </AdminTableCell>
            <AdminTableCell className="w-[18%]">
              {user.role !== "admin" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleDelete(user.id)}
                  className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                >
                  {t("delete")}
                </button>
              ) : (
                <span className="text-xs text-[#9CA3AF]">—</span>
              )}
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminTableShell>
    </div>
  )
}
