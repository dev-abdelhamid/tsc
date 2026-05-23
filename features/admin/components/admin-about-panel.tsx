"use client"

import Image from "next/image"
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { PrimaryButton } from "@/components/ui/primary-button"
import type { AboutPageContent } from "@/lib/api/services/about.service"
import { saveAboutAction } from "@/features/admin/actions/admin-actions"

const LOCALES = ["ar", "en", "de"] as const

type FormState = {
  title: Record<(typeof LOCALES)[number], string>
  descriptionLeft: Record<(typeof LOCALES)[number], string>
  descriptionRight: Record<(typeof LOCALES)[number], string>
  secondTitle: Record<(typeof LOCALES)[number], string>
  secondDescription: Record<(typeof LOCALES)[number], string>
}

function emptyForm(): FormState {
  return {
    title: { ar: "", en: "", de: "" },
    descriptionLeft: { ar: "", en: "", de: "" },
    descriptionRight: { ar: "", en: "", de: "" },
    secondTitle: { ar: "", en: "", de: "" },
    secondDescription: { ar: "", en: "", de: "" },
  }
}

function mapContentToForm(content: AboutPageContent | null): FormState {
  if (!content) return emptyForm()

  return {
    title: { ar: content.title, en: content.title, de: content.title },
    descriptionLeft: { ar: content.descriptionLeft, en: content.descriptionLeft, de: content.descriptionLeft },
    descriptionRight: { ar: content.descriptionRight, en: content.descriptionRight, de: content.descriptionRight },
    secondTitle: { ar: content.secondTitle, en: content.secondTitle, de: content.secondTitle },
    secondDescription: {
      ar: content.secondDescription,
      en: content.secondDescription,
      de: content.secondDescription,
    },
  }
}

export function AdminAboutPanel({
  content,
  locale,
}: {
  content: AboutPageContent | null
  locale: string
}) {
  const t = useTranslations("Admin.about")
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(() => mapContentToForm(content))
  const [primaryImage, setPrimaryImage] = useState<File | null>(null)
  const [secondaryImage, setSecondaryImage] = useState<File | null>(null)

  const hasCurrentImages = useMemo(() => !!content?.image || !!content?.secondImage, [content])

  function appendLocalized(formData: FormData, key: string, values: Record<(typeof LOCALES)[number], string>) {
    for (const lang of LOCALES) {
      const value = values[lang]?.trim()
      if (value) {
        formData.append(`${key}[${lang}]`, value)
      }
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData()
    appendLocalized(formData, "title", form.title)
    appendLocalized(formData, "description_left", form.descriptionLeft)
    appendLocalized(formData, "description_right", form.descriptionRight)
    appendLocalized(formData, "second_title", form.secondTitle)
    appendLocalized(formData, "second_description", form.secondDescription)

    if (primaryImage) formData.append("image", primaryImage)
    if (secondaryImage) formData.append("second_image", secondaryImage)

    setError(null)

    startTransition(async () => {
      const result = await saveAboutAction(formData, locale)

      if (!result.ok) {
        setError(result.message ?? t("error"))
        return
      }

      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-[8px] border border-[#E5E7EB] bg-white p-4 sm:p-6">
      <div className="space-y-1">
        <p className="text-sm text-[#6B7280]">{t("summary")}</p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {LOCALES.map((lang) => (
          <div key={lang} className="rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-[#006EA8]">{lang}</p>

            <label className="mb-3 block text-sm text-[#374151]">
              {t("fields.title")}
              <input
                value={form.title[lang]}
                onChange={(e) => setForm((current) => ({ ...current, title: { ...current.title, [lang]: e.target.value } }))}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
              />
            </label>

            <label className="mb-3 block text-sm text-[#374151]">
              {t("fields.descriptionLeft")}
              <textarea
                rows={3}
                value={form.descriptionLeft[lang]}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    descriptionLeft: { ...current.descriptionLeft, [lang]: e.target.value },
                  }))
                }
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
              />
            </label>

            <label className="mb-3 block text-sm text-[#374151]">
              {t("fields.descriptionRight")}
              <textarea
                rows={3}
                value={form.descriptionRight[lang]}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    descriptionRight: { ...current.descriptionRight, [lang]: e.target.value },
                  }))
                }
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
              />
            </label>

            <label className="mb-3 block text-sm text-[#374151]">
              {t("fields.secondTitle")}
              <input
                value={form.secondTitle[lang]}
                onChange={(e) =>
                  setForm((current) => ({ ...current, secondTitle: { ...current.secondTitle, [lang]: e.target.value } }))
                }
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
              />
            </label>

            <label className="block text-sm text-[#374151]">
              {t("fields.secondDescription")}
              <textarea
                rows={3}
                value={form.secondDescription[lang]}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    secondDescription: { ...current.secondDescription, [lang]: e.target.value },
                  }))
                }
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
              />
            </label>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-[#374151]">
          {t("fields.image")}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPrimaryImage(e.target.files?.[0] ?? null)}
            className="mt-1 block text-sm"
          />
        </label>

        <label className="text-sm text-[#374151]">
          {t("fields.secondImage")}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSecondaryImage(e.target.files?.[0] ?? null)}
            className="mt-1 block text-sm"
          />
        </label>
      </div>

      {hasCurrentImages && (
        <div className="grid gap-3 sm:grid-cols-2">
          {content?.image && (
            <div className="rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-3">
              <p className="mb-2 text-sm font-semibold text-[#111827]">{t("currentImage")}</p>
              <Image src={content.image} alt="" width={140} height={96} className="h-24 w-full rounded-lg object-cover" unoptimized={content.image.startsWith("http")} />
            </div>
          )}
          {content?.secondImage && (
            <div className="rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-3">
              <p className="mb-2 text-sm font-semibold text-[#111827]">{t("currentSecondaryImage")}</p>
              <Image src={content.secondImage} alt="" width={140} height={96} className="h-24 w-full rounded-lg object-cover" unoptimized={content.secondImage.startsWith("http")} />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <PrimaryButton type="submit" disabled={pending} className="h-9 rounded-lg px-4 text-sm">
          {pending ? t("saving") : t("save")}
        </PrimaryButton>
      </div>
    </form>
  )
}
