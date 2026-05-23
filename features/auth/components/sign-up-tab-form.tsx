"use client"

import { useState } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { useAuth } from "@/hooks/use-auth"
import { AuthFieldGroup } from "./auth-field-group"
import { AuthTelInput } from "./auth-tel-input"
import { useLocale } from "next-intl"
import { cn } from "@/lib/utils"

type FormValues = {
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  company_name?: string
  accept_terms: boolean
}

type Props = {
  userTabLabel: string
  companyTabLabel: string
  tabListLabel: string
  fullNamePlaceholder: string
  emailPlaceholder: string
  passwordPlaceholder: string
  phonePlaceholder?: string
  confirmPasswordPlaceholder?: string
  companyNamePlaceholder?: string
  termsLabel?: string
  showPasswordLabel: string
  hidePasswordLabel: string
  submitLabel: string
}

export function SignUpTabForm({
  userTabLabel,
  companyTabLabel,
  tabListLabel,
  fullNamePlaceholder,
  emailPlaceholder,
  passwordPlaceholder,
  phonePlaceholder = "Phone",
  confirmPasswordPlaceholder = "Confirm password",
  companyNamePlaceholder = "Company name",
  termsLabel = "I accept the terms and privacy policy",
  showPasswordLabel,
  hidePasswordLabel,
  submitLabel,
}: Props) {
  const [activeTab, setActiveTab] = useState<"user" | "company">("user")
  const [showPassword, setShowPassword] = useState(false)
  const { signUp, loading, error } = useAuth()
  const locale = useLocale()
  const isRTL = locale === "ar"

  const { register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: { accept_terms: true },
  })

  const acceptTerms = watch("accept_terms")

  const baseTabClassName =
    "inline-flex h-[48px] min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 sm:h-[52px] sm:flex-none sm:w-[min(227px,48%)] sm:px-4 sm:text-base"
  const activeTabClassName =
    "border-[#9fc9e6] bg-gradient-to-b from-[#006ea8] to-[#005685] text-white shadow-[0_8px_24px_rgba(0,110,168,0.35)]"
  const inactiveTabClassName =
    "border-[#6b87a2] bg-[#02223b]/65 text-[#d9eef9] hover:bg-[#033a62]/70"

  async function onSubmit(values: FormValues) {
    if (values.password !== values.password_confirmation) return
    if (!values.accept_terms) return

    const displayName =
      activeTab === "company" && values.company_name
        ? values.company_name
        : values.name

    await signUp({
      name: displayName,
      email: values.email,
      phone: values.phone,
      password: values.password,
      password_confirmation: values.password_confirmation,
      type: activeTab,
      company_name: activeTab === "company" ? values.company_name : undefined,
      country_id: 1,
      accept_terms_and_privacy: values.accept_terms,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
      <div role="tablist" aria-label={tabListLabel} className="flex w-full gap-3 sm:gap-4">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "user"}
          onClick={() => setActiveTab("user")}
          className={`${baseTabClassName} ${activeTab === "user" ? activeTabClassName : inactiveTabClassName}`}
        >
          <Image src="/auth/user.svg" alt="" width={24} height={24} className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
          <span>{userTabLabel}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "company"}
          onClick={() => setActiveTab("company")}
          className={`${baseTabClassName} ${activeTab === "company" ? activeTabClassName : inactiveTabClassName}`}
        >
          <Image src="/auth/company.svg" alt="" width={24} height={24} className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
          <span>{companyTabLabel}</span>
        </button>
      </div>

      <p className="text-center text-xs text-[#9fc9e6] sm:text-sm">
        {activeTab === "user" ? userTabLabel : companyTabLabel}
      </p>

      <AuthFieldGroup>
        {activeTab === "company" && (
          <label className="flex h-[52px] items-center gap-2 border-b border-white py-4">
            <Image src="/auth/company.svg" alt="" width={20} height={20} aria-hidden />
            <input
              {...register("company_name", { required: activeTab === "company" })}
              placeholder={companyNamePlaceholder}
              className="w-full bg-transparent text-base text-white placeholder:text-white focus:outline-none"
            />
          </label>
        )}
        <label className="flex h-[52px] items-center gap-2 border-b border-white py-4">
          <Image src="/auth/user.svg" alt="" width={20} height={20} aria-hidden />
          <input
            {...register("name", { required: true })}
            placeholder={fullNamePlaceholder}
            className="w-full bg-transparent text-base text-white placeholder:text-white focus:outline-none"
          />
        </label>
        <label className="flex h-[52px] items-center gap-2 border-b border-white py-4">
          <Image src="/auth/email.svg" alt="" width={20} height={20} aria-hidden />
          <input
            {...register("email", { required: true })}
            type="email"
            placeholder={emailPlaceholder}
            className="w-full bg-transparent text-base text-white placeholder:text-white focus:outline-none"
          />
        </label>
        <AuthTelInput
          {...register("phone", { required: true })}
          placeholder={phonePlaceholder}
        />
        <label className="flex h-[52px] items-center justify-between gap-2 border-b border-white py-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Image src="/auth/password.svg" alt="" width={20} height={20} aria-hidden />
            <input
              {...register("password", { required: true, minLength: 6 })}
              type={showPassword ? "text" : "password"}
              placeholder={passwordPlaceholder}
              className="w-full bg-transparent text-base text-white placeholder:text-white focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="shrink-0 cursor-pointer"
            onClick={() => setShowPassword((p) => !p)}
            aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
          >
            <Image src="/auth/eye.svg" alt="" width={20} height={20} aria-hidden />
          </button>
        </label>
        <label className="flex h-[52px] items-center gap-2 border-b border-white py-4">
          <Image src="/auth/password.svg" alt="" width={20} height={20} aria-hidden />
          <input
            {...register("password_confirmation", { required: true, minLength: 6 })}
            type={showPassword ? "text" : "password"}
            placeholder={confirmPasswordPlaceholder}
            className="w-full bg-transparent text-base text-white placeholder:text-white focus:outline-none"
          />
        </label>
      </AuthFieldGroup>

      <label className="flex items-start gap-2 text-sm text-white/90">
        <input
          type="checkbox"
          {...register("accept_terms", { required: true })}
          className="mt-1 h-4 w-4 shrink-0 accent-[#40A0CA]"
        />
        <span>{termsLabel}</span>
      </label>

      {error && (
        <div className="rounded-lg border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !acceptTerms}
        className="w-full rounded-md bg-[#40A0CA] py-3 font-medium text-white disabled:opacity-60"
      >
        {loading ? "..." : submitLabel}
      </button>
    </form>
  )
}
