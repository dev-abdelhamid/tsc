"use client"

import { useEffect, useMemo, useState, useSyncExternalStore, useTransition } from "react"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/i18n/navigation"
import { X } from "lucide-react"
import type { Category } from "@/lib/api/types"
import type { CreateJobPayload } from "@/lib/api/services/company.service"
import { toLocalizedText } from "@/features/company-jobs/lib/build-job-form-data"
import { GERMAN_STATES, JOB_GENDERS } from "@/features/company-jobs/lib/constants"
import { buildJobFormData } from "@/features/company-jobs/lib/build-job-form-data"
import { CreateJobStepper } from "@/features/company-jobs/components/create-job-stepper"
import { JobImageUpload } from "@/features/company-jobs/components/job-image-upload"
import {
  JobFieldGroup,
  JobUnderlineInput,
  JobUnderlineSelect,
  JobUnderlineDate,
  JobUnderlineTextarea,
} from "@/features/company-jobs/components/job-underline-field"
import { PrimaryButton } from "@/components/ui/primary-button"
import { cn } from "@/lib/utils"

type FormState = {
  title: string
  category_id: string
  sub_category_id: string
  state: string
  vacancy: string
  gender: string
  application_deadline: string
  salary_from: string
  salary_to: string
  age_from: string
  age_to: string
  description: string
  responsibilities: string
  requirements: string
}

const initialForm: FormState = {
  title: "",
  category_id: "",
  sub_category_id: "",
  state: "",
  vacancy: "",
  gender: "",
  application_deadline: "",
  salary_from: "",
  salary_to: "",
  age_from: "",
  age_to: "",
  description: "",
  responsibilities: "",
  requirements: "",
}

function GradientOutlineButton({
  children,
  onClick,
  type = "button",
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  type?: "button"
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 min-w-[120px] items-center justify-center rounded-lg border border-[#E8F2FF] bg-white px-4 text-base font-normal shadow-none transition hover:bg-[#F5F9FC]",
        className
      )}
    >
      <span className="bg-gradient-to-b from-[#006EA8] to-[#005685] bg-clip-text text-transparent">
        {children}
      </span>
    </button>
  )
}

