import { notFound, redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getSession } from "@/lib/session"
import { getCompanyJob, getJobApplications } from "@/lib/api/services/company.service"
import { CompanyApplicationActions } from "@/features/company-jobs/components/company-application-actions"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { cn } from "@/lib/utils"

type PageProps = {
  params: Promise<{ locale: string; id: string; applicationId: string }>
}

function formatDate(dateStr?: string, locale?: string) {
  if (!dateStr) return "—"
  try {
    const formatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    return formatter.format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export default async function CompanyApplicationDetailPage({ params }: PageProps) {
  const { locale, id, applicationId } = await params
  setRequestLocale(locale)

  const session = await getSession()
  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  if (session.user?.role !== "company") {
    redirect(`/${locale}/dashboard`)
  }

  const jobId = Number(id)
  const appId = Number(applicationId)

  if (!Number.isFinite(jobId) || jobId <= 0 || !Number.isFinite(appId) || appId <= 0) {
    notFound()
  }

  // Fetch job and find the specific application
  const job = await getCompanyJob(jobId, session.accessToken, locale)
  if (!job) notFound()

  const appsResult = await getJobApplications(jobId, session.accessToken, 1, locale).catch(() => ({ data: [] }))
  const application = appsResult.data?.find((a: any) => (a.id || a.applicationId) === appId) as any

  if (!application) {
    notFound()
  }

  const portfolio = application.userPortfolio || {}
  const status = application.status || "pending"
  const isAr = locale === "ar"

  const labels = {
    title: isAr ? "تفاصيل طلب التوظيف" : "Application Details",
    backToList: isAr ? "العودة إلى الطلبات" : "Back to Applications",
    applicantProfile: isAr ? "الملف الشخصي للمتقدم" : "Applicant Profile",
    appliedOn: isAr ? "تاريخ التقديم" : "Applied On",
    status: isAr ? "الحالة" : "Status",
    cvUrl: isAr ? "السيرة الذاتية" : "Resume / CV",
    downloadCV: isAr ? "تحميل السيرة الذاتية" : "Download Resume / CV",
    noCV: isAr ? "لم يرفع المتقدم سيرة ذاتية" : "No CV uploaded by the applicant",
    education: isAr ? "التعليم والشهادات" : "Education & Credentials",
    noEducation: isAr ? "لا توجد مؤهلات تعليمية مضافة" : "No education details added",
    workExperience: isAr ? "الخبرات المهنية" : "Work Experience",
    noExperience: isAr ? "لا توجد خبرات مهنية مضافة" : "No work experience details added",
    skills: isAr ? "المهارات" : "Skills",
    noSkills: isAr ? "لا توجد مهارات مضافة" : "No skills added",
    languages: isAr ? "اللغات" : "Languages",
    noLanguages: isAr ? "لا توجد لغات مضافة" : "No languages added",
    currentlyWorking: isAr ? "يعمل حالياً هنا" : "Currently working here",
    graduationYear: isAr ? "سنة التخرج" : "Graduation Year",
    university: isAr ? "الجامعة/المؤسسة" : "University / Institution",
    specialization: isAr ? "التخصص" : "Specialization",
    grade: isAr ? "التقدير النهائي" : "Grade",
    degreeLevel: isAr ? "الدرجة العلمية" : "Degree",
    companyName: isAr ? "اسم الشركة" : "Company Name",
    department: isAr ? "القسم/المسمى الوظيفي" : "Department / Job Title",
    startDate: isAr ? "تاريخ البدء" : "Start Date",
    endDate: isAr ? "تاريخ الانتهاء" : "End Date",
    responsibilities: isAr ? "المسؤوليات" : "Responsibilities",
  }

  const formatDegree = (degree?: string) => {
    if (!degree) return "—"
    const degMap: Record<string, string> = {
      high_school: isAr ? "ثانوية عامة" : "High School",
      bachelor: isAr ? "بكالوريوس" : "Bachelor's Degree",
      master: isAr ? "ماجستير" : "Master's Degree",
      phd: isAr ? "دكتوراه" : "PhD",
    }
    return degMap[degree] || degree
  }

  const formatGrade = (grade?: string) => {
    if (!grade) return "—"
    const gradeMap: Record<string, string> = {
      excellent: isAr ? "ممتاز" : "Excellent",
      very_good: isAr ? "جيد جداً" : "Very Good",
      good: isAr ? "جيد" : "Good",
      pass: isAr ? "مقبول" : "Pass",
    }
    return gradeMap[grade] || grade
  }

  const formatLanguageLevel = (level?: string) => {
    if (!level) return "—"
    const levelMap: Record<string, string> = {
      beginner: isAr ? "مبتدئ" : "Beginner",
      intermediate: isAr ? "متوسط" : "Intermediate",
      fluent: isAr ? "طلاقة" : "Fluent",
      native: isAr ? "اللغة الأم" : "Native Speaker",
    }
    return levelMap[level] || level
  }

  const gradientTitleClasses = cn(
    "bg-clip-text text-transparent font-bold",
    isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
    "from-[#032C44] to-[#41A0CA]"
  )

  return (
    <div className="flex w-full flex-col gap-6 text-start" dir={isAr ? "rtl" : "ltr"}>
      {/* Header card */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] bg-white p-6 shadow-sm border border-[#E5E7EB] sm:p-8">
        <div className="min-w-0 flex-1">
          <h1 className={cn("text-[24px] leading-relaxed py-1", gradientTitleClasses)}>
            {labels.title}
          </h1>
          <p className="mt-1 text-sm text-[#525252]">
            {isAr ? `طلب التقديم على وظيفة: ${getJobTitle(job, locale)}` : `Application for job: ${getJobTitle(job, locale)}`}
          </p>
        </div>
        <Link
          href={`/dashboard/company/jobs/${jobId}/applications`}
          className="flex items-center gap-2 px-5 py-2.5 border border-[#006EA8] text-[#006EA8] hover:bg-[#F0F9FF] rounded-[8px] text-[14px] font-semibold transition"
        >
          <span aria-hidden>{isAr ? "→" : "←"}</span>
          {labels.backToList}
        </Link>
      </div>

      {/* Main Grid: Info + CV / Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Candidate Portfolio Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Education Section */}
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="text-[18px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
              {labels.education}
            </h2>
            {portfolio.education && portfolio.education.length > 0 ? (
              <div className="space-y-6">
                {portfolio.education.map((edu: any, idx: number) => (
                  <div key={idx} className={cn("space-y-3", idx > 0 && "pt-6 border-t border-gray-100")}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-[16px] font-bold text-[#032C44]">{edu.university}</h4>
                        <p className="text-xs text-[#006EA8] mt-1 font-semibold">
                          {formatDegree(edu.level_of_education)}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full shrink-0">
                        {labels.graduationYear}: {edu.graduation_year}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="text-gray-400 text-xs block">{labels.specialization}</span>
                        <span className="font-semibold text-[#525252]">{edu.specialization || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs block">{labels.grade}</span>
                        <span className="font-semibold text-[#525252]">{formatGrade(edu.final_grade)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 font-medium">
                <img src="/portfolio/drop.svg" alt="Empty" className="w-12 h-12 mx-auto opacity-30 mb-2" />
                <p className="text-xs">{labels.noEducation}</p>
              </div>
            )}
          </div>

          {/* Experience Section */}
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="text-[18px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
              {labels.workExperience}
            </h2>
            {portfolio.workExperience && portfolio.workExperience.length > 0 ? (
              <div className="space-y-6">
                {portfolio.workExperience.map((exp: any, idx: number) => (
                  <div key={idx} className={cn("space-y-3", idx > 0 && "pt-6 border-t border-gray-100")}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-[16px] font-bold text-[#032C44]">{exp.company_name}</h4>
                        <p className="text-xs text-[#006EA8] mt-1 font-semibold">{exp.department}</p>
                      </div>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full shrink-0">
                        {formatDate(exp.start_date, locale)} - {exp.currently_working ? labels.currentlyWorking : formatDate(exp.end_date, locale)}
                      </span>
                    </div>
                    {exp.responsibilities && (
                      <div className="text-sm bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-400 text-xs block mb-1">{labels.responsibilities}</span>
                        <p className="text-[#525252] whitespace-pre-line leading-relaxed">{exp.responsibilities}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 font-medium">
                <img src="/portfolio/drop.svg" alt="Empty" className="w-12 h-12 mx-auto opacity-30 mb-2" />
                <p className="text-xs">{labels.noExperience}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Actions + Resume + Skills / Languages */}
        <div className="space-y-6">
          {/* Status & Action Panel */}
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-[16px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3">
              {isAr ? "حالة الطلب والإجراءات" : "Application Status & Actions"}
            </h3>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-xs font-semibold text-gray-500">{labels.status}</span>
              <DashboardStatusBadge status={status} />
            </div>

            {/* Application Approval/Rejection actions */}
            <div className="pt-2">
              <CompanyApplicationActions
                applicationId={appId}
                jobId={jobId}
                locale={locale}
                status={status}
              />
            </div>
          </div>

          {/* CV Section */}
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-[16px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3">
              {labels.cvUrl}
            </h3>
            {portfolio.cv ? (
              <a
                href={portfolio.cv}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#EBF5FB] border border-[#006EA8]/20 rounded-xl p-4 text-[#006EA8] hover:bg-[#DCEEF9] transition"
              >
                <img src="/portfolio/pdf.svg" alt="" className="w-8 h-8 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-bold truncate">{labels.downloadCV}</span>
                </div>
              </a>
            ) : (
              <div className="text-center py-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
                {labels.noCV}
              </div>
            )}
          </div>

          {/* Skills Section */}
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="text-[18px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
              {labels.skills}
            </h2>
            {portfolio.skills && portfolio.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {portfolio.skills.map((skill: any, idx: number) => (
                  <span
                    key={idx}
                    className="rounded-full bg-[#EBF5FB] border border-[#cfe7f7] px-3 py-1.5 text-xs font-bold text-[#006EA8]"
                  >
                    {skill.skill_name}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 font-medium">
                <img src="/portfolio/drop.svg" alt="Empty" className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p className="text-xs">{labels.noSkills}</p>
              </div>
            )}
          </div>

          {/* Languages Section */}
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="text-[18px] font-bold text-[#032C44] border-b border-[#E5E7EB] pb-3 mb-4">
              {labels.languages}
            </h2>
            {portfolio.languages && portfolio.languages.length > 0 ? (
              <div className="space-y-3">
                {portfolio.languages.map((lang: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border border-[#E5E7EB] rounded-[12px] px-4 py-3 bg-[#F9FAFB]"
                  >
                    <span className="text-[14px] font-bold text-[#032C44]">{lang.language}</span>
                    <span className="bg-[#EBF5FF] text-[#006EA8] text-[11px] font-bold px-3 py-1 rounded-full uppercase">
                      {formatLanguageLevel(lang.level)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 font-medium">
                <img src="/portfolio/drop.svg" alt="Empty" className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p className="text-xs">{labels.noLanguages}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
