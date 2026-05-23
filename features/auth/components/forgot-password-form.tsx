"use client"

import { useState } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { useAuth } from "@/hooks/use-auth"
import { AuthFieldGroup } from "./auth-field-group"

type Step = 1 | 2 | 3

type Props = {
  emailPlaceholder: string
  codePlaceholder: string
  passwordPlaceholder: string
  confirmPlaceholder: string
  step1Label: string
  step2Label: string
  step3Label: string
}

export function ForgotPasswordForm({
  emailPlaceholder,
  codePlaceholder,
  passwordPlaceholder,
  confirmPlaceholder,
  step1Label,
  step2Label,
  step3Label,
}: Props) {
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState("")
  const [resetToken, setResetToken] = useState("")
  const { forgotPassword, verifyResetCode, resetPassword, loading, error } = useAuth()

  const emailForm = useForm<{ email: string }>()
  const codeForm = useForm<{ code: string }>()
  const passwordForm = useForm<{ password: string; password_confirmation: string }>()

  async function onEmailSubmit(values: { email: string }) {
    await forgotPassword(values.email)
    setEmail(values.email)
    setStep(2)
  }

  async function onCodeSubmit(values: { code: string }) {
    const token = await verifyResetCode(email, values.code)
    setResetToken(token)
    setStep(3)
  }

  async function onPasswordSubmit(values: { password: string; password_confirmation: string }) {
    if (values.password !== values.password_confirmation) return
    await resetPassword(resetToken, values.password, values.password_confirmation)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 text-sm text-white/70">
        <span className={step >= 1 ? "text-[#40A0CA] font-semibold" : ""}>1</span>
        <span>→</span>
        <span className={step >= 2 ? "text-[#40A0CA] font-semibold" : ""}>2</span>
        <span>→</span>
        <span className={step >= 3 ? "text-[#40A0CA] font-semibold" : ""}>3</span>
      </div>

      {step === 1 && (
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="flex flex-col gap-4">
          <AuthFieldGroup>
            <label className="flex h-[52px] items-center gap-2 border-b border-white py-4">
              <Image src="/auth/email.svg" alt="" width={20} height={20} aria-hidden />
              <input
                {...emailForm.register("email", { required: true })}
                type="email"
                placeholder={emailPlaceholder}
                className="w-full bg-transparent text-base text-white placeholder:text-white focus:outline-none"
              />
            </label>
          </AuthFieldGroup>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#40A0CA] py-3 font-medium text-white disabled:opacity-60"
          >
            {loading ? "..." : step1Label}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="flex flex-col gap-4">
          <AuthFieldGroup>
            <label className="flex h-[52px] items-center gap-2 border-b border-white py-4">
              <Image src="/auth/password.svg" alt="" width={20} height={20} aria-hidden />
              <input
                {...codeForm.register("code", { required: true, minLength: 4, maxLength: 6 })}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder={codePlaceholder}
                className="w-full bg-transparent text-center text-2xl tracking-[0.5em] text-white placeholder:text-white/60 focus:outline-none"
              />
            </label>
          </AuthFieldGroup>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#40A0CA] py-3 font-medium text-white disabled:opacity-60"
          >
            {loading ? "..." : step2Label}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
          <AuthFieldGroup>
            <label className="flex h-[52px] items-center gap-2 border-b border-white py-4">
              <Image src="/auth/password.svg" alt="" width={20} height={20} aria-hidden />
              <input
                {...passwordForm.register("password", { required: true, minLength: 6 })}
                type="password"
                placeholder={passwordPlaceholder}
                className="w-full bg-transparent text-base text-white placeholder:text-white focus:outline-none"
              />
            </label>
            <label className="flex h-[52px] items-center gap-2 border-b border-white py-4">
              <Image src="/auth/password.svg" alt="" width={20} height={20} aria-hidden />
              <input
                {...passwordForm.register("password_confirmation", { required: true, minLength: 6 })}
                type="password"
                placeholder={confirmPlaceholder}
                className="w-full bg-transparent text-base text-white placeholder:text-white focus:outline-none"
              />
            </label>
          </AuthFieldGroup>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#40A0CA] py-3 font-medium text-white disabled:opacity-60"
          >
            {loading ? "..." : step3Label}
          </button>
        </form>
      )}
    </div>
  )
}
