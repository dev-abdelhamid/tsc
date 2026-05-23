"use client"

import Image from "next/image"
import { useLocale } from "next-intl"
import { cn } from "@/lib/utils"

type AuthTelInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  iconSrc?: string
}

/** Phone field: digits LTR, aligned to the end in Arabic UI */
export function AuthTelInput({ className, iconSrc = "/auth/email.svg", ...props }: AuthTelInputProps) {
  const locale = useLocale()
  const isRTL = locale === "ar"

  return (
    <label className="flex h-[52px] items-center gap-2 border-b border-white py-4">
      <Image src={iconSrc} alt="" width={20} height={20} className="shrink-0 opacity-100" aria-hidden />
      <input
        type="tel"
        dir="ltr"
        inputMode="tel"
        autoComplete="tel"
        className={cn(
          "w-full min-w-0 bg-transparent text-base leading-6 text-white placeholder:text-white/80 focus:outline-none",
          isRTL ? "text-end" : "text-start",
          className
        )}
        style={{ unicodeBidi: "plaintext" }}
        {...props}
      />
    </label>
  )
}
