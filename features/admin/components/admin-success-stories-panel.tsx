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

type FormState = {
  name: string
  role: string
  quote: string
  location: string
}

const emptyForm = (): FormState => ({
  name: "",
  role: "",
  quote: "",
  location: "",
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
      name: story.name,
      role: story.role,
      quote: story.quote,
      location: story.location ?? "",
    })
    setShowForm(true)
    setError(null)
  }

  function appendCurrentLocale(formData: FormData, key: string, value: string) {
    const trimmed = value.trim()
    if (trimmed) {
      formData.append(`${key}[${locale}]`, trimmed)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const formData = new FormData()
    appendCurrentLocale(formData, "name", form.name)
    appendCurrentLocale(formData, "role", form.role)
    appendCurrentLocale(formData, "quote", form.quote)
    appendCurrentLocale(formData, "location", form.location)
    const file = fileRef.current?.files?.[0]
    if (file) formData.append("image", file)

    setError(null)
    if (!form.location.trim()) {
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
          <p className="mb-4 text-sm text-[#6B7280]">{t("currentLanguageOnly")}</p>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block text-xs text-[#6B7280]">
              {t("fields.name")}
              <input
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>
            <label className="block text-xs text-[#6B7280]">
              {t("fields.role")}
              <input
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              />
            </label>
            <label className="block text-xs text-[#6B7280] lg:col-span-2">
              {t("fields.quote")}
              <textarea
                rows={3}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                value={form.quote}
                onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
              />
            </label>
            <label className="block text-xs text-[#6B7280]">
              {t("fields.location")}
              <input
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </label>
            <label className="block text-xs text-[#6B7280]">
              {t("fields.image")}
              <input ref={fileRef} type="file" accept="image/*" className="mt-1 block text-sm" />
            </label>
          </div>
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
