"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import type { User } from "@/lib/api/types"
import { AdminTableCell, AdminTableRow, AdminTableShell } from "./admin-table-shell"

export function AdminCompaniesPanel({ companies, locale }: { companies: User[]; locale: string }) {
  const t = useTranslations("Admin.companies")

  const columns = [
    { key: "name", label: t("columns.name"), className: "w-[30%]" },
    { key: "email", label: t("columns.email"), className: "w-[30%]" },
    { key: "phone", label: t("columns.phone"), className: "w-[20%]" },
    { key: "verified", label: t("columns.verified"), className: "w-[20%]" },
  ]

  return (
    <AdminTableShell columns={columns} isEmpty={companies.length === 0} emptyMessage={t("empty")}>
      {companies.map((company, index) => (
        <AdminTableRow key={company.id} striped={index % 2 === 1}>
          <AdminTableCell className="w-[30%]">
            <div className="flex items-center gap-3">
              {company.avatar ? (
                <Image
                  src={company.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-lg object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EBF5FB] text-sm font-bold text-[#006EA8]">
                  {company.name?.charAt(0) ?? "C"}
                </div>
              )}
              <span className="font-medium">{company.name}</span>
            </div>
          </AdminTableCell>
          <AdminTableCell className="w-[30%]">{company.email}</AdminTableCell>
          <AdminTableCell className="w-[20%]">{company.phone || "—"}</AdminTableCell>
          <AdminTableCell className="w-[20%]">
            {company.email_verified_at ? t("verified") : t("notVerified")}
          </AdminTableCell>
        </AdminTableRow>
      ))}
    </AdminTableShell>
  )
}
