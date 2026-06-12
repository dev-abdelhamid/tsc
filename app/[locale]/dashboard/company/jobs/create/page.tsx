import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getCategoriesForForm } from "@/lib/api/services/categories.service"
import { CreateJobWizard } from "@/features/company-jobs/components/create-job-wizard"

export default async function CreateJobPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.isLoggedIn || !session.user) {
    redirect(`/${locale}/sign-in`)
  }

  if (normalizeRole(session.user) !== "company") {
    redirect(`/${locale}/dashboard`)
  }

  if (!session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  const categories = await getCategoriesForForm(
    locale,
    session.accessToken
  ).catch(() => [] as Awaited<ReturnType<typeof getCategoriesForForm>>)

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-[#F5F7FA] px-4 py-10">
      <CreateJobWizard categories={categories} locale={locale} />
    </div>
  )
}
