"use client"

import { useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import type { News, Notification } from "@/lib/api/types"
import type { SiteSetting } from "@/lib/api/services/settings.service"
import {
  deleteNewsAction,
  deleteNotificationAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  saveNewsAction,
  saveSettingAction,
} from "@/features/admin/actions/admin-actions"
import { AdminTableCell, AdminTableRow, AdminTableShell } from "./admin-table-shell"
import { PrimaryButton } from "@/components/ui/primary-button"
import { cn } from "@/lib/utils"

const LOCALES = ["ar", "en", "de"] as const
type Tab = "settings" | "news" | "notifications"

function settingDisplayValue(value: SiteSetting["value"]): string {
  if (typeof value === "string") return value
  if (typeof value === "object" && value) return JSON.stringify(value, null, 2)
  return String(value ?? "")
}

export function AdminSettingsPanel({
  settings,
  news,
  notifications,
  locale,
}: {
  settings: SiteSetting[]
  news: News[]
  notifications: Notification[]
  locale: string
}) {
  const t = useTranslations("Admin.settings")
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("settings")
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [settingValue, setSettingValue] = useState("")
  const [showNewsForm, setShowNewsForm] = useState(false)
  const [newsTitles, setNewsTitles] = useState<Record<string, string>>({ ar: "", en: "", de: "" })
  const [newsDesc, setNewsDesc] = useState<Record<string, string>>({ ar: "", en: "", de: "" })

  const tabs: { id: Tab; label: string }[] = [
    { id: "settings", label: t("tabs.settings") },
    { id: "news", label: t("tabs.news") },
    { id: "notifications", label: t("tabs.notifications") },
  ]

  function saveSetting(key: string) {
    const fd = new FormData()
    fd.append("value", settingValue)
    fd.append("type", "json")
    fd.append("is_public", "1")
    startTransition(async () => {
      const result = await saveSettingAction(key, fd, locale)
      if (!result.ok) setError(result.message ?? t("error"))
      else {
        setEditingKey(null)
        router.refresh()
      }
    })
  }

  function submitNews(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    for (const loc of LOCALES) {
      if (newsTitles[loc]) fd.append(`title[${loc}]`, newsTitles[loc])
      if (newsDesc[loc]) fd.append(`description[${loc}]`, newsDesc[loc])
    }
    const input = document.getElementById("admin-news-image") as HTMLInputElement | null
    if (input?.files?.[0]) fd.append("image", input.files[0])

    startTransition(async () => {
      const result = await saveNewsAction(fd, locale)
      if (!result.ok) setError(result.message ?? t("error"))
      else {
        setShowNewsForm(false)
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id)
              setError(null)
            }}
            className={cn(
              "rounded-t-lg px-4 py-2 text-sm font-semibold",
              tab === item.id
                ? "border-b-2 border-[#006EA8] text-[#006EA8]"
                : "text-[#6B7280] hover:text-[#111827]"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p>
      )}

      {tab === "settings" && (
        <div className="space-y-3">
          {settings.length === 0 ? (
            <p className="text-sm text-[#6B7280]">{t("settingsEmpty")}</p>
          ) : (
            settings.map((s) => (
              <div
                key={s.key}
                className="rounded-lg border border-[#E5E7EB] bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#111827]">{s.key}</p>
                    {s.label && <p className="text-xs text-[#9CA3AF]">{s.label}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingKey(s.key)
                      setSettingValue(settingDisplayValue(s.value))
                    }}
                    className="text-xs font-semibold text-[#006EA8] hover:underline"
                  >
                    {t("edit")}
                  </button>
                </div>
                {editingKey === s.key ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      rows={4}
                      className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 font-mono text-xs"
                      value={settingValue}
                      onChange={(e) => setSettingValue(e.target.value)}
                    />
                    <PrimaryButton
                      type="button"
                      disabled={pending}
                      onClick={() => saveSetting(s.key)}
                      className="h-8 rounded-lg px-3 text-xs"
                    >
                      {t("save")}
                    </PrimaryButton>
                  </div>
                ) : (
                  <pre className="mt-2 max-h-24 overflow-auto rounded bg-[#F9FAFB] p-2 text-xs text-[#525252]">
                    {settingDisplayValue(s.value)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "news" && (
        <div className="space-y-4">
          <PrimaryButton
            type="button"
            onClick={() => setShowNewsForm(!showNewsForm)}
            className="h-9 rounded-lg px-4 text-sm"
          >
            {t("addNews")}
          </PrimaryButton>
          {showNewsForm && (
            <form onSubmit={submitNews} className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {LOCALES.map((loc) => (
                  <div key={loc} className="space-y-2 rounded border bg-white p-3">
                    <p className="text-xs font-bold text-[#006EA8]">{loc}</p>
                    <input
                      placeholder={t("newsTitle")}
                      className="w-full rounded border px-2 py-1.5 text-sm"
                      value={newsTitles[loc]}
                      onChange={(e) =>
                        setNewsTitles((n) => ({ ...n, [loc]: e.target.value }))
                      }
                    />
                    <textarea
                      placeholder={t("newsDesc")}
                      rows={2}
                      className="w-full rounded border px-2 py-1.5 text-sm"
                      value={newsDesc[loc]}
                      onChange={(e) => setNewsDesc((n) => ({ ...n, [loc]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <label className="mt-3 block text-sm">
                {t("newsImage")}
                <input id="admin-news-image" type="file" accept="image/*" className="mt-1 text-sm" />
              </label>
              <PrimaryButton type="submit" disabled={pending} className="mt-3 h-9 rounded-lg px-4 text-sm">
                {t("saveNews")}
              </PrimaryButton>
            </form>
          )}
          <AdminTableShell
            columns={[
              { key: "title", label: t("newsColTitle"), className: "w-[40%]" },
              { key: "date", label: t("newsColDate"), className: "w-[30%]" },
              { key: "actions", label: t("newsColActions"), className: "w-[30%]" },
            ]}
            isEmpty={news.length === 0}
            emptyMessage={t("newsEmpty")}
          >
            {news.map((item, index) => (
              <AdminTableRow key={item.id} striped={index % 2 === 1}>
                <AdminTableCell className="w-[40%] font-medium">{item.title}</AdminTableCell>
                <AdminTableCell className="w-[30%]">
                  {new Date(item.published_at).toLocaleDateString(locale)}
                </AdminTableCell>
                <AdminTableCell className="w-[30%]">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (!confirm(t("deleteConfirm"))) return
                      startTransition(async () => {
                        await deleteNewsAction(item.id, locale)
                        router.refresh()
                      })
                    }}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    {t("delete")}
                  </button>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableShell>
        </div>
      )}

      {tab === "notifications" && (
        <div className="space-y-3">
          {notifications.length > 0 && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await markAllNotificationsReadAction(locale)
                  router.refresh()
                })
              }
              className="text-sm font-semibold text-[#006EA8] hover:underline disabled:opacity-50"
            >
              {t("markAllRead")}
            </button>
          )}
          {notifications.length === 0 ? (
            <p className="text-sm text-[#6B7280]">{t("notificationsEmpty")}</p>
          ) : (
            <ul className="divide-y divide-[#E5E7EB] rounded-lg border border-[#E5E7EB] bg-white">
              {notifications.map((n) => (
                <li key={n.id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3">
                  <div>
                    <p className="font-medium text-[#111827]">{n.title}</p>
                    <p className="text-sm text-[#6B7280]">{n.body}</p>
                    <p className="mt-1 text-xs text-[#9CA3AF]">
                      {new Date(n.created_at).toLocaleString(locale)}
                      {!n.read_at && (
                        <span className="ms-2 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[#92400E]">
                          {t("unread")}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!n.read_at && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            await markNotificationReadAction(n.id, locale)
                            router.refresh()
                          })
                        }
                        className="text-xs font-semibold text-[#006EA8] hover:underline"
                      >
                        {t("markRead")}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await deleteNotificationAction(n.id, locale)
                          router.refresh()
                        })
                      }
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      {t("delete")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
