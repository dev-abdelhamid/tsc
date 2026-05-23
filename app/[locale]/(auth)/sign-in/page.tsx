"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useAuth } from "@/hooks/use-auth"
import { useTranslations } from "next-intl"
import { AuthCardWrapper } from "@/features/auth/components/auth-card-wrapper"
import { AuthFieldGroup } from "@/features/auth/components/auth-field-group"
import { AuthUserCompanyTabs } from "@/features/auth/components/auth-user-company-tabs"
import Image from "next/image"
import { Link } from "@/i18n/navigation"

type FormValues = {
  email: string
  password: string
}

export default function SignInPage() {
  const t = useTranslations("Auth.signIn")
  const { signIn, loading, error: authError } = useAuth()
  const { register, handleSubmit } = useForm<FormValues>()
  const [error, setError] = useState<string | null>(null)
  const [accountType, setAccountType] = useState<"user" | "company">("user")

  async function onSubmit(values: FormValues) {
    setError(null)
    try {
      await signIn(values.email, values.password, accountType)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "فشل تسجيل الدخول"
      setError(message)
    }
  }

  return (
    <AuthCardWrapper
      backHref="/"
      backLabel={t("back")}
      logoAlt={t("logoAlt")}
      title={t("title")}
      description={t("description")}
      footerPrefix={t("noAccount")}
      footerActionLabel={t("signUp")}
      footerActionHref="/sign-up"
      topSlot={
        <AuthUserCompanyTabs
          userLabel={t("userTab")}
          companyLabel={t("companyTab")}
          tabListLabel={t("accountTypeTabs")}
          activeTab={accountType}
          onTabChange={setAccountType}
        />
      }
      asideSlot={
        <Link href="/forgot-password" className="text-sm text-white/80 hover:text-white">
          {t("forgotPassword")}
        </Link>
      }
    >
      <AuthFieldGroup>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <label className="flex h-[52px] items-center justify-between gap-2 border-b border-white py-4">
            <div className="flex min-w-0 items-center gap-2">
              <Image src="/auth/email.svg" alt="" width={20} height={20} aria-hidden />
              <input
                {...register("email", { required: true })}
                type="email"
                placeholder={t("fields.emailPlaceholder")}
                className="w-full bg-transparent text-base leading-6 text-white placeholder:text-white focus:outline-none"
              />
            </div>
          </label>

          <label className="flex h-[52px] items-center justify-between gap-2 border-b border-white py-4">
            <div className="flex min-w-0 items-center gap-2">
              <Image src="/auth/password.svg" alt="" width={20} height={20} aria-hidden />
              <input
                {...register("password", { required: true })}
                type="password"
                placeholder={t("fields.passwordPlaceholder")}
                className="w-full bg-transparent text-base leading-6 text-white placeholder:text-white focus:outline-none"
              />
            </div>
            <button type="button" className="cursor-pointer">
              <Image src="/auth/eye.svg" alt="" width={20} height={20} aria-hidden />
            </button>
          </label>

          <button
            type="submit"
            className="w-full rounded-md bg-[#40A0CA] py-3 text-white font-medium"
            disabled={loading}
          >
            {loading ? t("loading") : t("submit")}
          </button>

          {(error || authError) && (
            <div className="mt-3 text-sm text-red-400">{error || authError}</div>
          )}
        </form>
      </AuthFieldGroup>
    </AuthCardWrapper>
  )
}
