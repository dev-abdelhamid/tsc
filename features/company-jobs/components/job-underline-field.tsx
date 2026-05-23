"use client"

import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { NewsCalendarIcon } from "@/features/news/components/news-icons"

type FieldProps = {
  label: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

export function JobFieldGroup({ label, required, className, children }: FieldProps) {
  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      <div className="flex items-center gap-0.5 text-start">
        <span className="text-base font-medium leading-[150%] text-[#262626]">
          {label}
        </span>
        {required ? (
          <span className="text-base font-medium leading-[150%] text-[#FF2D55]">
            *
          </span>
        ) : null}
      </div>
      {children}
    </div>
  )
}

const underlineClass =
  "flex w-full items-center gap-2 border-b border-[#D4D4D4] py-2 text-sm text-[#525252] outline-none transition-colors focus:border-[#40A0CA]"

export function JobUnderlineInput({
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  min?: string | number
  max?: string | number
  className?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      className={cn(underlineClass, "bg-transparent placeholder:text-[#A3A3A3]", className)}
    />
  )
}

export function JobUnderlineSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  className,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={cn("relative w-full", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...(disabled ? { disabled: true } : {})}
        className={cn(
          underlineClass,
          "cursor-pointer appearance-none pe-8 disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-[#A3A3A3]"
        )}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute end-0 top-1/2 h-5 w-5 -translate-y-1/2 text-[#40A0CA] opacity-80"
        aria-hidden
      />
    </div>
  )
}

export function JobUnderlineDate({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  return (
    <div className={cn("relative w-full", className)}>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          underlineClass,
          "bg-transparent pe-10 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-0"
        )}
      />
      <NewsCalendarIcon className="pointer-events-none absolute end-0 top-1/2 h-5 w-5 -translate-y-1/2 text-[#006EA8]" />
    </div>
  )
}

export function JobUnderlineTextarea({
  value,
  onChange,
  placeholder,
  rows = 2,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  className?: string
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        underlineClass,
        "min-h-[36px] resize-y bg-transparent placeholder:text-[#A3A3A3]",
        className
      )}
    />
  )
}
