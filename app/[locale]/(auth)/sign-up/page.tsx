import { getTranslations } from "next-intl/server"
import {
  AuthCardWrapper,
} from "@/features/auth/components/auth-card-wrapper"
import { SignUpTabForm } from "@/features/auth/components/sign-up-tab-form"

export default async function SignUpPage() {
  const t = await getTranslations("Auth.signUp")

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
      <SignUpTabForm
        userTabLabel={t("userTab")}
        companyTabLabel={t("companyTab")}
        tabListLabel={t("accountTypeTabs")}
        fullNamePlaceholder={t("fields.fullNamePlaceholder")}
        emailPlaceholder={t("fields.emailPlaceholder")}
        passwordPlaceholder={t("fields.passwordPlaceholder")}
        showPasswordLabel={t("fields.showPassword")}
        hidePasswordLabel={t("fields.hidePassword")}
        submitLabel={t("submit")}
      />
    </AuthCardWrapper>
  )
}
