"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { useAuth } from "@/hooks/use-auth"
import { AuthFieldGroup } from "./auth-field-group"
import { useLocale, useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { COUNTRIES as STATIC_COUNTRIES } from "@/lib/countries"

type FormValues = {
  name: string
  email: string
  phone: string
  phone_code: string
  password: string
  password_confirmation: string
  company_name?: string
  accept_terms: boolean
  country_id: string
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
  initialCountries?: CountryOption[]
}

type CountryOption = {
  id: number
  name: string
  code: string
  flag?: string
  phone_code?: string
}

// Map country code to flag emoji
function countryCodeToFlag(code: string): string {
  if (!code || code.length < 2) return "🌐"
  const upper = code.toUpperCase().slice(0, 2)
  try {
    return upper.split("").map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join("")
  } catch {
    return "🌐"
  }
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
  termsLabel,
  showPasswordLabel,
  hidePasswordLabel,
  submitLabel,
  initialCountries = [],
}: Props) {
  const [activeTab, setActiveTab] = useState<"user" | "company">("user")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [countries, setCountries] = useState<CountryOption[]>(initialCountries)
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null)
  const [isWindows, setIsWindows] = useState(false)
  const { signUp, loading, error } = useAuth()
  const locale = useLocale()
  const t = useTranslations("Auth.signUp")
  const isRTL = locale === "ar"

  useEffect(() => {
    if (typeof window !== "undefined" && window.navigator?.userAgent?.includes("Windows")) {
      setIsWindows(true)
    }
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { accept_terms: true, phone_code: "+20", country_id: "1" },
  })

  // Fetch countries if initialCountries is empty
  useEffect(() => {
    if (countries.length > 0) return
    async function loadCountries() {
      try {
        const res = await fetch(`/api/countries?locale=${locale}`)
        const json = await res.json()
        if (json && Array.isArray(json.data)) {
          setCountries(json.data)
        }
      } catch (err) {
        console.error("Error loading countries:", err)
      }
    }
    loadCountries()
  }, [locale, countries.length])

  const acceptTerms = watch("accept_terms")
  const password = watch("password")
  const passwordConfirmation = watch("password_confirmation")
  const selectedCountryId = watch("country_id")
  const selectedDialCode = watch("phone_code") || "+20"

  // Update selected country object when country_id changes and sync phone dial code
  useEffect(() => {
    if (selectedCountryId && countries.length > 0) {
      const found = countries.find((c) => String(c.id) === String(selectedCountryId))
      setSelectedCountry(found || null)

      // Sync phone dial code
      if (found) {
        const sc = STATIC_COUNTRIES.find(s => s.code.toLowerCase() === found.code.toLowerCase())
        if (sc) {
          setValue("phone_code", sc.dialCode)
        }
      }
    }
  }, [selectedCountryId, countries, setValue])

  // Sync country selector when dial code changes
  const handleDialCodeChange = (newDialCode: string) => {
    setValue("phone_code", newDialCode)
    
    // Find matching country code from static countries
    const staticC = STATIC_COUNTRIES.find((c) => c.dialCode === newDialCode)
    if (staticC && countries.length > 0) {
      // Find matching country in API countries list
      const found = countries.find((c) => c.code.toLowerCase() === staticC.code.toLowerCase())
      if (found) {
        setValue("country_id", String(found.id))
      }
    }
  }

  const passwordsMatch = !passwordConfirmation || password === passwordConfirmation

  const baseTabClassName =
    "inline-flex h-[48px] min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 sm:h-[52px] sm:flex-none sm:w-[min(227px,48%)] sm:px-4 sm:text-base"
  const activeTabClassName =
    "border-[#9fc9e6] bg-gradient-to-b from-[#006ea8] to-[#005685] text-white shadow-[0_8px_24px_rgba(0,110,168,0.35)]"
  const inactiveTabClassName =
    "border-[#6b87a2] bg-[#02223b]/65 text-[#d9eef9] hover:bg-[#033a62]/70"

  async function onSubmit(values: FormValues) {
    if (!passwordsMatch) return
    if (!values.accept_terms) return

    const displayName =
      activeTab === "company" && values.company_name
        ? values.company_name
        : values.name
    // Combine phone with selected country dial code when available
    const fullPhone = `${values.phone_code}${values.phone}`

    try {
      await signUp({
        name: displayName,
        email: values.email,
        phone: fullPhone,
        password: values.password,
        password_confirmation: values.password_confirmation,
        type: activeTab,
        company_name: activeTab === "company" ? values.company_name : undefined,
        country_id: values.country_id ? Number(values.country_id) : 1,
        accept_terms_and_privacy: values.accept_terms,
      })
    } catch {
      // Error is displayed via the hook's error state
    }
  }

  // Resolve dial code from static countries first, fallback to API fields
  const staticCountry = selectedCountry?.code
    ? STATIC_COUNTRIES.find((c) => c.code.toLowerCase() === selectedCountry.code.toLowerCase())
    : null

  const phoneCode = staticCountry?.dialCode || selectedCountry?.phone_code || ""

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4" noValidate>
      {/* Tab switcher */}
      <div role="tablist" aria-label={tabListLabel} className="flex w-full gap-3 sm:gap-4">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "user" ? "true" : "false"}
          onClick={() => setActiveTab("user")}
          className={`${baseTabClassName} ${activeTab === "user" ? activeTabClassName : inactiveTabClassName}`}
        >
          <Image src="/auth/user.svg" alt="" width={24} height={24} className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
          <span>{userTabLabel}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "company" ? "true" : "false"}
          onClick={() => setActiveTab("company")}
          className={`${baseTabClassName} ${activeTab === "company" ? activeTabClassName : inactiveTabClassName}`}
        >
          <Image src="/auth/company.svg" alt="" width={24} height={24} className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
          <span>{companyTabLabel}</span>
        </button>
      </div>

      <AuthFieldGroup>
        {/* Company name (company tab only) */}
        {activeTab === "company" && (
          <div className="space-y-1">
            <label className="auth-field block">
              <div className="auth-input-wrap">
                <Image src="/auth/company.svg" alt="" width={20} height={20} aria-hidden />
                <input
                  {...register("company_name", { required: activeTab === "company" })}
                  placeholder={companyNamePlaceholder}
                  className="auth-input w-full"
                  autoComplete="organization"
                />
              </div>
            </label>
            {errors.company_name && (
              <span className="text-xs text-red-300">
                {isRTL ? "اسم الشركة مطلوب" : "Company name is required"}
              </span>
            )}
          </div>
        )}

        {/* Full name */}
        <div className="space-y-1">
          <label className="auth-field block">
            <div className="auth-input-wrap">
              <Image src="/auth/user.svg" alt="" width={20} height={20} aria-hidden />
              <input
                {...register("name", { required: true, minLength: 2 })}
                placeholder={fullNamePlaceholder}
                className="auth-input w-full"
                autoComplete="name"
              />
            </div>
          </label>
          {errors.name && (
            <span className="text-xs text-red-300">
              {isRTL ? "الاسم مطلوب (حرفان على الأقل)" : "Name is required (min 2 characters)"}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="auth-field block">
            <div className="auth-input-wrap">
              <Image src="/auth/email.svg" alt="" width={20} height={20} aria-hidden />
              <input
                {...register("email", {
                  required: true,
                  pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                })}
                type="email"
                placeholder={emailPlaceholder}
                className="auth-input w-full"
                autoComplete="email"
              />
            </div>
          </label>
          {errors.email && (
            <span className="text-xs text-red-300">
              {isRTL ? "البريد الإلكتروني غير صالح" : "Invalid email address"}
            </span>
          )}
        </div>

        {/* Country + Phone side by side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Country Selector */}
          <div className="space-y-1">
            <label className="auth-field block text-white">
              <div className="auth-input-wrap relative flex items-center justify-center cursor-pointer">
                <select
                  {...register("country_id", { required: true })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                >
                  <option value="" disabled hidden>
                    {isRTL ? "الدولة" : "Country"}
                  </option>
                  {countries.map((c) => {
                    const sc = STATIC_COUNTRIES.find((s) => s.code.toLowerCase() === c.code.toLowerCase())
                    const flagStr = sc?.flag || c.flag || countryCodeToFlag(c.code)
                    return (
                      <option key={c.id} value={c.id} className="bg-[#041d33] text-white">
                        {flagStr} {c.name}
                      </option>
                    )
                  })}
                </select>
                <span className="text-xl select-none" aria-hidden>
                  {selectedCountry
                    ? (STATIC_COUNTRIES.find((sc) => sc.code.toLowerCase() === selectedCountry.code.toLowerCase())?.flag || selectedCountry.flag || countryCodeToFlag(selectedCountry.code))
                    : "🌐"}
                </span>
                <Image 
                  src="/portfolio/arrow-down.svg" 
                  alt="arrow" 
                  width={16} 
                  height={16} 
                  className="h-4 w-4 ms-1 pointer-events-none brightness-0 invert" 
                />
              </div>
            </label>
            {errors.country_id && (
              <span className="text-xs text-red-300">
                {isRTL ? "اختر الدولة" : "Select country"}
              </span>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="auth-field block">
              <div className="auth-input-wrap">
                <div className="relative flex items-center shrink-0 pe-2 me-2 border-e border-white/10 h-6">
                  <select
                    {...register("phone_code")}
                    value={selectedDialCode}
                    onChange={(e) => handleDialCodeChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  >
                    {STATIC_COUNTRIES.map((c) => (
                      <option key={`dial-${c.id}`} value={c.dialCode} className="bg-[#041d33] text-white">
                        {c.flag} {c.dialCode} ({c.name})
                      </option>
                    ))}
                  </select>
                  <span className="text-base me-1">
                    {STATIC_COUNTRIES.find((c) => c.dialCode === selectedDialCode)?.flag || "🌐"}
                  </span>
                  <span className="text-sm text-white font-medium">{selectedDialCode}</span>
                  <Image 
                    src="/portfolio/arrow-down.svg" 
                    alt="arrow" 
                    width={16} 
                    height={16} 
                    className="h-4 w-4 ms-1 pointer-events-none brightness-0 invert" 
                  />
                </div>
                <input
                  {...register("phone", { required: true, minLength: 6 })}
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  placeholder={phonePlaceholder}
                  className={cn("auth-input w-full text-sm", isRTL ? "text-end" : "text-start")}
                  autoComplete="tel"
                />
              </div>
            </label>
            {errors.phone && (
              <span className="text-xs text-red-300">
                {isRTL ? "رقم الهاتف مطلوب" : "Phone is required"}
              </span>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="auth-field block">
            <div className="auth-input-wrap">
              <Image src="/auth/password.svg" alt="" width={20} height={20} aria-hidden />
              <input
                {...register("password", { required: true, minLength: 8 })}
                type={showPassword ? "text" : "password"}
                placeholder={passwordPlaceholder}
                className="auth-input w-full"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="shrink-0 cursor-pointer p-2 rounded-md hover:bg-white/10 transition focus:outline-none"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
              >
                <Image src="/auth/eye.svg" alt="" width={20} height={20} aria-hidden />
              </button>
            </div>
          </label>
          {errors.password && (
            <span className="text-xs text-red-300">
              {isRTL
                ? "يجب أن تكون كلمة المرور 8 أحرف على الأقل"
                : "Password must be at least 8 characters"}
            </span>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="auth-field block">
            <div className="auth-input-wrap">
              <Image src="/auth/password.svg" alt="" width={20} height={20} aria-hidden />
              <input
                {...register("password_confirmation", { required: true })}
                type={showConfirmPassword ? "text" : "password"}
                placeholder={confirmPasswordPlaceholder}
                className="auth-input w-full"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="shrink-0 cursor-pointer p-2 rounded-md hover:bg-white/10 transition focus:outline-none"
                onClick={() => setShowConfirmPassword((p) => !p)}
                aria-label={showConfirmPassword ? hidePasswordLabel : showPasswordLabel}
              >
                <Image src="/auth/eye.svg" alt="" width={20} height={20} aria-hidden />
              </button>
            </div>
          </label>
          {passwordConfirmation && !passwordsMatch && (
            <span className="text-xs text-red-300">
              {isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match"}
            </span>
          )}
        </div>
      </AuthFieldGroup>

      {/* Terms checkbox */}
      <label className="flex items-start gap-2 text-sm text-white/90 cursor-pointer">
        <input
          type="checkbox"
          {...register("accept_terms", { required: true })}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#40A0CA] cursor-pointer"
        />
        <span>
          {t.rich("fields.termsLabel", {
            termsLink: (chunks) => (
              <a href={`/${locale}/terms`} target="_blank" rel="noopener noreferrer" className="text-[#40A0CA] underline hover:text-[#52b3dd] mx-0.5">
                {chunks}
              </a>
            ),
            privacyLink: (chunks) => (
              <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer" className="text-[#40A0CA] underline hover:text-[#52b3dd] mx-0.5">
                {chunks}
              </a>
            ),
          })}
        </span>
      </label>

      {/* Server error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !acceptTerms || !passwordsMatch}
        className="w-full rounded-xl bg-gradient-to-b from-[#006ea8] to-[#005685] py-3 font-semibold text-white shadow-[0_8px_24px_rgba(0,110,168,0.35)] transition-all hover:from-[#0080c2] hover:to-[#006699] active:translate-y-px disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{isRTL ? "جاري إنشاء الحساب..." : "Creating account..."}</span>
          </>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  )
}
