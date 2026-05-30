import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { DashboardPageShell } from "@/features/dashboard/components/dashboard-page-shell"

export default async function UserEducationPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  if (!session.user || session.user.role !== "user") redirect(`/${locale}/dashboard`)

  const isAr = locale === "ar"

  const title = isAr ? "المؤهلات والتعليم" : "Education & Portfolio"
  const description = isAr
    ? "راجع تفاصيل المؤهل الأكاديمي وخطط التطوير المهنية في لوحة واحدة"
    : "Review your academic background and professional development in one place"

  const sections = [
    {
      title: isAr ? "ملف السيرة الذاتية" : "CV & portfolio",
      body: isAr
        ? "تحديث السيرة الذاتية وإضافة الإنجازات والمهارات الأساسية للدعم على الوظائف المناسبة"
        : "Update your CV and add achievements and core skills to improve matching",
    },
    {
      title: isAr ? "المؤهلات الأكاديمية" : "Education",
      body: isAr
        ? "إدارة الشهادات والدورات التدريبية والدرجات العلمية التي تعكس خبراتك"
        : "Manage certificates, training, and academic degrees that reflect your experience",
    },
    {
      title: isAr ? "تطوير المهارات" : "Skill development",
      body: isAr
        ? "تابع الدورات والكفاءات التي تساعدك على التقدم في مسار وظيفي جديد"
        : "Track training and capabilities that help you grow in your next role",
    },
  ]

  return (
    <DashboardPageShell title={title} description={description}>
      <div className="grid gap-4 xl:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-[#111827]">{section.title}</p>
            <p className="mt-3 text-sm leading-6 text-[#6B7280]">{section.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[16px] border border-dashed border-[#40A0CA] bg-[#F4FAFF] p-5 text-sm text-[#0F172A]">
        {isAr
          ? "هذه الصفحة جاهزة للتطوير لاحقاً عند توفر بيانات الـ API الخاصة بالمؤهلات والتعليم."
          : "This page is ready for a future API-backed education and portfolio integration."}
      </div>
    </DashboardPageShell>
  )
}
