"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { X, Plus, Upload } from "lucide-react"
import type { Job, UserPortfolio, Language, Experience, Education, Skill } from "@/lib/api/types"

type JobApplicationClientProps = {
  jobId: number
  locale: string
  job: Job
  initialPortfolio?: UserPortfolio
  token: string
}

interface FormState {
  languages: Language[]
  experiences: Experience[]
  skills: Skill[]
  educations: Education[]
  newLanguage: { name: string; proficiency: string }
  newExperience: { job_title: string; company: string; start_date: string; end_date?: string; description?: string }
  newSkill: { name: string }
  newEducation: { degree: string; institution: string; field_of_study: string; start_date: string; end_date?: string; grade?: number; description?: string }
  educationFiles: Record<number, File>
}

export default function JobApplicationClient({
  jobId,
  locale,
  job,
  initialPortfolio,
  token,
}: JobApplicationClientProps) {
  const t = useTranslations()
  const router = useRouter()
  const isAr = locale === "ar"
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formState, setFormState] = useState<FormState>({
    languages: initialPortfolio?.languages || [],
    experiences: initialPortfolio?.experiences || [],
    skills: initialPortfolio?.skills || [],
    educations: initialPortfolio?.educations || [],
    newLanguage: { name: "", proficiency: "beginner" },
    newExperience: { job_title: "", company: "", start_date: "" },
    newSkill: { name: "" },
    newEducation: { degree: "", institution: "", field_of_study: "", start_date: "" },
    educationFiles: {},
  })

  const getJobTitle = useCallback((job: Job) => {
    if (typeof job.title === "string") return job.title
    if (typeof job.title === "object" && job.title) {
      return job.title[locale as keyof typeof job.title] || job.title.en || job.title.ar || ""
    }
    return ""
  }, [locale])

  // Add language
  const addLanguage = () => {
    if (!formState.newLanguage.name.trim()) {
      toast.error(isAr ? "أدخل اسم اللغة" : "Enter language name")
      return
    }
    setFormState({
      ...formState,
      languages: [...formState.languages, { id: Date.now(), ...formState.newLanguage } as Language],
      newLanguage: { name: "", proficiency: "beginner" },
    })
  }

  // Remove language
  const removeLanguage = (id: number) => {
    setFormState({
      ...formState,
      languages: formState.languages.filter((l) => l.id !== id),
    })
  }

  // Add experience
  const addExperience = () => {
    if (!formState.newExperience.job_title.trim() || !formState.newExperience.company.trim()) {
      toast.error(isAr ? "أدخل عنوان الوظيفة والشركة" : "Enter job title and company")
      return
    }
    setFormState({
      ...formState,
      experiences: [
        ...formState.experiences,
        { id: Date.now(), ...formState.newExperience } as Experience,
      ],
      newExperience: { job_title: "", company: "", start_date: "" },
    })
  }

  // Remove experience
  const removeExperience = (id: number) => {
    setFormState({
      ...formState,
      experiences: formState.experiences.filter((e) => e.id !== id),
    })
  }

  // Add skill
  const addSkill = () => {
    if (!formState.newSkill.name.trim()) {
      toast.error(isAr ? "أدخل اسم المهارة" : "Enter skill name")
      return
    }
    setFormState({
      ...formState,
      skills: [...formState.skills, { id: Date.now(), ...formState.newSkill } as Skill],
      newSkill: { name: "" },
    })
  }

  // Remove skill
  const removeSkill = (id: number) => {
    setFormState({
      ...formState,
      skills: formState.skills.filter((s) => s.id !== id),
    })
  }

  // Add education
  const addEducation = () => {
    if (!formState.newEducation.degree.trim() || !formState.newEducation.institution.trim()) {
      toast.error(isAr ? "أدخل الدرجة والمؤسسة" : "Enter degree and institution")
      return
    }
    setFormState({
      ...formState,
      educations: [
        ...formState.educations,
        { id: Date.now(), ...formState.newEducation } as Education,
      ],
      newEducation: { degree: "", institution: "", field_of_study: "", start_date: "" },
    })
  }

  // Remove education
  const removeEducation = (id: number) => {
    setFormState({
      ...formState,
      educations: formState.educations.filter((e) => e.id !== id),
      educationFiles: Object.fromEntries(
        Object.entries(formState.educationFiles).filter(([key]) => key !== String(id))
      ),
    })
  }

  // Handle file upload
  const handleEducationFileUpload = (id: number, file: File | null) => {
    if (file) {
      setFormState({
        ...formState,
        educationFiles: { ...formState.educationFiles, [id]: file },
      })
    }
  }

  // Submit application
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formState.languages.length === 0) {
      toast.error(isAr ? "أضف حد أدنى لغة واحدة" : "Add at least one language")
      return
    }

    if (formState.experiences.length === 0) {
      toast.error(isAr ? "أضف حد أدنى خبرة واحدة" : "Add at least one experience")
      return
    }

    if (formState.skills.length === 0) {
      toast.error(isAr ? "أضف حد أدنى مهارة واحدة" : "Add at least one skill")
      return
    }

    if (formState.educations.length === 0) {
      toast.error(isAr ? "أضف حد أدنى تعليم واحد" : "Add at least one education")
      return
    }

    setSubmitting(true)
    const toastId = toast.loading(isAr ? "جاري التقديم..." : "Submitting...")

    try {
      const formData = new FormData()

      // Add languages
      formState.languages.forEach((lang, idx) => {
        formData.append(`languages[${idx}][name]`, lang.name)
        formData.append(`languages[${idx}][proficiency]`, lang.proficiency)
      })

      // Add experiences
      formState.experiences.forEach((exp, idx) => {
        formData.append(`work_experience[${idx}][job_title]`, exp.job_title)
        formData.append(`work_experience[${idx}][company]`, exp.company)
        formData.append(`work_experience[${idx}][start_date]`, exp.start_date)
        if (exp.end_date) formData.append(`work_experience[${idx}][end_date]`, exp.end_date)
        if (exp.description) formData.append(`work_experience[${idx}][description]`, exp.description)
      })

      // Add skills
      formState.skills.forEach((skill, idx) => {
        formData.append(`skills[${idx}][name]`, skill.name)
      })

      // Add educations
      formState.educations.forEach((edu, idx) => {
        formData.append(`education[${idx}][degree]`, edu.degree)
        formData.append(`education[${idx}][institution]`, edu.institution)
        formData.append(`education[${idx}][field_of_study]`, edu.field_of_study)
        formData.append(`education[${idx}][start_date]`, edu.start_date)
        if (edu.end_date) formData.append(`education[${idx}][end_date]`, edu.end_date)
        if (edu.grade) formData.append(`education[${idx}][grade]`, String(edu.grade))
        if (edu.description) formData.append(`education[${idx}][description]`, edu.description)

        // Add file if exists
        const file = formState.educationFiles[edu.id]
        if (file) {
          formData.append(`education[${idx}][document]`, file)
        }
      })

      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        body: formData,
        headers: { "x-locale": locale },
      })

      if (res.status === 401 || res.status === 403) {
        toast.dismiss(toastId)
        toast.error(isAr ? "يجب تسجيل الدخول أولاً" : "Please log in first")
        router.push("/sign-in")
        return
      }

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.message || (isAr ? "فشل التقديم" : "Failed to apply"))
      }

      toast.dismiss(toastId)
      toast.success(data?.message || (isAr ? "تم التقديم بنجاح" : "Application submitted successfully"))

      // Redirect to my applications
      setTimeout(() => {
        router.push("/dashboard/user/applications")
      }, 1500)
    } catch (err: any) {
      toast.dismiss(toastId)
      toast.error(err?.message || (isAr ? "حدث خطأ" : "Error occurred"))
      console.error("Application error:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 bg-white">
      <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Job Header */}
        <div className="mb-8 rounded-lg bg-gradient-to-r from-[#006EA8] to-[#005685] p-6 text-white">
          <h1 className="text-2xl font-bold sm:text-3xl">{getJobTitle(job)}</h1>
          <p className="mt-2 text-sm opacity-90">
            {job.company?.name && `${job.company.name} • `}
            {job.state}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Languages Section */}
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#111827]">
                {isAr ? "اللغات" : "Languages"}
              </h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {formState.languages.length}
              </span>
            </div>

            <div className="space-y-3">
              {formState.languages.map((lang) => (
                <div key={lang.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div>
                    <p className="font-medium text-[#111827]">{lang.name}</p>
                    <p className="text-sm text-gray-500">{lang.proficiency}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLanguage(lang.id)}
                    className="text-red-600 hover:text-red-800"
                    title={isAr ? "إزالة" : "Remove"}
                    aria-label={isAr ? "إزالة اللغة" : "Remove language"}
                  >
                    <X className="size-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder={isAr ? "اسم اللغة" : "Language name"}
                  value={formState.newLanguage.name}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      newLanguage: { ...formState.newLanguage, name: e.target.value },
                    })
                  }
                />
                <select
                  value={formState.newLanguage.proficiency}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      newLanguage: { ...formState.newLanguage, proficiency: e.target.value },
                    })
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  title={isAr ? "مستوى اللغة" : "Language proficiency"}
                  aria-label={isAr ? "مستوى اللغة" : "Language proficiency"}
                >
                  <option value="beginner">{isAr ? "مبتدئ" : "Beginner"}</option>
                  <option value="intermediate">{isAr ? "متوسط" : "Intermediate"}</option>
                  <option value="fluent">{isAr ? "محادثة" : "Fluent"}</option>
                  <option value="native">{isAr ? "لغة أم" : "Native"}</option>
                </select>
              </div>
              <Button
                type="button"
                onClick={addLanguage}
                variant="outline"
                className="w-full"
              >
                <Plus className="mr-2 size-4" />
                {isAr ? "إضافة لغة" : "Add Language"}
              </Button>
            </div>
          </Card>

          {/* Skills Section */}
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#111827]">
                {isAr ? "المهارات" : "Skills"}
              </h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {formState.skills.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {formState.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1"
                >
                  <span className="text-sm font-medium text-blue-800">{skill.name}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill.id)}
                    className="text-blue-600 hover:text-blue-800"
                    title={isAr ? "إزالة" : "Remove"}
                    aria-label={isAr ? "إزالة المهارة" : "Remove skill"}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-4">
              <Input
                placeholder={isAr ? "أدخل المهارة" : "Enter skill"}
                value={formState.newSkill.name}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    newSkill: { name: e.target.value },
                  })
                }
              />
              <Button
                type="button"
                onClick={addSkill}
                variant="outline"
                className="w-full"
              >
                <Plus className="mr-2 size-4" />
                {isAr ? "إضافة مهارة" : "Add Skill"}
              </Button>
            </div>
          </Card>

          {/* Experience Section */}
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#111827]">
                {isAr ? "الخبرات العملية" : "Work Experience"}
              </h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {formState.experiences.length}
              </span>
            </div>

            <div className="space-y-3">
              {formState.experiences.map((exp) => (
                <div key={exp.id} className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-[#111827]">{exp.job_title}</p>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {exp.start_date}
                        {exp.end_date && ` - ${exp.end_date}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="text-red-600 hover:text-red-800"
                      title={isAr ? "إزالة" : "Remove"}
                      aria-label={isAr ? "إزالة الخبرة" : "Remove experience"}
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-4">
              <Input
                placeholder={isAr ? "عنوان الوظيفة" : "Job title"}
                value={formState.newExperience.job_title}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    newExperience: { ...formState.newExperience, job_title: e.target.value },
                  })
                }
              />
              <Input
                placeholder={isAr ? "اسم الشركة" : "Company name"}
                value={formState.newExperience.company}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    newExperience: { ...formState.newExperience, company: e.target.value },
                  })
                }
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  type="date"
                  value={formState.newExperience.start_date}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      newExperience: { ...formState.newExperience, start_date: e.target.value },
                    })
                  }
                />
                <Input
                  type="date"
                  value={formState.newExperience.end_date || ""}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      newExperience: { ...formState.newExperience, end_date: e.target.value },
                    })
                  }
                  placeholder={isAr ? "تاريخ الانتهاء (اختياري)" : "End date (optional)"}
                />
              </div>
              <Button
                type="button"
                onClick={addExperience}
                variant="outline"
                className="w-full"
              >
                <Plus className="mr-2 size-4" />
                {isAr ? "إضافة خبرة" : "Add Experience"}
              </Button>
            </div>
          </Card>

          {/* Education Section */}
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#111827]">
                {isAr ? "المؤهلات التعليمية" : "Education"}
              </h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {formState.educations.length}
              </span>
            </div>

            <div className="space-y-3">
              {formState.educations.map((edu) => (
                <div key={edu.id} className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-[#111827]">{edu.degree}</p>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {edu.start_date}
                        {edu.end_date && ` - ${edu.end_date}`}
                      </p>
                      {formState.educationFiles[edu.id] && (
                        <p className="text-xs text-green-600 mt-2">
                          📎 {formState.educationFiles[edu.id].name}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEducation(edu.id)}
                      className="text-red-600 hover:text-red-800"
                      title={isAr ? "إزالة" : "Remove"}
                      aria-label={isAr ? "إزالة التعليم" : "Remove education"}
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-4">
              <Input
                placeholder={isAr ? "الدرجة العلمية" : "Degree"}
                value={formState.newEducation.degree}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    newEducation: { ...formState.newEducation, degree: e.target.value },
                  })
                }
              />
              <Input
                placeholder={isAr ? "المؤسسة التعليمية" : "Institution"}
                value={formState.newEducation.institution}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    newEducation: { ...formState.newEducation, institution: e.target.value },
                  })
                }
              />
              <Input
                placeholder={isAr ? "مجال الدراسة" : "Field of study"}
                value={formState.newEducation.field_of_study}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    newEducation: { ...formState.newEducation, field_of_study: e.target.value },
                  })
                }
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  type="date"
                  value={formState.newEducation.start_date}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      newEducation: { ...formState.newEducation, start_date: e.target.value },
                    })
                  }
                />
                <Input
                  type="date"
                  value={formState.newEducation.end_date || ""}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      newEducation: { ...formState.newEducation, end_date: e.target.value },
                    })
                  }
                  placeholder={isAr ? "تاريخ الانتهاء (اختياري)" : "End date (optional)"}
                />
              </div>
              <Button
                type="button"
                onClick={addEducation}
                variant="outline"
                className="w-full"
              >
                <Plus className="mr-2 size-4" />
                {isAr ? "إضافة تعليم" : "Add Education"}
              </Button>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-br from-[#006EA8] to-[#005685] text-white hover:opacity-95"
            >
              {submitting ? (isAr ? "جاري التقديم..." : "Submitting...") : (isAr ? "تقديم الطلب" : "Submit Application")}
            </Button>
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="flex-1"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
