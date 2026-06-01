"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getUserPortfolio } from "@/lib/api/services/portfolio.service"
import type { UserPortfolio } from "@/lib/api/types"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

type Props = {
  locale: string
  initialPortfolio?: UserPortfolio
}

type LanguageForm = { name: string; proficiency: string }
type EducationForm = { degree: string; institution: string; field_of_study: string; start_date: string; end_date?: string; grade?: string; attachment?: File }
type ExperienceForm = { job_title: string; company: string; start_date: string; end_date?: string; is_current?: boolean; location?: string; description?: string; attachment?: File }
type SkillForm = { name: string }

export default function UserEducationClient({ locale, initialPortfolio }: Props) {
  const { loading } = useAuth()
  const [portfolio, setPortfolio] = useState<UserPortfolio>(initialPortfolio ?? {})
  const [fetching, setFetching] = useState(!initialPortfolio)
  const [message, setMessage] = useState("")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Modal states
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showEducationModal, setShowEducationModal] = useState(false)
  const [showExperienceModal, setShowExperienceModal] = useState(false)
  const [showSkillModal, setShowSkillModal] = useState(false)
  
  // Form states
  const [languageForm, setLanguageForm] = useState<LanguageForm>({ name: "", proficiency: "" })
  const [educationForm, setEducationForm] = useState<EducationForm>({ degree: "", institution: "", field_of_study: "", start_date: "" })
  const [experienceForm, setExperienceForm] = useState<ExperienceForm>({ job_title: "", company: "", start_date: "" })
  const [skillForm, setSkillForm] = useState<SkillForm>({ name: "" })
  const [educationFile, setEducationFile] = useState<File | null>(null)
  const [experienceFile, setExperienceFile] = useState<File | null>(null)

  useEffect(() => {
    let mounted = true
    async function loadPortfolio() {
      if (initialPortfolio) return
      setFetching(true)
      try {
        const res = await fetch("/api/user/portfolio", { headers: { "x-locale": locale } })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.message || "Failed to load portfolio data")
        if (mounted) setPortfolio(data || {})
      } catch (err) {
        if (mounted) setMessage(err instanceof Error ? err.message : "Failed to load portfolio data")
      } finally {
        if (mounted) setFetching(false)
      }
    }
    loadPortfolio()
    return () => {
      mounted = false
    }
  }, [initialPortfolio, locale])

  // Save portfolio to API
  const savePortfolio = async (updatedPortfolio: UserPortfolio) => {
    try {
      setSaving(true)
      const formData = new FormData()

      // Add languages
      if (updatedPortfolio.languages?.length) {
        updatedPortfolio.languages.forEach((lang, idx) => {
          formData.append(`languages[${idx}][name]`, lang.name)
          formData.append(`languages[${idx}][proficiency]`, lang.proficiency)
        })
      }

      // Add educations
      if (updatedPortfolio.educations?.length) {
        updatedPortfolio.educations.forEach((edu, idx) => {
          formData.append(`education[${idx}][degree]`, edu.degree)
          formData.append(`education[${idx}][institution]`, edu.institution)
          formData.append(`education[${idx}][field_of_study]`, edu.field_of_study)
          formData.append(`education[${idx}][start_date]`, edu.start_date)
          if (edu.end_date) formData.append(`education[${idx}][end_date]`, edu.end_date)
          if (edu.grade) formData.append(`education[${idx}][grade]`, String(edu.grade))
        })
      }

      // Add work experience
      if (updatedPortfolio.experiences?.length) {
        updatedPortfolio.experiences.forEach((exp, idx) => {
          formData.append(`work_experience[${idx}][job_title]`, exp.job_title)
          formData.append(`work_experience[${idx}][company]`, exp.company)
          formData.append(`work_experience[${idx}][start_date]`, exp.start_date)
          if (exp.end_date) formData.append(`work_experience[${idx}][end_date]`, exp.end_date)
          if (exp.description) formData.append(`work_experience[${idx}][description]`, exp.description)
        })
      }

      // Add skills
      if (updatedPortfolio.skills?.length) {
        updatedPortfolio.skills.forEach((skill, idx) => {
          formData.append(`skills[${idx}][name]`, skill.name)
        })
      }

      const res = await fetch("/api/user/portfolio", {
        method: "POST",
        body: formData,
        headers: { "x-locale": locale },
      })

      if (!res.ok) throw new Error("Failed to save portfolio")
      toast.success(locale === "ar" ? "تم الحفظ بنجاح" : "Saved successfully")
      setSaving(false)
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
      setSaving(false)
      return false
    }
  }

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const form = new FormData()
      form.append("cv", file)

      const res = await fetch("/api/user/cv", { method: "POST", body: form, headers: { "x-locale": locale } })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || "Failed to upload CV")

      // If the server returns cv_url, use it
      if (data?.cv_url) {
        setPortfolio((prev) => ({ ...prev, cv_url: data.cv_url }))
        toast.success(locale === "ar" ? "تم رفع السيرة الذاتية بنجاح" : "CV uploaded successfully")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (locale === "ar" ? "فشل رفع السيرة الذاتية" : "Failed to upload CV"))
    } finally {
      setUploading(false)
    }
  }

  const isAr = locale === "ar"

  // Add Language Handler
  const handleAddLanguage = async () => {
    if (!languageForm.name || !languageForm.proficiency) {
      toast.error(locale === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields")
      return
    }

    const updated = {
      ...portfolio,
      languages: [...(portfolio.languages || []), { id: Date.now(), ...languageForm }],
    }
    
    if (await savePortfolio(updated)) {
      setPortfolio(updated)
      setLanguageForm({ name: "", proficiency: "" })
      setShowLanguageModal(false)
    }
  }

  // Add Education Handler
  const handleAddEducation = async () => {
    if (!educationForm.degree || !educationForm.institution || !educationForm.start_date) {
      toast.error(locale === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill required fields")
      return
    }

    const updated = {
      ...portfolio,
      educations: [
        ...(portfolio.educations || []),
        { id: Date.now(), ...educationForm, attachment: educationFile },
      ],
    }

    if (await savePortfolio(updated)) {
      setPortfolio(updated)
      setEducationForm({ degree: "", institution: "", field_of_study: "", start_date: "" })
      setEducationFile(null)
      setShowEducationModal(false)
    }
  }

  // Add Experience Handler
  const handleAddExperience = async () => {
    if (!experienceForm.job_title || !experienceForm.company || !experienceForm.start_date) {
      toast.error(locale === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill required fields")
      return
    }

    const updated = {
      ...portfolio,
      experiences: [
        ...(portfolio.experiences || []),
        { id: Date.now(), ...experienceForm, attachment: experienceFile },
      ],
    }

    if (await savePortfolio(updated)) {
      setPortfolio(updated)
      setExperienceForm({ job_title: "", company: "", start_date: "" })
      setExperienceFile(null)
      setShowExperienceModal(false)
    }
  }

  // Add Skill Handler
  const handleAddSkill = async () => {
    if (!skillForm.name.trim()) {
      toast.error(locale === "ar" ? "يرجى إدخال اسم المهارة" : "Please enter skill name")
      return
    }

    const updated = {
      ...portfolio,
      skills: [...(portfolio.skills || []), { id: Date.now(), ...skillForm }],
    }

    if (await savePortfolio(updated)) {
      setPortfolio(updated)
      setSkillForm({ name: "" })
      setShowSkillModal(false)
    }
  }

  // Remove handlers
  const handleRemoveLanguage = async (id: number) => {
    const updated = {
      ...portfolio,
      languages: portfolio.languages?.filter((l) => l.id !== id) ?? [],
    }
    if (await savePortfolio(updated)) {
      setPortfolio(updated)
    }
  }

  const handleRemoveEducation = async (id: number) => {
    const updated = {
      ...portfolio,
      educations: portfolio.educations?.filter((e) => e.id !== id) ?? [],
    }
    if (await savePortfolio(updated)) {
      setPortfolio(updated)
    }
  }

  const handleRemoveExperience = async (id: number) => {
    const updated = {
      ...portfolio,
      experiences: portfolio.experiences?.filter((e) => e.id !== id) ?? [],
    }
    if (await savePortfolio(updated)) {
      setPortfolio(updated)
    }
  }

  const handleRemoveSkill = async (id: number) => {
    const updated = {
      ...portfolio,
      skills: portfolio.skills?.filter((s) => s.id !== id) ?? [],
    }
    if (await savePortfolio(updated)) {
      setPortfolio(updated)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* CV Section */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">{isAr ? "السيرة الذاتية" : "CV"}</h2>
          <label>
            <input
              accept=".pdf,.doc,.docx"
              onChange={handleCVUpload}
              type="file"
              className="hidden"
              disabled={uploading}
            />
            <span className="inline-flex items-center justify-center px-4 py-2 bg-[#006EA8] text-white text-xs sm:text-sm rounded-full cursor-pointer hover:bg-[#005685] transition disabled:opacity-60">
              {uploading ? (isAr ? "جاري الرفع..." : "Uploading...") : (isAr ? "اضف جديد" : "Add New")}
            </span>
          </label>
        </div>

        {portfolio.cv_url ? (
          <div className="rounded-lg border-2 border-dashed border-[#40A0CA] bg-[#F4FAFF] p-6 text-center">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-sm text-[#0F172A] font-medium mb-3">{isAr ? "السيرة الذاتية: تم الرفع" : "CV: Document uploaded"}</p>
            <a
              href={portfolio.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
            >
              {isAr ? "تحميل" : "Download"}
            </a>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-[#40A0CA] bg-[#F4FAFF] p-6 text-center">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-sm text-[#6B7280]">{isAr ? "اسحب السيرة الذاتية هنا أو ارفعها" : "Drop your CV here or Upload"}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">{isAr ? "يدعم PDF" : "Support PDF"}</p>
          </div>
        )}
      </div>

      {/* Language Section */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">{isAr ? "اللغات" : "Language"}</h2>
          <button 
            onClick={() => setShowLanguageModal(true)}
            className="px-4 py-2 bg-[#006EA8] text-white text-xs sm:text-sm rounded-full hover:bg-[#005685] transition"
            title={isAr ? "اضف لغة جديدة" : "Add new language"}
          >
            {isAr ? "اضف جديد" : "Add New"}
          </button>
        </div>

        {portfolio.languages && portfolio.languages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {portfolio.languages.map((lang) => (
              <div
                key={lang.id}
                className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] flex justify-between items-start"
              >
                <div>
                  <h3 className="font-medium text-[#111827]">{lang.name}</h3>
                  <p className="text-sm text-[#6B7280] mt-1">
                    {lang.proficiency === "native"
                      ? (isAr ? "لغة أم أو ثنائية" : "Native or Bilingual")
                      : lang.proficiency === "fluent"
                        ? (isAr ? "محادثة" : "Conversational")
                        : lang.proficiency}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveLanguage(lang.id)}
                  className="text-red-500 hover:text-red-700 text-xl"
                  title={isAr ? "حذف" : "Delete"}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6B7280]">{isAr ? "لا توجد لغات مضافة" : "No languages added yet"}</p>
        )}
      </div>

      {/* Language Modal */}
      <Dialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "إضافة لغة" : "Add Language"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={isAr ? "اسم اللغة" : "Language name"}
              value={languageForm.name}
              onChange={(e) => setLanguageForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Select value={languageForm.proficiency} onValueChange={(value) => setLanguageForm((prev) => ({ ...prev, proficiency: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={isAr ? "اختر المستوى" : "Select proficiency"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">{isAr ? "مبتدئ" : "Beginner"}</SelectItem>
                <SelectItem value="intermediate">{isAr ? "متوسط" : "Intermediate"}</SelectItem>
                <SelectItem value="fluent">{isAr ? "محادثة" : "Conversational"}</SelectItem>
                <SelectItem value="native">{isAr ? "لغة أم" : "Native"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowLanguageModal(false)} variant="outline">
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleAddLanguage} className="bg-[#006EA8]">
              {isAr ? "إضافة" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Education Section */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">{isAr ? "المؤهلات" : "Education"}</h2>
          <button 
            onClick={() => setShowEducationModal(true)}
            className="px-4 py-2 bg-[#006EA8] text-white text-xs sm:text-sm rounded-full hover:bg-[#005685] transition"
            title={isAr ? "اضف مؤهل جديد" : "Add new education"}
          >
            {isAr ? "اضف جديد" : "Add New"}
          </button>
        </div>

        {portfolio.educations && portfolio.educations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.educations.map((edu) => (
              <div
                key={edu.id}
                className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] relative"
              >
                <button
                  onClick={() => handleRemoveEducation(edu.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl"
                  title={isAr ? "حذف" : "Delete"}
                >
                  ×
                </button>
                <h3 className="font-bold text-[#111827] pr-6">{edu.degree}</h3>
                <p className="text-sm text-[#6B7280] mt-1">{edu.institution}</p>
                <p className="text-xs text-[#9CA3AF] mt-2">
                  {new Date(edu.start_date).getFullYear()}
                  {edu.end_date ? ` - ${new Date(edu.end_date).getFullYear()}` : ` - ${isAr ? "الحالي" : "Present"}`}
                </p>
                {edu.grade && (
                  <p className="text-sm text-[#111827] mt-2 font-medium">
                    {isAr ? "التقدير:" : "Grade:"} {edu.grade}%
                  </p>
                )}
                {edu.document_url && (
                  <a
                    href={edu.document_url}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-3 inline-block underline"
                  >
                    {isAr ? "عرض الشهادة" : "View Certificate"}
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6B7280]">{isAr ? "لا توجد مؤهلات مضافة حتى الآن" : "No education records added yet"}</p>
        )}
      </div>

      {/* Education Modal */}
      <Dialog open={showEducationModal} onOpenChange={setShowEducationModal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isAr ? "إضافة مؤهل" : "Add Education"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={isAr ? "الدرجة العلمية" : "Degree"}
              value={educationForm.degree}
              onChange={(e) => setEducationForm((prev) => ({ ...prev, degree: e.target.value }))}
            />
            <Input
              placeholder={isAr ? "الجامعة/المؤسسة" : "Institution"}
              value={educationForm.institution}
              onChange={(e) => setEducationForm((prev) => ({ ...prev, institution: e.target.value }))}
            />
            <Input
              placeholder={isAr ? "مجال الدراسة" : "Field of Study"}
              value={educationForm.field_of_study}
              onChange={(e) => setEducationForm((prev) => ({ ...prev, field_of_study: e.target.value }))}
            />
            <div>
              <label className="text-sm font-medium">{isAr ? "تاريخ البداية" : "Start Date"}</label>
              <Input
                type="date"
                value={educationForm.start_date}
                onChange={(e) => setEducationForm((prev) => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{isAr ? "تاريخ النهاية" : "End Date"}</label>
              <Input
                type="date"
                value={educationForm.end_date || ""}
                onChange={(e) => setEducationForm((prev) => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <Input
              placeholder={isAr ? "التقدير (%)" : "Grade (%)"}
              type="number"
              value={educationForm.grade || ""}
              onChange={(e) => setEducationForm((prev) => ({ ...prev, grade: e.target.value }))}
            />
            <div>
              <label className="text-sm font-medium">{isAr ? "وثيقة الشهادة" : "Certificate Document"}</label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setEducationDocument(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowEducationModal(false)} variant="outline">
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleAddEducation} className="bg-[#006EA8]">
              {isAr ? "إضافة" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Work Experience Section */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">{isAr ? "الخبرات العملية" : "Work Experience"}</h2>
          <button 
            onClick={() => setShowExperienceModal(true)}
            className="px-4 py-2 bg-[#006EA8] text-white text-xs sm:text-sm rounded-full hover:bg-[#005685] transition"
            title={isAr ? "اضف خبرة جديدة" : "Add new experience"}
          >
            {isAr ? "اضف جديد" : "Add New"}
          </button>
        </div>

        {portfolio.experiences && portfolio.experiences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] relative"
              >
                <button
                  onClick={() => handleRemoveExperience(exp.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl"
                  title={isAr ? "حذف" : "Delete"}
                >
                  ×
                </button>
                <h3 className="font-bold text-[#111827] pr-6">{exp.job_title}</h3>
                <p className="text-sm text-[#6B7280] mt-1">{exp.company}</p>
                <p className="text-xs text-[#9CA3AF] mt-2">
                  {new Date(exp.start_date).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  {exp.is_current
                    ? `- ${isAr ? "الحالي" : "Present"}`
                    : exp.end_date
                      ? `- ${new Date(exp.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                      : ""}
                </p>
                {exp.location && (
                  <p className="text-xs text-[#6B7280] mt-2">{exp.location}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6B7280]">{isAr ? "لا توجد خبرات عملية" : "No work experience added yet"}</p>
        )}
      </div>

      {/* Work Experience Modal */}
      <Dialog open={showExperienceModal} onOpenChange={setShowExperienceModal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isAr ? "إضافة خبرة عملية" : "Add Work Experience"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={isAr ? "المسمى الوظيفي" : "Job Title"}
              value={experienceForm.job_title}
              onChange={(e) => setExperienceForm((prev) => ({ ...prev, job_title: e.target.value }))}
            />
            <Input
              placeholder={isAr ? "اسم الشركة" : "Company Name"}
              value={experienceForm.company}
              onChange={(e) => setExperienceForm((prev) => ({ ...prev, company: e.target.value }))}
            />
            <Input
              placeholder={isAr ? "الموقع" : "Location"}
              value={experienceForm.location || ""}
              onChange={(e) => setExperienceForm((prev) => ({ ...prev, location: e.target.value }))}
            />
            <div>
              <label className="text-sm font-medium">{isAr ? "تاريخ البداية" : "Start Date"}</label>
              <Input
                type="date"
                value={experienceForm.start_date}
                onChange={(e) => setExperienceForm((prev) => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{isAr ? "تاريخ النهاية" : "End Date"}</label>
              <Input
                type="date"
                value={experienceForm.end_date || ""}
                onChange={(e) => setExperienceForm((prev) => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={experienceForm.is_current || false}
                onChange={(e) => setExperienceForm((prev) => ({ ...prev, is_current: e.target.checked }))}
              />
              <span className="text-sm">{isAr ? "أعمل هنا حالياً" : "Currently Working Here"}</span>
            </label>
            <Textarea
              placeholder={isAr ? "الوصف/المسؤوليات" : "Description/Responsibilities"}
              value={experienceForm.description || ""}
              onChange={(e) => setExperienceForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowExperienceModal(false)} variant="outline">
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleAddExperience} className="bg-[#006EA8]">
              {isAr ? "إضافة" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skills Section */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">{isAr ? "المهارات" : "Skills"}</h2>
          <button 
            onClick={() => setShowSkillModal(true)}
            className="px-4 py-2 bg-[#006EA8] text-white text-xs sm:text-sm rounded-full hover:bg-[#005685] transition"
            title={isAr ? "اضف مهارة جديدة" : "Add new skill"}
          >
            {isAr ? "اضف جديد" : "Add New"}
          </button>
        </div>

        {portfolio.skills && portfolio.skills.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {portfolio.skills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-2">
                <span className="px-4 py-2 rounded-full border border-[#006EA8] text-[#006EA8] text-sm font-medium hover:bg-[#F0F9FF] transition">
                  {skill.name}
                </span>
                <button
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="text-red-500 hover:text-red-700 text-lg leading-none"
                  title={isAr ? "حذف" : "Delete"}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6B7280]">{isAr ? "لا توجد مهارات" : "No skills added yet"}</p>
        )}
      </div>

      {/* Skills Modal */}
      <Dialog open={showSkillModal} onOpenChange={setShowSkillModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "إضافة مهارة" : "Add Skill"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={isAr ? "اسم المهارة" : "Skill name"}
              value={skillForm.name}
              onChange={(e) => setSkillForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSkillModal(false)} variant="outline">
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleAddSkill} className="bg-[#006EA8]">
              {isAr ? "إضافة" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
