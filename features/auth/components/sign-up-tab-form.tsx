"use client"

import { useState } from "react"
import Image from "next/image"
import { AuthFieldGroup } from "./auth-field-group"
import { AuthFieldRow } from "./auth-field-row"
import { AuthPrimaryCta } from "./auth-primary-cta"

type Props = {
  userTabLabel: string
  companyTabLabel: string
  tabListLabel: string
  fullNamePlaceholder: string
  emailPlaceholder: string
  passwordPlaceholder: string
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
  showPasswordLabel,
  hidePasswordLabel,
  submitLabel,
}: Props) {
  const [activeTab, setActiveTab] = useState<"user" | "company">("user")
  const [showPassword, setShowPassword] = useState(false)
  const baseTabClassName =
    "inline-flex h-[52px] w-[227px] items-center justify-center gap-2 rounded-xl border px-4 py-2 text-base font-medium transition-all duration-200"
  const activeTabClassName =
    "border-[#9fc9e6] bg-linear-to-b from-[#006ea8] to-[#005685] text-white shadow-[0_42px_107px_rgba(123,190,255,0.34),0_24.7206px_32.2574px_rgba(0,86,133,0.1867),0_10.2677px_13.3981px_rgba(0,86,133,0.22),0_3.71362px_4.84582px_rgba(0,86,133,0.1533),inset_0_1px_18px_2px_#E8F2FF,inset_0_1px_4px_2px_#C2DDFF]"
  const inactiveTabClassName =
    "border-[#6b87a2] bg-[#02223b]/65 text-[#d9eef9] hover:bg-[#033a62]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9fc9e6]/60"

  return (
    <>
      <div role="tablist" aria-label={tabListLabel} className="flex w-full items-center gap-4">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "user"}
          onClick={() => setActiveTab("user")}
          className={`${baseTabClassName} ${activeTab === "user" ? activeTabClassName : inactiveTabClassName}`}
        >
          <Image src="/auth/user.svg" alt="" width={24} height={24} className="h-6 w-6" aria-hidden />
          <span>{userTabLabel}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "company"}
          onClick={() => setActiveTab("company")}
          className={`${baseTabClassName} ${activeTab === "company" ? activeTabClassName : inactiveTabClassName}`}
        >
          <Image src="/auth/company.svg" alt="" width={24} height={24} className="h-6 w-6" aria-hidden />
          <span>{companyTabLabel}</span>
        </button>
      </div>

      <AuthFieldGroup>
        <AuthFieldRow
          iconSrc="/auth/user.svg"
          placeholder={activeTab === "user" ? fullNamePlaceholder : companyTabLabel}
        />
        <AuthFieldRow iconSrc="/auth/email.svg" type="email" placeholder={emailPlaceholder} />
        <AuthFieldRow
          iconSrc="/auth/password.svg"
          type={showPassword ? "text" : "password"}
          placeholder={passwordPlaceholder}
          endIconSrc="/auth/eye.svg"
          endIconButtonProps={{
            onClick: () => setShowPassword((previous) => !previous),
            "aria-label": showPassword ? hidePasswordLabel : showPasswordLabel,
            "aria-pressed": showPassword,
          }}
        />
      </AuthFieldGroup>

      <AuthPrimaryCta label={submitLabel} />
    </>
  )
}