export function CreateJobWizard({
  categories,
  locale,
}: {
  categories: Category[]
  locale: string
}) {
  const t = useTranslations("CompanyJobs")
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(initialForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [remoteCategories, setRemoteCategories] = useState<Category[]>([])

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const isRtl = locale === "ar"

  const allCategories = remoteCategories.length > 0 ? remoteCategories : categories

  useEffect(() => {
    if (categories.length > 0) return

    let cancelled = false
    fetch(`/api/categories?locale=${encodeURIComponent(locale)}`)
      .then((res) => res.json())
      .then((payload: { data?: Category[] }) => {
        if (cancelled || !Array.isArray(payload.data) || payload.data.length === 0) return
        setRemoteCategories(payload.data)
      })
      .catch((err) => {
        console.warn(err)
        // keep empty state + server message
      })

    return () => {
      cancelled = true
    }
  }, [categories.length, locale])

  const selectedCategory = useMemo(
    () => allCategories.find((c) => String(c.id) === form.category_id),
    [allCategories, form.category_id]
  )

  const subCategories = selectedCategory?.sub_categories ?? []

  const categoryOptions = allCategories
    .filter((c) => c.name?.trim())
    .map((c) => ({
      value: String(c.id),
      label: c.name,
    }))

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  const setImage = (file: File | null, preview: string | null) => {
    if (imagePreview && imagePreview !== preview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(file)
    setImagePreview(preview)
    setError(null)
  }

  const genderOptions = JOB_GENDERS.map((g) => ({
    value: g,
    label: t(`gender.${g}`),
  }))

  const stateOptions = GERMAN_STATES.map((s) => ({ value: s, label: s }))

  const validateStep = (s: number): boolean => {
    if (s === 1) {
      if (!form.title.trim()) {
        setError(t("errors.title"))
        return false
      }
      if (!form.category_id) {
        setError(t("errors.category"))
        return false
      }
      if (!form.sub_category_id && subCategories.length > 0) {
        setError(t("errors.subCategory"))
        return false
      }
      if (!form.state) {
        setError(t("errors.state"))
        return false
      }
      if (!form.vacancy || Number(form.vacancy) < 1) {
        setError(t("errors.vacancy"))
        return false
      }
      if (!imageFile) {
        setError(t("errors.image"))
        return false
      }
    }
    if (s === 2) {
      if (!form.gender) {
        setError(t("errors.gender"))
        return false
      }
      if (!form.application_deadline) {
        setError(t("errors.deadline"))
        return false
      }
      if (!form.salary_from || !form.salary_to) {
        setError(t("errors.salary"))
        return false
      }
      if (Number(form.salary_from) > Number(form.salary_to)) {
        setError(t("errors.salaryRange"))
        return false
      }
      if (!form.age_from || !form.age_to) {
        setError(t("errors.age"))
        return false
      }
      if (Number(form.age_from) > Number(form.age_to)) {
        setError(t("errors.ageRange"))
        return false
      }
    }
    if (s === 3) {
      if (!form.description.trim()) {
        setError(t("errors.description"))
        return false
      }
      if (!form.responsibilities.trim()) {
        setError(t("errors.responsibilities"))
        return false
      }
      if (!form.requirements.trim()) {
        setError(t("errors.requirements"))
        return false
      }
    }
    setError(null)
    return true
  }

  const buildPayload = (): CreateJobPayload => ({
    title: toLocalizedText(form.title),
    category_id: Number(form.category_id),
    sub_category_id: Number(form.sub_category_id || form.category_id),
    state: form.state,
    vacancy: Number(form.vacancy),
    gender: form.gender as CreateJobPayload["gender"],
    application_deadline: form.application_deadline,
    salary_from: Number(form.salary_from),
    salary_to: Number(form.salary_to),
    age_from: Number(form.age_from),
    age_to: Number(form.age_to),
    description: toLocalizedText(form.description),
    responsibilities: toLocalizedText(form.responsibilities),
    requirements: toLocalizedText(form.requirements),
    image: imageFile!,
  })

  const handleNext = () => {
    if (!validateStep(step)) return
    if (step < 3) setStep(step + 1)
  }

  const handleSubmit = () => {
    if (!validateStep(3) || !imageFile) {
      if (!imageFile) setError(t("errors.image"))
      return
    }
    startTransition(async () => {
      try {
        const formData = buildJobFormData(buildPayload())
        const res = await fetch("/api/company/jobs", {
          method: "POST",
          body: formData,
          headers: {
            "x-locale": locale,
            "Accept-Language": locale,
          },
        })
        const result = (await res.json()) as { ok: boolean; message?: string }
        if (!res.ok || !result.ok) {
          setError(result.message ?? t("loadError"))
          return
        }
        router.push("/dashboard/company/jobs")
      } catch (err) {
        console.error(err)
        setError(t("loadError"))
      }
    })
  }

  const stepLabels: [string, string, string] = [
    t("steps.basic"),
    t("steps.info"),
    t("steps.description"),
  ]

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={cn(
        "relative flex w-full max-w-[920px] flex-col items-stretch gap-6 rounded-lg bg-white p-6 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:gap-8 sm:p-8",
        pending && "pointer-events-none opacity-80"
      )}
    >
      <div className="w-full flex flex-col items-center gap-4">
        <h1 className={cn(
          "w-full text-center bg-clip-text text-[28px] font-bold leading-[1.05] text-transparent sm:text-[36px]",
          isRtl ? "bg-gradient-to-r" : "bg-gradient-to-l",
          "from-[#032C44] to-[#41A0CA]"
        )} style={{ marginTop: 4 }}>
          {t("title")}
        </h1>
        <div className="absolute top-3 end-3">
          <Link
            locale={locale}
            href="/dashboard/company/jobs"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#006EA8] transition-opacity hover:opacity-70 bg-white shadow-sm"
            aria-label={t("cancel")}
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      <CreateJobStepper currentStep={step} labels={stepLabels} />

      <div className="flex w-full flex-col gap-6">
        {step === 1 && (
          <>
            <JobFieldGroup label={t("fields.title")} required>
              <JobUnderlineInput
                value={form.title}
                onChange={(v) => set("title", v)}
                placeholder={t("placeholders.title")}
              />
            </JobFieldGroup>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <JobFieldGroup label={t("fields.category")} required>
                <JobUnderlineSelect
                  value={form.category_id}
                  onChange={(v) => {
                    set("category_id", v)
                    set("sub_category_id", "")
                  }}
                  placeholder={t("placeholders.select")}
                  options={categoryOptions}
                  disabled={!isMounted || categoryOptions.length === 0}
                />
              </JobFieldGroup>

              <JobFieldGroup label={t("fields.subCategory")} required>
                <JobUnderlineSelect
                  value={form.sub_category_id}
                  onChange={(v) => set("sub_category_id", v)}
                  placeholder={t("placeholders.select")}
                  disabled={!isMounted || !form.category_id || pending}
                  options={
                    subCategories.length > 0
                      ? subCategories.map((s) => ({
                          value: String(s.id),
                          label: s.name,
                        }))
                      : form.category_id
                        ? [{ value: form.category_id, label: t("fields.sameAsCategory") }]
                        : []
                  }
                />
              </JobFieldGroup>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <JobFieldGroup label={t("fields.state")} required>
                <JobUnderlineSelect
                  value={form.state}
                  onChange={(v) => set("state", v)}
                  placeholder={t("placeholders.select")}
                  options={stateOptions}
                />
              </JobFieldGroup>

              <JobFieldGroup label={t("fields.vacancy")} required>
                <JobUnderlineInput
                  type="number"
                  min={1}
                  value={form.vacancy}
                  onChange={(v) => set("vacancy", v)}
                  placeholder="20"
                />
              </JobFieldGroup>
            </div>

            <div className="w-full">
              <JobImageUpload
                file={imageFile}
                previewUrl={imagePreview}
                onChange={setImage}
                label={t("fields.image")}
                hint={t("placeholders.image")}
                removeLabel={t("removeImage")}
                compressingLabel={t("compressing")}
                sizeHintLabel={t("imageSizeHint")}
                tooLargeLabel={t("errors.imageSize")}
                compressFailedLabel={t("errors.imageCompress")}
                className="flex-col"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <JobFieldGroup label={t("fields.gender")} required>
                <JobUnderlineSelect
                  value={form.gender}
                  onChange={(v) => set("gender", v)}
                  placeholder={t("placeholders.select")}
                  options={genderOptions}
                />
              </JobFieldGroup>

              <JobFieldGroup label={t("fields.deadline")} required>
                <JobUnderlineDate
                  value={form.application_deadline}
                  onChange={(v) => set("application_deadline", v)}
                />
              </JobFieldGroup>
            </div>

            <JobFieldGroup label={t("fields.salary")} required>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <JobUnderlineInput
                  type="number"
                  min={0}
                  value={form.salary_from}
                  onChange={(v) => set("salary_from", v)}
                  placeholder={t("placeholders.salaryFrom")}
                />
                <JobUnderlineInput
                  type="number"
                  min={0}
                  value={form.salary_to}
                  onChange={(v) => set("salary_to", v)}
                  placeholder={t("placeholders.salaryTo")}
                />
              </div>
            </JobFieldGroup>

            <JobFieldGroup label={t("fields.age")} required>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <JobUnderlineInput
                  type="number"
                  min={18}
                  value={form.age_from}
                  onChange={(v) => set("age_from", v)}
                  placeholder={t("placeholders.ageFrom")}
                />
                <JobUnderlineInput
                  type="number"
                  min={18}
                  value={form.age_to}
                  onChange={(v) => set("age_to", v)}
                  placeholder={t("placeholders.ageTo")}
                />
              </div>
            </JobFieldGroup>
          </>
        )}

        {step === 3 && (
          <>
            <JobFieldGroup label={t("fields.description")} required>
              <JobUnderlineTextarea
                value={form.description}
                onChange={(v) => set("description", v)}
                rows={4}
              />
            </JobFieldGroup>
            <JobFieldGroup label={t("fields.responsibilities")} required>
              <JobUnderlineTextarea
                value={form.responsibilities}
                onChange={(v) => set("responsibilities", v)}
                rows={4}
              />
            </JobFieldGroup>
            <JobFieldGroup label={t("fields.requirements")} required>
              <JobUnderlineTextarea
                value={form.requirements}
                onChange={(v) => set("requirements", v)}
                rows={4}
              />
            </JobFieldGroup>
          </>
        )}

        {categoryOptions.length === 0 ? (
          <p className="text-center text-sm text-[#FF2D55]" role="status">
            {t("errors.categoriesUnavailable")}
          </p>
        ) : null}

        {error ? (
          <p className="text-center text-sm leading-relaxed text-[#FF2D55]" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex w-full max-w-[256px] flex-wrap items-center justify-center gap-4 sm:flex-nowrap">
        {step === 1 ? (
          <GradientOutlineButton onClick={() => router.push("/dashboard/company/jobs") }>
            {t("cancel")}
          </GradientOutlineButton>
        ) : (
          <GradientOutlineButton onClick={() => setStep(step - 1)}>{t("back")}</GradientOutlineButton>
        )}

        {step < 3 ? (
          <PrimaryButton
            type="button"
            onClick={handleNext}
            disabled={pending || categoryOptions.length === 0}
            className="h-9 min-w-[120px] w-auto rounded-lg px-4 text-base font-normal"
          >
            {t("next")}
          </PrimaryButton>
        ) : (
          <PrimaryButton
            type="button"
            onClick={handleSubmit}
            disabled={pending || categoryOptions.length === 0}
            className="h-9 min-w-[120px] w-auto rounded-lg px-4 text-base font-normal"
          >
            {pending ? t("submitting") : t("submit")}
          </PrimaryButton>
        )}
      </div>
    </div>
  )
}
