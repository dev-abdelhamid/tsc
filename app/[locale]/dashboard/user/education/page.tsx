import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"

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

  const sections = [
    {
      title: isAr ? "ملف السيرة الذاتية" : "CV & Portfolio",
      icon: "📄",
      body: isAr
        ? "تحديث السيرة الذاتية وإضافة الإنجازات والمهارات الأساسية للدعم على الوظائف المناسبة"
        : "Update your CV and add achievements and core skills to improve matching",
    },
    {
      title: isAr ? "المؤهلات الأكاديمية" : "Education",
      icon: "🎓",
      body: isAr
        ? "إدارة الشهادات والدورات التدريبية والدرجات العلمية التي تعكس خبراتك"
        : "Manage certificates, training, and academic degrees that reflect your experience",
    },
    {
      title: isAr ? "تطوير المهارات" : "Skill Development",
      icon: "⭐",
      body: isAr
        ? "تابع الدورات والكفاءات التي تساعدك على التقدم في مسار وظيفي جديد"
        : "Track training and capabilities that help you grow in your next role",
    },
  ]

  return (
    <div className="w-full">
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
            {isAr ? "المؤهلات والتعليم" : "Education & Portfolio"}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#6B7280]">
            {isAr
              ? "راجع تفاصيل المؤهل الأكاديمي وخطط التطوير المهنية في لوحة واحدة"
              : "Review your academic background and professional development in one place"}
          </p>
        </div>

        {/* Section Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-[12px] border border-[#E5E7EB] bg-gradient-to-br from-[#F9FAFB] to-white p-4 sm:p-5 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 transition-transform">
                {section.icon}
              </div>
              <p className="text-sm sm:text-base font-semibold text-[#111827] mb-2">
                {section.title}
              </p>
              <p className="text-xs sm:text-sm leading-6 text-[#6B7280]">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-6 sm:mt-8 rounded-[12px] border border-dashed border-[#40A0CA] bg-[#F4FAFF] p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-[#0F172A]">
            {isAr
              ? "🔔 هذه الصفحة جاهزة للتطوير لاحقاً عند توفر بيانات الـ API الخاصة بالمؤهلات والتعليم."
              : "🔔 This page is ready for a future API-backed education and portfolio integration."}
          </p>
        </div>
      </div>
    </div>
  )
}
