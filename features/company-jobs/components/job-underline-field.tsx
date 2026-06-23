"use client"

import { useRef } from "react"
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
      <svg
        className="pointer-events-none absolute end-0 top-1/2 h-5 w-5 -translate-y-1/2"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path opacity="0.4" d="M12.9003 11.0247L9.74194 6.81641H5.06695C4.26695 6.81641 3.86695 7.78307 4.43361 8.34974L8.75028 12.6664C9.44195 13.3581 10.5669 13.3581 11.2586 12.6664L12.9003 11.0247Z" fill="#40A0CA" />
        <path d="M14.9329 6.81641H9.74121L12.8995 11.0247L15.5745 8.34974C16.1329 7.78307 15.7329 6.81641 14.9329 6.81641Z" fill="#40A0CA" />
      </svg>
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
  const inputRef = useRef<HTMLInputElement>(null)

  const handleContainerClick = () => {
    try {
      inputRef.current?.showPicker()
    } catch (err) {
      console.warn("showPicker failed:", err)
    }
  }

  // Format date display (yyyy-mm-dd -> mm/dd/yyyy)
  const displayValue = value
    ? (() => {
        const parts = value.split("-")
        return parts.length === 3 ? `${parts[1]}/${parts[2]}/${parts[0]}` : value
      })()
    : "mm / dd / yyyy"

  return (
    <div 
      className={cn("relative w-full cursor-pointer", className)}
      onClick={handleContainerClick}
    >
      <input
        ref={inputRef}
        aria-label="date"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()} // Prevent double trigger
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 z-10 [color-scheme:light]"
      />
      <div className={cn(underlineClass, "relative flex justify-between items-center bg-transparent w-full pointer-events-none")}>
        <span className={cn("text-sm", !value ? "text-[#A3A3A3]" : "text-[#525252]")}>
          {displayValue}
        </span>
        <NewsCalendarIcon className="h-5 w-5 text-[#006EA8] shrink-0" />
      </div>
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
