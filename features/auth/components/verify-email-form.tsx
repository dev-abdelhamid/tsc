"use client"

import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { useAuth } from "@/hooks/use-auth"
import { AuthFieldGroup } from "./auth-field-group"

type Props = {
  codePlaceholder: string
  submitLabel: string
  resendLabel: string
}

export function VerifyEmailForm({ codePlaceholder, submitLabel, resendLabel }: Props) {
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get("email") || ""
  const { verifyEmail, resendVerification, loading, error } = useAuth()
  const { register, handleSubmit, watch } = useForm<{ email: string; code: string }>({
    defaultValues: { email: emailFromQuery },
  })

  const email = watch("email")

  async function onSubmit(values: { email: string; code: string }) {
    await verifyEmail(values.email, values.code)
  }

  async function onResend() {
    if (!email) return
    await resendVerification(email)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <AuthFieldGroup>
        <label className="flex h-[52px] items-center gap-2 border-b border-white py-4">
          <Image src="/auth/email.svg" alt="" width={20} height={20} aria-hidden />
          <input
            {...register("email", { required: true })}
            type="email"
            readOnly={!!emailFromQuery}
            className="w-full bg-transparent text-base text-white placeholder:text-white focus:outline-none"
          />
        </label>
        <label className="flex h-[52px] items-center gap-2 border-b border-white py-4">
          <Image src="/auth/password.svg" alt="" width={20} height={20} aria-hidden />
          <input
            {...register("code", { required: true, minLength: 4 })}
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
        {loading ? "..." : submitLabel}
      </button>

      <button
        type="button"
        onClick={onResend}
        disabled={loading || !email}
        className="text-sm text-white/80 underline hover:text-white disabled:opacity-50"
      >
        {resendLabel}
      </button>
    </form>
  )
}
