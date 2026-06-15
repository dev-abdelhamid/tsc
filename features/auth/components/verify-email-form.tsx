"use client"

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { useLocale } from "next-intl"

type Props = {
  codePlaceholder: string
  submitLabel: string
  resendLabel: string
}

const RESEND_COOLDOWN = 60 // seconds

export function VerifyEmailForm({ codePlaceholder, submitLabel, resendLabel }: Props) {
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get("email") || ""
  const { verifyEmail, resendVerification, loading, error } = useAuth()
  const locale = useLocale()
  const isRTL = locale === "ar"

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [email, setEmail] = useState(emailFromQuery)
  const [success, setSuccess] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Start cooldown countdown
  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN)
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    // Auto-focus first digit input
    inputRefs.current[0]?.focus()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Ensure email state picks up query param when it becomes available
  useEffect(() => {
    if (emailFromQuery && !email) setEmail(emailFromQuery)
  }, [emailFromQuery, email])

  const handleChange = (index: number, value: string) => {
    // Only accept single digit
    const digit = value.replace(/\D/g, "").slice(-1)
    const newDigits = [...digits]
    newDigits[index] = digit
    setDigits(newDigits)
    // Move to next
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits]
        newDigits[index] = ""
        setDigits(newDigits)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        const newDigits = [...digits]
        newDigits[index - 1] = ""
        setDigits(newDigits)
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!text) return
    const newDigits = [...digits]
    for (let i = 0; i < 6; i++) {
      newDigits[i] = text[i] || ""
    }
    setDigits(newDigits)
    // Focus last filled or next empty
    const lastIndex = Math.min(text.length, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  const code = digits.join("")
  const isComplete = code.length === 6

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isComplete || !email) return
    try {
      await verifyEmail(email, code)
      setSuccess(true)
    } catch {
      // error is set by hook
    }
  }

  async function onResend() {
    if (!email || cooldown > 0 || loading) return
    try {
      await resendVerification(email)
      setResendSuccess(true)
      startCooldown()
      setTimeout(() => setResendSuccess(false), 4000)
    } catch {
      // error handled by hook
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      {/* Email display – editable if not pre-filled */}
      {!emailFromQuery && (
        <div className="space-y-1">
          <label className="auth-field block">
            <div className="auth-input-wrap">
              <Image src="/auth/email.svg" alt="" width={20} height={20} aria-hidden />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                className="auth-input w-full"
                required
              />
            </div>
          </label>
        </div>
      )}

      {/* OTP Boxes */}
      <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`${isRTL ? "الرقم" : "Digit"} ${index + 1}`}
            className={`
              h-12 w-10 sm:h-14 sm:w-12 rounded-xl border text-center text-xl font-bold text-white transition-all duration-200 outline-none
              bg-[#02223b]/80 backdrop-blur-sm
              ${digit
                ? "border-[#40A0CA] shadow-[0_0_12px_rgba(64,160,202,0.4)]"
                : "border-white/20 hover:border-white/40"
              }
              focus:border-[#40A0CA] focus:shadow-[0_0_16px_rgba(64,160,202,0.5)]
              caret-[#40A0CA]
            `}
          />
        ))}
      </div>

      {/* Success / Error messages */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-400/40 bg-green-950/40 px-3 py-2 text-sm text-green-300">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {isRTL ? "تم التحقق بنجاح! جاري التحويل..." : "Email verified! Redirecting..."}
        </div>
      )}

      {resendSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-400/40 bg-blue-950/40 px-3 py-2 text-sm text-blue-300">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {isRTL ? "تم إرسال كود جديد إلى بريدك الإلكتروني" : "A new code has been sent to your email"}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading || !isComplete || !email}
        className="w-full rounded-xl bg-gradient-to-b from-[#006ea8] to-[#005685] py-3 font-semibold text-white shadow-[0_8px_24px_rgba(0,110,168,0.35)] transition-all hover:from-[#0080c2] hover:to-[#006699] active:translate-y-px disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{isRTL ? "جاري التحقق..." : "Verifying..."}</span>
          </>
        ) : (
          submitLabel
        )}
      </button>

      {/* Resend */}
      <div className="text-center text-sm text-white/70">
        {isRTL ? "لم تستلم الكود؟" : "Didn't receive the code?"}{" "}
        {cooldown > 0 ? (
          <span className="text-[#9fc9e6]">
            {isRTL ? `أعد الإرسال بعد ${cooldown}ث` : `Resend in ${cooldown}s`}
          </span>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={loading}
            className="font-medium text-[#40A0CA] underline-offset-2 hover:underline disabled:opacity-50 transition-colors"
          >
            {resendLabel}
          </button>
        )}
      </div>
    </form>
  )
}
