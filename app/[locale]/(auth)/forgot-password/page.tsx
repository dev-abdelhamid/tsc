import { getTranslations } from "next-intl/server"
import { AuthCardWrapper } from "@/features/auth/components/auth-card-wrapper"
import { AuthFieldGroup } from "@/features/auth/components/auth-field-group"
import { AuthFieldRow } from "@/features/auth/components/auth-field-row"
import { AuthPrimaryCta } from "@/features/auth/components/auth-primary-cta"

export default async function ForgotPasswordPage() {
  const t = await getTranslations("Auth.forgotPassword")

  return (
    <AuthCardWrapper
      backHref="/sign-in"
      backLabel={t("back")}
      logoAlt={t("logoAlt")}
      title={t("title")}
      description={t("description")}
      footerPrefix={t("rememberPassword")}
      footerActionLabel={t("signIn")}
      footerActionHref="/sign-in"
    >
      <AuthFieldGroup>
        <AuthFieldRow iconSrc="/auth/email.svg" type="email" placeholder={t("fields.emailPlaceholder")} />
      </AuthFieldGroup>
      <AuthPrimaryCta label={t("submit")} />
    </AuthCardWrapper>
  )
}
