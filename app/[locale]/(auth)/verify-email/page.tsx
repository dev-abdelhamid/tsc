import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { AuthCardWrapper } from "@/features/auth/components/auth-card-wrapper"
import { VerifyEmailForm } from "@/features/auth/components/verify-email-form"

export default async function VerifyEmailPage() {
  const t = await getTranslations("Auth.verifyEmail")

  return (
    <AuthCardWrapper
      backHref="/sign-in"
      backLabel={t("back")}
      logoAlt={t("logoAlt")}
      title={t("title")}
      description={t("description")}
      footerPrefix={t("hasAccount")}
      footerActionLabel={t("signIn")}
      footerActionHref="/sign-in"
    >
      <Suspense fallback={<div className="text-white/70">...</div>}>
        <VerifyEmailForm
          codePlaceholder={t("fields.codePlaceholder")}
          submitLabel={t("submit")}
          resendLabel={t("resend")}
        />
      </Suspense>
    </AuthCardWrapper>
  )
}
