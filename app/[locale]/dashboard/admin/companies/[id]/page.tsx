import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getAdminUsers } from "@/lib/api/services/admin.service"
import { AdminCompanyDetailView } from "@/features/admin/components/admin-company-detail-view"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.user || session.user.role !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  let company: any = null
  try {
    // Fetch with large page size to get all companies without pagination
    const result = await getAdminUsers(session.accessToken!, "company", 1, locale)
    // Get all pages if needed
    let allCompanies = result.data
    let currentPage = 1
    let hasMore = result.meta?.last_page && currentPage < result.meta.last_page
    
    while (hasMore) {
      currentPage += 1
      const nextResult = await getAdminUsers(session.accessToken!, "company", currentPage, locale)
      allCompanies = [...allCompanies, ...nextResult.data]
      hasMore = nextResult.meta?.last_page && currentPage < nextResult.meta.last_page
    }
    
    company = allCompanies.find((c: any) => c.id === parseInt(id))
  } catch (err) {
    // ignore
  }

  if (!company) {
    redirect(`/${locale}/dashboard/admin/companies`)
  }

  const companyProfile = company.companyProfile || {}

  const resolveCompanyTitle = () => {
    if (companyProfile.companyName) return companyProfile.companyName
    const name = company.name
    if (!name) return ""
    if (typeof name === "string") return name
    // name may be an object with per-locale strings
    return (name.ar || name.en || name.de || name.name || name.title || "") as string
  }

  return (
    <AdminPageLayout 
      title={resolveCompanyTitle()} 
      description={`Company Profile - ${company.email}`}
    >
      <AdminCompanyDetailView company={company} locale={locale} />
    </AdminPageLayout>
  )
}
