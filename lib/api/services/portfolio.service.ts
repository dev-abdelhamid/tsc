// lib/api/services/portfolio.service.ts
import { api } from "../client"
import type { ApiResponse, UserPortfolio, Education, Experience, Language, Skill } from "../types"

// واجهة مطابقة لاستجابة API الفعلية من Postman
export interface PortfolioAPIResponse {
  id?: number
  cv?: string | null
  education?: EducationAPI[]
  workExperience?: ExperienceAPI[]
  skills?: SkillAPI[]
  languages?: LanguageAPI[]
}

export interface EducationAPI {
  id?: number
  university: string
  level_of_education: "high_school" | "bachelor" | "master" | "phd"
  graduation_year: string
  specialization: string
  final_grade: "excellent" | "very_good" | "good" | "pass"
  attachment?: string
}

export interface ExperienceAPI {
  id?: number
  company_name: string
  department: string
  start_date: string
  end_date?: string
  currently_working?: boolean
  responsibilities?: string
  attachment?: string
}

export interface SkillAPI {
  id?: number
  skill_name: string
}

export interface LanguageAPI {
  id?: number
  language: string
  level: "beginner" | "intermediate" | "fluent" | "native"
}

/**
 * تحويل البيانات من API إلى واجهة UserPortfolio المستخدمة في التطبيق
 */
function convertToUserPortfolio(apiData: PortfolioAPIResponse): UserPortfolio {
  // تحويل التعليم
  const educations: Education[] = (apiData.education || []).map(edu => ({
    id: edu.id || 0,
    degree: edu.level_of_education,
    institution: edu.university,
    field_of_study: edu.specialization,
    start_date: `${edu.graduation_year}-01-01`,
    end_date: `${edu.graduation_year}-12-31`,
    grade: edu.final_grade === "excellent" ? 90 : 
            edu.final_grade === "very_good" ? 80 :
            edu.final_grade === "good" ? 70 : 60,
    description: edu.specialization,
    document_url: edu.attachment
  }))

  // تحويل الخبرات
  const experiences: Experience[] = (apiData.workExperience || []).map(exp => ({
    id: exp.id || 0,
    job_title: exp.department,
    company: exp.company_name,
    start_date: exp.start_date,
    end_date: exp.end_date,
    is_current: exp.currently_working,
    description: exp.responsibilities,
    location: ""
  }))

  // تحويل المهارات
  const skills: Skill[] = (apiData.skills || []).map(skill => ({
    id: skill.id || 0,
    name: skill.skill_name
  }))

  // تحويل اللغات
  const languages: Language[] = (apiData.languages || []).map(lang => ({
    id: lang.id || 0,
    name: lang.language,
    proficiency: lang.level
  }))

  return {
    cv_url: apiData.cv || undefined,
    educations,
    experiences,
    skills,
    languages
  }
}

/**
 * تحويل البيانات من واجهة التطبيق إلى صيغة API
 */
function convertToAPIFormat(portfolio: UserPortfolio): {
  education: EducationAPI[]
  workExperience: ExperienceAPI[]
  skills: SkillAPI[]
  languages: LanguageAPI[]
} {
  // تحويل التعليم
  const education: EducationAPI[] = (portfolio.educations || []).map(edu => ({
    id: edu.id,
    university: edu.institution,
    level_of_education: (edu.degree as any) || "bachelor",
    graduation_year: edu.start_date ? new Date(edu.start_date).getFullYear().toString() : new Date().getFullYear().toString(),
    specialization: edu.field_of_study || "",
    final_grade: edu.grade ? 
      edu.grade >= 85 ? "excellent" :
      edu.grade >= 75 ? "very_good" :
      edu.grade >= 65 ? "good" : "pass" : "good"
  }))

  // تحويل الخبرات
  const workExperience: ExperienceAPI[] = (portfolio.experiences || []).map(exp => ({
    id: exp.id,
    company_name: exp.company,
    department: exp.job_title,
    start_date: exp.start_date,
    end_date: exp.end_date,
    currently_working: exp.is_current,
    responsibilities: exp.description
  }))

  // تحويل المهارات
  const skills: SkillAPI[] = (portfolio.skills || []).map(skill => ({
    id: skill.id,
    skill_name: skill.name
  }))

  // تحويل اللغات
  const languages: LanguageAPI[] = (portfolio.languages || []).map(lang => ({
    id: lang.id,
    language: lang.name,
    level: lang.proficiency
  }))

  return { education, workExperience, skills, languages }
}

