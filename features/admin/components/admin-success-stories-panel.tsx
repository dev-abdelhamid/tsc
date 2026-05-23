"use client"

import Image from "next/image"
import { useRef, useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import type { SuccessStory } from "@/lib/api/types"
import { resolveStoryImageUrl } from "@/features/testimonials/lib/resolve-story-image"
import {
  deleteSuccessStoryAction,
  saveSuccessStoryAction,
} from "@/features/admin/actions/admin-actions"
import { AdminTableCell, AdminTableRow, AdminTableShell } from "./admin-table-shell"
import { PrimaryButton } from "@/components/ui/primary-button"

const LOCALES = ["ar", "en", "de"] as const

type FormState = {
  name: Record<string, string>
  role: Record<string, string>
  quote: Record<string, string>
  location: Record<string, string>
}

const emptyForm = (): FormState => ({
  name: { ar: "", en: "", de: "" },
  role: { ar: "", en: "", de: "" },
  quote: { ar: "", en: "", de: "" },
  location: { ar: "", en: "", de: "" },
})

export function AdminSuccessStoriesPanel({
  stories,
  locale,
}: {
  stories: SuccessStory[]
  locale: string
}) {
  const t = useTranslations("Admin.successStories")
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())

  const columns = [
    { key: "image", label: t("columns.image"), className: "w-[10%]" },
    { key: "name", label: t("columns.name"), className: "w-[18%]" },
    { key: "role", label: t("columns.role"), className: "w-[18%]" },
    { key: "location", label: t("columns.location"), className: "w-[14%]" },
    { key: "quote", label: t("columns.quote"), className: "w-[34%]" },
    { key: "actions", label: t("columns.actions"), className: "w-[20%]" },
  ]

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setShowForm(true)
    setError(null)
  }

  function openEdit(story: SuccessStory) {
    setEditingId(story.id)
    setForm({
      name: { ar: story.name, en: story.name, de: story.name },
      role: { ar: story.role, en: story.role, de: story.role },
      quote: { ar: story.quote, en: story.quote, de: story.quote },
      location: { ar: story.location ?? "", en: story.location ?? "", de: story.location ?? "" },
    })
    setShowForm(true)
    setError(null)
  }

  function appendLocalized(formData: FormData, key: string, values: Record<string, string>) {
    for (const loc of LOCALES) {
      const v = values[loc]?.trim()
      if (v) formData.append(`${key}[${loc}]`, v)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const formData = new FormData()
    appendLocalized(formData, "name", form.name)
    appendLocalized(formData, "role", form.role)
    appendLocalized(formData, "quote", form.quote)
    appendLocalized(formData, "location", form.location)
    const file = fileRef.current?.files?.[0]
    if (file) formData.append("image", file)

    setError(null)
    // client-side fast-fail: require location for current locale
    if (!form.location[locale]?.trim()) {
      setError(t("locationRequired"))
      return
    }

    startTransition(async () => {
      const result = await saveSuccessStoryAction(formData, locale, editingId ?? undefined)
      if (!result.ok) {
        setError(result.message ?? t("error"))
        return
      }
      setShowForm(false)
      setEditingId(null)
      if (fileRef.current) fileRef.current.value = ""
      router.refresh()
    })
  }

  function handleDelete(id: number) {
    if (!confirm(t("deleteConfirm"))) return
    startTransition(async () => {
      const result = await deleteSuccessStoryAction(id, locale)
      if (!result.ok) setError(result.message ?? t("error"))
      else router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#6B7280]">{t("hint")}</p>
        <PrimaryButton type="button" onClick={openCreate} className="h-9 rounded-lg px-4 text-sm">
          {t("add")}
        </PrimaryButton>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:p-6"
        >
          <h3 className="mb-4 text-base font-bold text-[#111827]">
            {editingId ? t("editTitle") : t("createTitle")}
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {LOCALES.map((loc) => (
              <div key={loc} className="space-y-3 rounded-lg border border-[#E5E7EB] bg-white p-3">
                <p className="text-xs font-bold uppercase text-[#006EA8]">{loc}</p>
                <label className="block text-xs text-[#6B7280]">
                  {t("fields.name")}
                  <input
                    className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                    value={form.name[loc]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: { ...f.name, [loc]: e.target.value } }))
                    }
                  />
                </label>
                <label className="block text-xs text-[#6B7280]">
                  {t("fields.role")}
                  <input
                    className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                    value={form.role[loc]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: { ...f.role, [loc]: e.target.value } }))
                    }
                  />
                </label>
                <label className="block text-xs text-[#6B7280]">
                  {t("fields.quote")}
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                    value={form.quote[loc]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, quote: { ...f.quote, [loc]: e.target.value } }))
                    }
                  />
                </label>
                <label className="block text-xs text-[#6B7280]">
                  {t("fields.location")}
                  <input
                    className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                    value={form.location[loc]}
                    required={loc === locale}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: { ...f.location, [loc]: e.target.value } }))
                    }
                  />
                </label>
              </div>
            ))}
          </div>
          <label className="mt-4 block text-sm text-[#6B7280]">
            {t("fields.image")}
            <input ref={fileRef} type="file" accept="image/*" className="mt-1 block text-sm" />
          </label>
          <div className="mt-4 flex gap-2">
            <PrimaryButton type="submit" disabled={pending} className="h-9 rounded-lg px-4 text-sm">
              {pending ? t("saving") : t("save")}
            </PrimaryButton>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#374151]"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      )}

      <AdminTableShell columns={columns} isEmpty={stories.length === 0} emptyMessage={t("empty")}>
        {stories.map((story, index) => (
          <AdminTableRow key={story.id} striped={index % 2 === 1}>
            <AdminTableCell className="w-[10%]">
              <Image
                src={resolveStoryImageUrl(story.image_url ?? story.image, index)}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg object-cover"
                unoptimized
              />
            </AdminTableCell>
            <AdminTableCell className="w-[18%] font-medium">{story.name}</AdminTableCell>
            <AdminTableCell className="w-[18%]">{story.role}</AdminTableCell>
            <AdminTableCell className="w-[14%]">{story.location}</AdminTableCell>
            <AdminTableCell className="w-[34%] truncate">{story.quote}</AdminTableCell>
            <AdminTableCell className="w-[20%]">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(story)}
                  className="text-xs font-semibold text-[#006EA8] hover:underline"
                >
                  {t("edit")}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleDelete(story.id)}
                  className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                >
                  {t("delete")}
                </button>
              </div>
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminTableShell>
    </div>
  )
}
