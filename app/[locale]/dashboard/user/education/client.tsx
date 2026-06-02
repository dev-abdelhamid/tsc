"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Download } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  locale: string;
  initialPortfolio?: any;
};

// API expected formats
type LanguageForm = { language: string; level: "beginner" | "intermediate" | "fluent" | "native" };
type EducationForm = { 
  university: string; 
  level_of_education: "high_school" | "bachelor" | "master" | "phd"; 
  graduation_year: string; 
  specialization: string; 
  final_grade: "excellent" | "very_good" | "good" | "pass";
  attachment?: File;
  id?: number;
};
type ExperienceForm = { 
  company_name: string; 
  department: string; 
  start_date: string; 
  end_date?: string; 
  currently_working?: boolean; 
  responsibilities?: string;
  attachment?: File;
  id?: number;
};
type SkillForm = { skill_name: string; id?: number };

export default function UserEducationClient({ locale, initialPortfolio }: Props) {
  // State直接用API返回的格式
  const [cv, setCv] = useState<string | null>(null);
  const [languages, setLanguages] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  
  // Form states
  const [languageForm, setLanguageForm] = useState<LanguageForm>({ language: "", level: "beginner" });
  const [educationForm, setEducationForm] = useState<EducationForm>({ 
    university: "", 
    level_of_education: "bachelor", 
    graduation_year: new Date().getFullYear().toString(),
    specialization: "",
    final_grade: "good"
  });
  const [experienceForm, setExperienceForm] = useState<ExperienceForm>({ 
    company_name: "", 
    department: "", 
    start_date: "",
    currently_working: false
  });
  const [skillForm, setSkillForm] = useState<SkillForm>({ skill_name: "" });
  
  const [educationFile, setEducationFile] = useState<File | null>(null);
  const [experienceFile, setExperienceFile] = useState<File | null>(null);

  const isAr = locale === "ar";

  // تحميل البيانات من API
  useEffect(() => {
    let mounted = true;
    async function loadPortfolio() {
      try {
        setLoading(true);
        const res = await fetch("/api/user/portfolio", { 
          headers: { "x-locale": locale } 
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || "Failed to load portfolio data");
        
        // API returns: { success, message, data: { id, cv, education, workExperience, skills, languages } }
        const portfolioData = data.data || data;
        
        if (mounted) {
          setCv(portfolioData.cv || null);
          setLanguages(portfolioData.languages || []);
          setEducations(portfolioData.education || portfolioData.educations || []);
          setExperiences(portfolioData.workExperience || portfolioData.experiences || []);
          setSkills(portfolioData.skills || []);
          
          console.log("[Load] Languages:", portfolioData.languages?.length || 0);
          console.log("[Load] Education:", portfolioData.education?.length || 0);
          console.log("[Load] WorkExperience:", portfolioData.workExperience?.length || 0);
          console.log("[Load] Skills:", portfolioData.skills?.length || 0);
        }
      } catch (err) {
        if (mounted) {
          console.error("[Load] Error:", err);
          toast.error(isAr ? "فشل تحميل البيانات" : "Failed to load data");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    if (initialPortfolio && Object.keys(initialPortfolio).length > 0) {
      const portfolioData = initialPortfolio.data || initialPortfolio;
      setCv(portfolioData.cv || null);
      setLanguages(portfolioData.languages || []);
      setEducations(portfolioData.education || portfolioData.educations || []);
      setExperiences(portfolioData.workExperience || portfolioData.experiences || []);
      setSkills(portfolioData.skills || []);
      setLoading(false);
    } else {
      loadPortfolio();
    }
    
    return () => {
      mounted = false;
    };
  }, [initialPortfolio, locale, isAr]);

  // حفظ البيانات إلى API - المعدل لإرسال المصفوفات الفارغة
  const savePortfolio = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      
      // إضافة التعليم - دائماً (حتى لو فارغ)
      if (educations.length === 0) {
        // إرسال تعليم فارغ - API يتوقع مصفوفة
        formData.append("education", JSON.stringify([]));
      } else {
        educations.forEach((edu, idx) => {
          formData.append(`education[${idx}][university]`, edu.university);
          formData.append(`education[${idx}][level_of_education]`, edu.level_of_education);
          formData.append(`education[${idx}][graduation_year]`, edu.graduation_year);
          formData.append(`education[${idx}][specialization]`, edu.specialization || "");
          formData.append(`education[${idx}][final_grade]`, edu.final_grade);
          if (edu.id) formData.append(`education[${idx}][id]`, String(edu.id));
          if (idx === educations.length - 1 && educationFile) {
            formData.append(`education[${idx}][attachment]`, educationFile);
          }
        });
      }
      
      // إضافة الخبرات - دائماً (حتى لو فارغ)
      if (experiences.length === 0) {
        formData.append("work_experience", JSON.stringify([]));
      } else {
        experiences.forEach((exp, idx) => {
          formData.append(`work_experience[${idx}][company_name]`, exp.company_name);
          formData.append(`work_experience[${idx}][department]`, exp.department);
          formData.append(`work_experience[${idx}][start_date]`, exp.start_date);
          if (exp.end_date) formData.append(`work_experience[${idx}][end_date]`, exp.end_date);
          if (exp.responsibilities) formData.append(`work_experience[${idx}][responsibilities]`, exp.responsibilities);
          if (exp.currently_working) formData.append(`work_experience[${idx}][currently_working]`, "1");
          if (exp.id) formData.append(`work_experience[${idx}][id]`, String(exp.id));
          if (idx === experiences.length - 1 && experienceFile) {
            formData.append(`work_experience[${idx}][attachment]`, experienceFile);
          }
        });
      }
      
      // إضافة المهارات - دائماً (حتى لو فارغ)
      if (skills.length === 0) {
        formData.append("skills", JSON.stringify([]));
      } else {
        skills.forEach((skill, idx) => {
          formData.append(`skills[${idx}][skill_name]`, skill.skill_name);
          if (skill.id) formData.append(`skills[${idx}][id]`, String(skill.id));
        });
      }
      
      // إضافة اللغات - دائماً (حتى لو فارغ)
      if (languages.length === 0) {
        formData.append("languages", JSON.stringify([]));
      } else {
        languages.forEach((lang, idx) => {
          formData.append(`languages[${idx}][language]`, lang.language);
          formData.append(`languages[${idx}][level]`, lang.level);
          if (lang.id) formData.append(`languages[${idx}][id]`, String(lang.id));
        });
      }
      
      console.log("[Save] Languages:", languages.length, "Education:", educations.length, "Experience:", experiences.length, "Skills:", skills.length);
      
      const res = await fetch("/api/user/portfolio", {
        method: "POST",
        body: formData,
        headers: { "x-locale": locale },
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        const errorMessage = data.message || data.errors?.join(", ") || "Failed to save";
        throw new Error(errorMessage);
      }
      
      // تحديث البيانات من الاستجابة
      const savedData = data.data || data;
      setCv(savedData.cv || null);
      setLanguages(savedData.languages || []);
      setEducations(savedData.education || savedData.educations || []);
      setExperiences(savedData.workExperience || savedData.experiences || []);
      setSkills(savedData.skills || []);
      
      setEducationFile(null);
      setExperienceFile(null);
      
      toast.success(isAr ? "تم الحفظ بنجاح" : "Saved successfully");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save";
      console.error("[Save] Error:", message);
      toast.error(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // رفع السيرة الذاتية - المعدل
  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("cv", file);
      
      // إرسال جميع البيانات الموجودة (أو فارغة)
      if (educations.length === 0) {
        formData.append("education", JSON.stringify([]));
      } else {
        educations.forEach((edu, idx) => {
          formData.append(`education[${idx}][university]`, edu.university);
          formData.append(`education[${idx}][level_of_education]`, edu.level_of_education);
          formData.append(`education[${idx}][graduation_year]`, edu.graduation_year);
          formData.append(`education[${idx}][specialization]`, edu.specialization || "");
          formData.append(`education[${idx}][final_grade]`, edu.final_grade);
          if (edu.id) formData.append(`education[${idx}][id]`, String(edu.id));
        });
      }
      
      if (experiences.length === 0) {
        formData.append("work_experience", JSON.stringify([]));
      } else {
        experiences.forEach((exp, idx) => {
          formData.append(`work_experience[${idx}][company_name]`, exp.company_name);
          formData.append(`work_experience[${idx}][department]`, exp.department);
          formData.append(`work_experience[${idx}][start_date]`, exp.start_date);
          if (exp.end_date) formData.append(`work_experience[${idx}][end_date]`, exp.end_date);
          if (exp.responsibilities) formData.append(`work_experience[${idx}][responsibilities]`, exp.responsibilities);
          if (exp.currently_working) formData.append(`work_experience[${idx}][currently_working]`, "1");
          if (exp.id) formData.append(`work_experience[${idx}][id]`, String(exp.id));
        });
      }
      
      if (skills.length === 0) {
        formData.append("skills", JSON.stringify([]));
      } else {
        skills.forEach((skill, idx) => {
          formData.append(`skills[${idx}][skill_name]`, skill.skill_name);
          if (skill.id) formData.append(`skills[${idx}][id]`, String(skill.id));
        });
      }
      
      if (languages.length === 0) {
        formData.append("languages", JSON.stringify([]));
      } else {
        languages.forEach((lang, idx) => {
          formData.append(`languages[${idx}][language]`, lang.language);
          formData.append(`languages[${idx}][level]`, lang.level);
          if (lang.id) formData.append(`languages[${idx}][id]`, String(lang.id));
        });
      }
      
      const res = await fetch("/api/user/portfolio", {
        method: "POST",
        body: formData,
        headers: { "x-locale": locale },
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload CV");
      
      const savedData = data.data || data;
      setCv(savedData.cv || null);
      toast.success(isAr ? "تم رفع السيرة الذاتية بنجاح" : "CV uploaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (isAr ? "فشل رفع السيرة الذاتية" : "Failed to upload CV"));
    } finally {
      setUploading(false);
    }
  };

  // باقي الدوال كما هي (handleAddLanguage, handleAddEducation, etc.)
  // إضافة لغة
  const handleAddLanguage = async () => {
    if (!languageForm.language || !languageForm.level) {
      toast.error(isAr ? "يرجى ملء جميع الحقول" : "Please fill all fields");
      return;
    }
    
    const newLanguage = { 
      id: Date.now(), 
      language: languageForm.language, 
      level: languageForm.level 
    };
    setLanguages([...languages, newLanguage]);
    setLanguageForm({ language: "", level: "beginner" });
    setShowLanguageModal(false);
    await savePortfolio();
  };

  // إضافة مؤهل علمي
  const handleAddEducation = async () => {
    if (!educationForm.university || !educationForm.level_of_education || !educationForm.graduation_year) {
      toast.error(isAr ? "يرجى ملء الحقول المطلوبة" : "Please fill required fields");
      return;
    }
    
    const newEducation: any = {
      id: Date.now(),
      university: educationForm.university,
      level_of_education: educationForm.level_of_education,
      graduation_year: educationForm.graduation_year,
      specialization: educationForm.specialization,
      final_grade: educationForm.final_grade,
    };
    
    setEducations([...educations, newEducation]);
    setEducationForm({ 
      university: "", 
      level_of_education: "bachelor", 
      graduation_year: new Date().getFullYear().toString(),
      specialization: "",
      final_grade: "good"
    });
    setShowEducationModal(false);
    await savePortfolio();
  };

  // إضافة خبرة عملية
  const handleAddExperience = async () => {
    if (!experienceForm.company_name || !experienceForm.department || !experienceForm.start_date) {
      toast.error(isAr ? "يرجى ملء الحقول المطلوبة" : "Please fill required fields");
      return;
    }
    
    const newExperience: any = {
      id: Date.now(),
      company_name: experienceForm.company_name,
      department: experienceForm.department,
      start_date: experienceForm.start_date,
      currently_working: experienceForm.currently_working || false,
    };
    if (experienceForm.end_date && !experienceForm.currently_working) {
      newExperience.end_date = experienceForm.end_date;
    }
    if (experienceForm.responsibilities) {
      newExperience.responsibilities = experienceForm.responsibilities;
    }
    
    setExperiences([...experiences, newExperience]);
    setExperienceForm({ 
      company_name: "", 
      department: "", 
      start_date: "",
      currently_working: false
    });
    setShowExperienceModal(false);
    await savePortfolio();
  };

  // إضافة مهارة
  const handleAddSkill = async () => {
    if (!skillForm.skill_name.trim()) {
      toast.error(isAr ? "يرجى إدخال اسم المهارة" : "Please enter skill name");
      return;
    }
    
    const newSkill = { id: Date.now(), skill_name: skillForm.skill_name };
    setSkills([...skills, newSkill]);
    setSkillForm({ skill_name: "" });
    setShowSkillModal(false);
    await savePortfolio();
  };

  // حذف لغة
  const handleRemoveLanguage = async (id: number) => {
    setLanguages(languages.filter((l) => l.id !== id));
    await savePortfolio();
  };

  // حذف مؤهل
  const handleRemoveEducation = async (id: number) => {
    setEducations(educations.filter((e) => e.id !== id));
    await savePortfolio();
  };

  // حذف خبرة
  const handleRemoveExperience = async (id: number) => {
    setExperiences(experiences.filter((e) => e.id !== id));
    await savePortfolio();
  };

  // حذف مهارة
  const handleRemoveSkill = async (id: number) => {
    setSkills(skills.filter((s) => s.id !== id));
    await savePortfolio();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006EA8] mx-auto"></div>
          <p className="mt-4 text-gray-600">{isAr ? "جاري التحميل..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="rounded-[16px] bg-white p-6 shadow-sm sm:p-8">
        <h1 className={cn(
          "text-2xl sm:text-3xl font-bold bg-clip-text text-transparent",
          isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
          "from-[#032C44] to-[#41A0CA]"
        )}>
          {isAr ? "بيانات السيرة الذاتية" : "Portfolio & CV"}
        </h1>
        <p className="mt-2 text-sm text-[#525252]">
          {isAr 
            ? "أضف لغاتك، المؤهلات العلمية، الخبرات العملية، المهارات والسيرة الذاتية" 
            : "Add your languages, education, work experience, skills, and CV"}
        </p>
      </div>

      {/* CV Section */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#111827]">{isAr ? "السيرة الذاتية" : "CV"}</h2>
          <label className="cursor-pointer">
            <input
              accept=".pdf,.doc,.docx"
              onChange={handleCVUpload}
              type="file"
              className="hidden"
              disabled={uploading || saving}
            />
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#006EA8] text-white text-sm rounded-lg hover:bg-[#005685] transition disabled:opacity-60 cursor-pointer">
              <Upload size={16} />
              {uploading ? (isAr ? "جاري الرفع..." : "Uploading...") : (isAr ? "رفع السيرة الذاتية" : "Upload CV")}
            </span>
          </label>
        </div>

        {cv ? (
          <div className="rounded-lg border-2 border-dashed border-[#40A0CA] bg-[#F4FAFF] p-6 text-center">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-sm text-[#0F172A] font-medium mb-3">
              {isAr ? "تم رفع السيرة الذاتية" : "CV uploaded"}
            </p>
            <a
              href={cv}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#006EA8] hover:text-[#005685] text-sm font-medium underline"
            >
              <Download size={16} />
              {isAr ? "تحميل" : "Download"}
            </a>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-sm text-[#6B7280]">
              {isAr ? "لم يتم رفع سيرة ذاتية بعد" : "No CV uploaded yet"}
            </p>
            <p className="text-xs text-[#9CA3AF] mt-1">
              {isAr ? "يدعم PDF, DOC, DOCX" : "Supports PDF, DOC, DOCX"}
            </p>
          </div>
        )}
      </div>

      {/* Languages Section */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 sm:p-6 text-white bg-gradient-to-r from-[#032C44] to-[#41A0CA]">
          <h2 className="text-xl font-bold">{isAr ? "اللغات" : "Languages"}</h2>
          <button 
            onClick={() => setShowLanguageModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white text-[#006EA8] text-sm rounded-lg hover:bg-[#F0F9FF] transition font-medium"
            disabled={saving}
          >
            <Plus size={16} />
            {isAr ? "إضافة" : "Add"}
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {languages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {languages.map((lang: any) => (
                <div key={lang.id} className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-[#111827]">{lang.language}</h3>
                    <p className="text-sm text-[#6B7280] mt-1 capitalize">
                      {lang.level === "native" ? (isAr ? "لغة أم" : "Native") :
                       lang.level === "fluent" ? (isAr ? "طلاقة" : "Fluent") :
                       lang.level === "intermediate" ? (isAr ? "متوسط" : "Intermediate") :
                       (isAr ? "مبتدئ" : "Beginner")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveLanguage(lang.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition"
                    disabled={saving}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6B7280] text-center py-8">
              {isAr ? "لا توجد لغات مضافة" : "No languages added yet"}
            </p>
          )}
        </div>
      </div>

      {/* Education Section */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 sm:p-6 text-white bg-gradient-to-r from-[#032C44] to-[#41A0CA]">
          <h2 className="text-xl font-bold">{isAr ? "المؤهلات العلمية" : "Education"}</h2>
          <button 
            onClick={() => setShowEducationModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white text-[#006EA8] text-sm rounded-lg hover:bg-[#F0F9FF] transition font-medium"
            disabled={saving}
          >
            <Plus size={16} />
            {isAr ? "إضافة" : "Add"}
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {educations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {educations.map((edu: any) => (
                <div key={edu.id} className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] relative">
                  <button
                    onClick={() => handleRemoveEducation(edu.id)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition"
                    disabled={saving}
                  >
                    <Trash2 size={16} />
                  </button>
                  <h3 className="font-bold text-[#006EA8] pr-6">{edu.university}</h3>
                  <p className="text-sm text-[#6B7280] mt-1">
                    {edu.level_of_education === "bachelor" ? (isAr ? "بكالوريوس" : "Bachelor") :
                     edu.level_of_education === "master" ? (isAr ? "ماجستير" : "Master") :
                     edu.level_of_education === "phd" ? (isAr ? "دكتوراه" : "PhD") :
                     edu.level_of_education === "high_school" ? (isAr ? "ثانوية عامة" : "High School") :
                     edu.level_of_education}
                  </p>
                  {edu.specialization && (
                    <p className="text-xs text-[#9CA3AF] mt-1">{edu.specialization}</p>
                  )}
                  <p className="text-xs text-[#9CA3AF] mt-2">{edu.graduation_year}</p>
                  <p className="text-sm text-[#111827] mt-2 font-medium">
                    {isAr ? "التقدير:" : "Grade:"} {
                      edu.final_grade === "excellent" ? (isAr ? "ممتاز" : "Excellent") :
                      edu.final_grade === "very_good" ? (isAr ? "جيد جداً" : "Very Good") :
                      edu.final_grade === "good" ? (isAr ? "جيد" : "Good") :
                      edu.final_grade === "pass" ? (isAr ? "مقبول" : "Pass") :
                      edu.final_grade}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6B7280] text-center py-8">
              {isAr ? "لا توجد مؤهلات علمية مضافة" : "No education added yet"}
            </p>
          )}
        </div>
      </div>

      {/* Experience Section */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 sm:p-6 text-white bg-gradient-to-r from-[#032C44] to-[#41A0CA]">
          <h2 className="text-xl font-bold">{isAr ? "الخبرات العملية" : "Work Experience"}</h2>
          <button 
            onClick={() => setShowExperienceModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white text-[#006EA8] text-sm rounded-lg hover:bg-[#F0F9FF] transition font-medium"
            disabled={saving}
          >
            <Plus size={16} />
            {isAr ? "إضافة" : "Add"}
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {experiences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experiences.map((exp: any) => (
                <div key={exp.id} className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] relative">
                  <button
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition"
                    disabled={saving}
                  >
                    <Trash2 size={16} />
                  </button>
                  <h3 className="font-bold text-[#006EA8] pr-6">{exp.company_name}</h3>
                  <p className="text-sm text-[#6B7280] mt-1">{exp.department}</p>
                  <p className="text-xs text-[#9CA3AF] mt-2">
                    {exp.start_date}
                    {exp.currently_working
                      ? ` - ${isAr ? "حالياً" : "Present"}`
                      : exp.end_date
                        ? ` - ${exp.end_date}`
                        : ""}
                  </p>
                  {exp.responsibilities && (
                    <p className="text-xs text-[#6B7280] mt-2 line-clamp-2">{exp.responsibilities}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6B7280] text-center py-8">
              {isAr ? "لا توجد خبرات عملية مضافة" : "No work experience added yet"}
            </p>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 sm:p-6 text-white bg-gradient-to-r from-[#032C44] to-[#41A0CA]">
          <h2 className="text-xl font-bold">{isAr ? "المهارات" : "Skills"}</h2>
          <button 
            onClick={() => setShowSkillModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white text-[#006EA8] text-sm rounded-lg hover:bg-[#F0F9FF] transition font-medium"
            disabled={saving}
          >
            <Plus size={16} />
            {isAr ? "إضافة" : "Add"}
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: any) => (
                <div key={skill.id} className="flex items-center gap-1 bg-[#F0F9FF] border border-[#006EA8] rounded-full px-3 py-1">
                  <span className="text-[#006EA8] text-sm">{skill.skill_name}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill.id)}
                    className="text-red-500 hover:text-red-700 p-0.5 rounded-full hover:bg-red-50 transition"
                    disabled={saving}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6B7280] text-center py-8">
              {isAr ? "لا توجد مهارات مضافة" : "No skills added yet"}
            </p>
          )}
        </div>
      </div>

      {/* Saving Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006EA8]"></div>
            <p className="text-gray-600">{isAr ? "جاري الحفظ..." : "Saving..."}</p>
          </div>
        </div>
      )}

      {/* Modals - باقي الـ Modals كما هي */}
      {/* Language Modal */}
      <Dialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "إضافة لغة" : "Add Language"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder={isAr ? "اسم اللغة" : "Language name"}
              value={languageForm.language}
              onChange={(e) => setLanguageForm((prev) => ({ ...prev, language: e.target.value }))}
            />
            <Select value={languageForm.level} onValueChange={(value: string) => setLanguageForm((prev) => ({ ...prev, level: value as any }))}>
              <SelectTrigger>
                <SelectValue placeholder={isAr ? "اختر المستوى" : "Select level"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">{isAr ? "مبتدئ" : "Beginner"}</SelectItem>
                <SelectItem value="intermediate">{isAr ? "متوسط" : "Intermediate"}</SelectItem>
                <SelectItem value="fluent">{isAr ? "طلاقة" : "Fluent"}</SelectItem>
                <SelectItem value="native">{isAr ? "لغة أم" : "Native"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowLanguageModal(false)} variant="outline" disabled={saving}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleAddLanguage} className="bg-[#006EA8] hover:bg-[#005685]" disabled={saving}>
              {isAr ? "إضافة" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Education Modal */}
      <Dialog open={showEducationModal} onOpenChange={setShowEducationModal}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isAr ? "إضافة مؤهل علمي" : "Add Education"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder={isAr ? "اسم الجامعة *" : "University Name *"}
              value={educationForm.university}
              onChange={(e) => setEducationForm((prev) => ({ ...prev, university: e.target.value }))}
            />
            <Select value={educationForm.level_of_education} onValueChange={(value: any) => setEducationForm((prev) => ({ ...prev, level_of_education: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={isAr ? "المستوى التعليمي *" : "Education Level *"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high_school">{isAr ? "ثانوية عامة" : "High School"}</SelectItem>
                <SelectItem value="bachelor">{isAr ? "بكالوريوس" : "Bachelor"}</SelectItem>
                <SelectItem value="master">{isAr ? "ماجستير" : "Master"}</SelectItem>
                <SelectItem value="phd">{isAr ? "دكتوراه" : "PhD"}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={isAr ? "سنة التخرج *" : "Graduation Year *"}
              type="number"
              value={educationForm.graduation_year}
              onChange={(e) => setEducationForm((prev) => ({ ...prev, graduation_year: e.target.value }))}
            />
            <Input
              placeholder={isAr ? "التخصص" : "Specialization"}
              value={educationForm.specialization}
              onChange={(e) => setEducationForm((prev) => ({ ...prev, specialization: e.target.value }))}
            />
            <Select value={educationForm.final_grade} onValueChange={(value: any) => setEducationForm((prev) => ({ ...prev, final_grade: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={isAr ? "التقدير النهائي" : "Final Grade"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">{isAr ? "ممتاز" : "Excellent"}</SelectItem>
                <SelectItem value="very_good">{isAr ? "جيد جداً" : "Very Good"}</SelectItem>
                <SelectItem value="good">{isAr ? "جيد" : "Good"}</SelectItem>
                <SelectItem value="pass">{isAr ? "مقبول" : "Pass"}</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <label className="text-sm font-medium block mb-1">{isAr ? "الشهادة" : "Certificate"}</label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setEducationFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowEducationModal(false)} variant="outline" disabled={saving}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleAddEducation} className="bg-[#006EA8] hover:bg-[#005685]" disabled={saving}>
              {isAr ? "إضافة" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Experience Modal */}
      <Dialog open={showExperienceModal} onOpenChange={setShowExperienceModal}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isAr ? "إضافة خبرة عملية" : "Add Work Experience"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder={isAr ? "اسم الشركة *" : "Company Name *"}
              value={experienceForm.company_name}
              onChange={(e) => setExperienceForm((prev) => ({ ...prev, company_name: e.target.value }))}
            />
            <Input
              placeholder={isAr ? "القسم *" : "Department *"}
              value={experienceForm.department}
              onChange={(e) => setExperienceForm((prev) => ({ ...prev, department: e.target.value }))}
            />
            <div>
              <label className="text-sm font-medium block mb-1">{isAr ? "تاريخ البداية *" : "Start Date *"}</label>
              <Input
                type="date"
                value={experienceForm.start_date}
                onChange={(e) => setExperienceForm((prev) => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">{isAr ? "تاريخ النهاية" : "End Date"}</label>
              <Input
                type="date"
                value={experienceForm.end_date || ""}
                onChange={(e) => setExperienceForm((prev) => ({ ...prev, end_date: e.target.value }))}
                disabled={experienceForm.currently_working}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={experienceForm.currently_working || false}
                onChange={(e) => setExperienceForm((prev) => ({ 
                  ...prev, 
                  currently_working: e.target.checked,
                  end_date: e.target.checked ? undefined : prev.end_date 
                }))}
                className="w-4 h-4"
              />
              <span className="text-sm">{isAr ? "أعمل هنا حالياً" : "Currently Working Here"}</span>
            </label>
            <Textarea
              placeholder={isAr ? "المسؤوليات" : "Responsibilities"}
              value={experienceForm.responsibilities || ""}
              rows={3}
              onChange={(e) => setExperienceForm((prev) => ({ ...prev, responsibilities: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowExperienceModal(false)} variant="outline" disabled={saving}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleAddExperience} className="bg-[#006EA8] hover:bg-[#005685]" disabled={saving}>
              {isAr ? "إضافة" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skills Modal */}
      <Dialog open={showSkillModal} onOpenChange={setShowSkillModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "إضافة مهارة" : "Add Skill"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder={isAr ? "اسم المهارة" : "Skill name"}
              value={skillForm.skill_name}
              onChange={(e) => setSkillForm((prev) => ({ ...prev, skill_name: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSkillModal(false)} variant="outline" disabled={saving}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleAddSkill} className="bg-[#006EA8] hover:bg-[#005685]" disabled={saving}>
              {isAr ? "إضافة" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}