/**
 * جلب بيانات البورتفوليو من API
 * GET /portfolio
 */
export async function getUserPortfolio(
  token: string,
  locale = "ar"
): Promise<UserPortfolio> {
  try {
    const response = await api.get<ApiResponse<PortfolioAPIResponse>>(
      "/portfolio",
      { token, locale, cache: "no-store", timeout: 15000 }
    )
    const apiData = response.data || {}
    return convertToUserPortfolio(apiData)
  } catch (error) {
    console.error("[getUserPortfolio] Error:", error)
    return {}
  }
}

/**
 * حفظ بيانات البورتفوليو إلى API
 * POST /portfolio
 */
export async function savePortfolio(
  portfolio: UserPortfolio,
  token: string,
  locale = "ar",
  cvFile?: File
): Promise<UserPortfolio> {
  try {
    const formData = new FormData()
    
    // إضافة ملف السيرة الذاتية إذا وجد
    if (cvFile) {
      formData.append("cv", cvFile)
    }
    
    // تحويل البيانات إلى صيغة API
    const apiData = convertToAPIFormat(portfolio)
    
    // إضافة التعليم
    apiData.education.forEach((edu, idx) => {
      formData.append(`education[${idx}][university]`, edu.university)
      formData.append(`education[${idx}][level_of_education]`, edu.level_of_education)
      formData.append(`education[${idx}][graduation_year]`, edu.graduation_year)
      formData.append(`education[${idx}][specialization]`, edu.specialization)
      formData.append(`education[${idx}][final_grade]`, edu.final_grade)
      if (edu.id) formData.append(`education[${idx}][id]`, String(edu.id))
    })
    
    // إضافة الخبرات
    apiData.workExperience.forEach((exp, idx) => {
      formData.append(`work_experience[${idx}][company_name]`, exp.company_name)
      formData.append(`work_experience[${idx}][department]`, exp.department)
      formData.append(`work_experience[${idx}][start_date]`, exp.start_date)
      if (exp.end_date) formData.append(`work_experience[${idx}][end_date]`, exp.end_date)
      if (exp.responsibilities) formData.append(`work_experience[${idx}][responsibilities]`, exp.responsibilities)
      if (exp.currently_working) formData.append(`work_experience[${idx}][currently_working]`, "1")
      if (exp.id) formData.append(`work_experience[${idx}][id]`, String(exp.id))
    })
    
    // إضافة المهارات
    apiData.skills.forEach((skill, idx) => {
      formData.append(`skills[${idx}][skill_name]`, skill.skill_name)
      if (skill.id) formData.append(`skills[${idx}][id]`, String(skill.id))
    })
    
    // إضافة اللغات
    apiData.languages.forEach((lang, idx) => {
      formData.append(`languages[${idx}][language]`, lang.language)
      formData.append(`languages[${idx}][level]`, lang.level)
      if (lang.id) formData.append(`languages[${idx}][id]`, String(lang.id))
    })
    
    const response = await api.post<ApiResponse<PortfolioAPIResponse>>(
      "/portfolio",
      formData,
      { token, locale, isFormData: true }
    )
    
    const apiResponse = response.data || {}
    return convertToUserPortfolio(apiResponse)
  } catch (error) {
    console.error("[savePortfolio] Error:", error)
    throw error
  }
}