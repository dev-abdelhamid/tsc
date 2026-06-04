"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  locale: string;
  initialPortfolio?: Record<string, any>;
};

// Internal model structures
type LanguageItem = {
  id?: number;
  tempId?: string;
  language: string;
  level: "beginner" | "intermediate" | "fluent" | "native";
};

type EducationItem = {
  id?: number;
  tempId?: string;
  university: string;
  levelOfEducation: "high_school" | "bachelor" | "master" | "phd";
  graduationYear: string;
  specialization: string;
  finalGrade: "excellent" | "very_good" | "good" | "pass";
  attachment?: string | null;
  attachmentFile?: File | null;
};

type ExperienceItem = {
  id?: number;
  tempId?: string;
  companyName: string;
  department: string;
  startDate: string;
  endDate?: string;
  currentlyWorking: boolean;
  responsibilities: string;
  attachment?: string | null;
  attachmentFile?: File | null;
};

type SkillItem = {
  id?: number;
  tempId?: string;
  skillName: string;
};

export default function UserEducationClient({ locale, initialPortfolio }: Props) {
  // Page states
  const [cv, setCv] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [educations, setEducations] = useState<EducationItem[]>([]);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal visibility states
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);

  // Modal editing items
  const [editingEducation, setEditingEducation] = useState<EducationItem | null>(null);
  const [editingExperience, setEditingExperience] = useState<ExperienceItem | null>(null);

  // Modal form states
  const [modalLanguages, setModalLanguages] = useState<LanguageItem[]>([]);
  const [educationForm, setEducationForm] = useState<Omit<EducationItem, "id" | "tempId">>({
    university: "",
    levelOfEducation: "bachelor",
    graduationYear: new Date().getFullYear().toString(),
    specialization: "",
    finalGrade: "good",
    attachment: null,
    attachmentFile: null,
  });
  const [experienceForm, setExperienceForm] = useState<Omit<ExperienceItem, "id" | "tempId">>({
    companyName: "",
    department: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    responsibilities: "",
    attachment: null,
    attachmentFile: null,
  });
  const [modalSkills, setModalSkills] = useState<SkillItem[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");

  const isAr = locale === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper arrays
  const gradYears = Array.from(
    { length: 60 },
    (_, i) => (new Date().getFullYear() + 5 - i).toString()
  );

  // Unified data mapping from backend
  const mapDataFromBackend = (data: any) => {
    setCv(data.cv || data.cv_url || null);

    // Languages
    const langs = (data.languages || []).map((l: any) => ({
      id: l.id,
      language: l.language || l.name || "",
      level: l.level || l.proficiency || "beginner",
    }));
    setLanguages(langs);

    // Education (Mapping camelCase / snake_case / converted format safely)
    const edus = (data.education || data.educations || []).map((e: any) => {
      const university = e.university || e.institution || "";
      const levelOfEducation = e.levelOfEducation || e.level_of_education || e.degree || "bachelor";
      
      let graduationYear = String(e.graduationYear || e.graduation_year || "");
      if (!graduationYear && e.end_date) {
        graduationYear = String(new Date(e.end_date).getFullYear());
      }
      if (graduationYear === "NaN") graduationYear = "";

      const specialization = e.specialization || e.field_of_study || "";
      
      let finalGrade = e.finalGrade || e.final_grade || "good";
      if (typeof e.grade === "number") {
        finalGrade = e.grade >= 85 ? "excellent" :
                     e.grade >= 75 ? "very_good" :
                     e.grade >= 65 ? "good" : "pass";
      }

      return {
        id: e.id,
        university,
        levelOfEducation,
        graduationYear,
        specialization,
        finalGrade,
        attachment: e.attachment || e.document_url || null,
      };
    });
    setEducations(edus);

    // Experiences (Mapping raw/converted format safely)
    const exps = (data.workExperience || data.experiences || []).map((e: any) => ({
      id: e.id,
      companyName: e.companyName || e.company_name || e.company || "",
      department: e.department || e.job_title || "",
      startDate: e.startDate || e.start_date || "",
      endDate: e.endDate || e.end_date || "",
      currentlyWorking: e.currentlyWorking || e.currently_working === 1 || e.currently_working === "1" || e.currently_working === true || e.is_current === true || false,
      responsibilities: e.responsibilities || e.description || "",
      attachment: e.attachment || null,
    }));
    setExperiences(exps);

    // Skills
    const sks = (data.skills || []).map((s: any) => ({
      id: s.id,
      skillName: s.skillName || s.skill_name || s.name || "",
    }));
    setSkills(sks);
  };

  // Fetch data
  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/portfolio", {
        headers: { "x-locale": locale, "accept-language": locale },
      });

      // 401 = session expired – no toast, just leave the form empty
      if (res.status === 401) {
        setLoading(false);
        return;
      }

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Failed to load portfolio data");

      mapDataFromBackend(resData.data || resData);
    } catch (err: any) {
      console.error("[Load error]", err);
      toast.error(isAr ? "فشل تحميل البيانات" : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPortfolio && Object.keys(initialPortfolio).length > 0) {
      const data = initialPortfolio.data || initialPortfolio;
      mapDataFromBackend(data);
      setLoading(false);
    } else {
      loadPortfolio();
    }
  }, [initialPortfolio, locale]);

  // Save the entire portfolio using FormData (API expects arrays to be sent)
  const savePortfolio = async (
    updatedLangs = languages,
    updatedEdus = educations,
    updatedExps = experiences,
    updatedSkills = skills,
    newCvFile: File | null = cvFile
  ) => {
    // ── Pre-save validation: backend requires ALL 4 sections to be non-empty arrays ──
    if (updatedLangs.length === 0) {
      toast.error(isAr ? "يجب إضافة لغة واحدة على الأقل قبل الحفظ" : "Please add at least one language before saving");
      return;
    }
    if (updatedEdus.length === 0) {
      toast.error(isAr ? "يجب إضافة مؤهل تعليمي واحد على الأقل قبل الحفظ" : "Please add at least one education entry before saving");
      return;
    }
    if (updatedExps.length === 0) {
      toast.error(isAr ? "يجب إضافة خبرة عملية واحدة على الأقل قبل الحفظ" : "Please add at least one work experience before saving");
      return;
    }
    if (updatedSkills.length === 0) {
      toast.error(isAr ? "يجب إضافة مهارة واحدة على الأقل قبل الحفظ" : "Please add at least one skill before saving");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      // Append CV if available
      if (newCvFile) {
        formData.append("cv", newCvFile);
      }

      // Languages
      updatedLangs.forEach((lang, idx) => {
        formData.append(`languages[${idx}][language]`, lang.language);
        formData.append(`languages[${idx}][level]`, lang.level);
        if (lang.id) formData.append(`languages[${idx}][id]`, String(lang.id));
      });

      // Education
      updatedEdus.forEach((edu, idx) => {
        formData.append(`education[${idx}][university]`, edu.university);
        formData.append(`education[${idx}][level_of_education]`, edu.levelOfEducation);
        formData.append(`education[${idx}][graduation_year]`, edu.graduationYear);
        formData.append(`education[${idx}][specialization]`, edu.specialization);
        formData.append(`education[${idx}][final_grade]`, edu.finalGrade);
        if (edu.id) formData.append(`education[${idx}][id]`, String(edu.id));
        if (edu.attachmentFile) formData.append(`education[${idx}][attachment]`, edu.attachmentFile);
      });

      // Work Experience
      if (updatedExps.length === 0) {
        // should never reach here due to validation above
        toast.error(isAr ? "يجب إضافة خبرة عملية" : "Work experience is required");
        return;
      } else {
        updatedExps.forEach((exp, idx) => {
          formData.append(`work_experience[${idx}][company_name]`, exp.companyName);
          formData.append(`work_experience[${idx}][department]`, exp.department);
          formData.append(`work_experience[${idx}][start_date]`, exp.startDate);
          if (exp.endDate && !exp.currentlyWorking) {
            formData.append(`work_experience[${idx}][end_date]`, exp.endDate);
          }
          formData.append(`work_experience[${idx}][currently_working]`, exp.currentlyWorking ? "1" : "0");
          formData.append(`work_experience[${idx}][responsibilities]`, exp.responsibilities || "");
          if (exp.id) formData.append(`work_experience[${idx}][id]`, String(exp.id));
          if (exp.attachmentFile) formData.append(`work_experience[${idx}][attachment]`, exp.attachmentFile);
        });
      }

      // Skills
      updatedSkills.forEach((skill, idx) => {
        formData.append(`skills[${idx}][skill_name]`, skill.skillName);
        if (skill.id) formData.append(`skills[${idx}][id]`, String(skill.id));
      });

      const res = await fetch("/api/user/portfolio", {
        method: "POST",
        headers: {
          "x-locale": locale,
          "accept-language": locale,
        },
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        let errorMsg = resData.message || "";
        if (resData.errors) {
          const details = Object.values(resData.errors).flat().join(", ");
          if (details) errorMsg = `${errorMsg}: ${details}`;
        }
        throw new Error(errorMsg || "Failed to save portfolio");
      }

      toast.success(isAr ? "تم حفظ البيانات بنجاح" : "Portfolio saved successfully");
      setCvFile(null);
      await loadPortfolio();
    } catch (err: any) {
      console.error("[Save error]", err);
      toast.error(err.message || (isAr ? "فشل حفظ البيانات" : "Failed to save data"));
    } finally {
      setSaving(false);
    }
  };

  // CV Direct Upload Handlers
  const triggerCVUpload = () => {
    fileInputRef.current?.click();
  };

  const handleCVChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error(isAr ? "يجب رفع ملف بصيغة PDF فقط" : "Only PDF files are allowed");
      return;
    }
    setCvFile(file);
    await savePortfolio(languages, educations, experiences, skills, file);
  };

  const handleCVDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCVDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error(isAr ? "يجب رفع ملف بصيغة PDF فقط" : "Only PDF files are allowed");
      return;
    }
    setCvFile(file);
    await savePortfolio(languages, educations, experiences, skills, file);
  };

  // -----------------
  // Language Operations
  // -----------------
  const openLanguagesEdit = () => {
    setModalLanguages(
      languages.map((l, index) => ({
        ...l,
        tempId: l.id ? undefined : `lang-${index}-${Date.now()}`,
      }))
    );
    setShowLanguageModal(true);
  };

  const addLanguageRow = () => {
    setModalLanguages((prev) => [
      ...prev,
      { tempId: `lang-new-${Date.now()}-${Math.random()}`, language: "", level: "beginner" },
    ]);
  };

  const removeLanguageRow = (index: number) => {
    setModalLanguages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateLanguageRow = (index: number, field: keyof LanguageItem, value: string) => {
    setModalLanguages((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const saveLanguagesModal = async () => {
    const invalid = modalLanguages.some((l) => !l.language.trim());
    if (invalid) {
      toast.error(isAr ? "الرجاء تحديد اسم اللغة لكل الصفوف" : "Please specify the language name for all rows");
      return;
    }
    if (modalLanguages.length === 0) {
      toast.error(isAr ? "يجب إضافة لغة واحدة على الأقل" : "At least one language is required");
      return;
    }
    setShowLanguageModal(false);
    setLanguages(modalLanguages);
    await savePortfolio(modalLanguages, educations, experiences, skills, cvFile);
  };

  // -----------------
  // Education Operations
  // -----------------
  const openAddEducation = () => {
    setEditingEducation(null);
    setEducationForm({
      university: "",
      levelOfEducation: "bachelor",
      graduationYear: new Date().getFullYear().toString(),
      specialization: "",
      finalGrade: "good",
      attachment: null,
      attachmentFile: null,
    });
    setShowEducationModal(true);
  };

  const openEditEducation = (item: EducationItem) => {
    setEditingEducation(item);
    setEducationForm({
      university: item.university,
      levelOfEducation: item.levelOfEducation,
      graduationYear: item.graduationYear,
      specialization: item.specialization,
      finalGrade: item.finalGrade,
      attachment: item.attachment,
      attachmentFile: null,
    });
    setShowEducationModal(true);
  };

  const deleteEducationItem = async (index: number) => {
    if (educations.length <= 1) {
      toast.error(isAr ? "يجب أن تحتوي سيرتك الذاتية على مؤهل تعليمي واحد على الأقل." : "Your portfolio must contain at least one education item.");
      return;
    }
    const updated = educations.filter((_, idx) => idx !== index);
    setEducations(updated);
    await savePortfolio(languages, updated, experiences, skills, cvFile);
  };

  const submitEducation = async () => {
    if (!educationForm.university.trim()) {
      toast.error(isAr ? "الرجاء إدخال اسم الجامعة" : "Please enter the university name");
      return;
    }
    if (!educationForm.specialization.trim()) {
      toast.error(isAr ? "الرجاء إدخال التخصص" : "Please enter the specialization");
      return;
    }
    if (!educationForm.graduationYear) {
      toast.error(isAr ? "الرجاء تحديد سنة التخرج" : "Please select graduation year");
      return;
    }
    if (!educationForm.levelOfEducation) {
      toast.error(isAr ? "الرجاء تحديد المستوى التعليمي" : "Please select education level");
      return;
    }
    if (!educationForm.finalGrade) {
      toast.error(isAr ? "الرجاء تحديد التقدير النهائي" : "Please select final grade");
      return;
    }

    setShowEducationModal(false);

    let updatedEdus = [...educations];
    if (editingEducation) {
      updatedEdus = educations.map((item) =>
        (item.id && item.id === editingEducation.id) ||
          (item.tempId && item.tempId === editingEducation.tempId)
          ? { ...item, ...educationForm }
          : item
      );
    } else {
      const newEdu: EducationItem = {
        tempId: `edu-new-${Date.now()}`,
        ...educationForm,
      };
      updatedEdus.push(newEdu);
    }

    setEducations(updatedEdus);
    await savePortfolio(languages, updatedEdus, experiences, skills, cvFile);
  };

  // -----------------
  // Work Experience Operations
  // -----------------
  const openAddExperience = () => {
    setEditingExperience(null);
    setExperienceForm({
      companyName: "",
      department: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      responsibilities: "",
      attachment: null,
      attachmentFile: null,
    });
    setShowExperienceModal(true);
  };

  const openEditExperience = (item: ExperienceItem) => {
    setEditingExperience(item);
    setExperienceForm({
      companyName: item.companyName,
      department: item.department,
      startDate: item.startDate,
      endDate: item.currentlyWorking ? "" : item.endDate || "",
      currentlyWorking: item.currentlyWorking,
      responsibilities: item.responsibilities,
      attachment: item.attachment,
      attachmentFile: null,
    });
    setShowExperienceModal(true);
  };

  const deleteExperienceItem = async (index: number) => {
    if (experiences.length <= 1) {
      toast.error(isAr ? "يجب أن تحتوي سيرتك الذاتية على خبرة عملية واحدة على الأقل." : "Your portfolio must contain at least one work experience.");
      return;
    }
    const updated = experiences.filter((_, idx) => idx !== index);
    setExperiences(updated);
    await savePortfolio(languages, educations, updated, skills, cvFile);
  };

  const submitExperience = async () => {
    if (!experienceForm.companyName.trim()) {
      toast.error(isAr ? "الرجاء إدخال اسم الشركة" : "Please enter the company name");
      return;
    }
    if (!experienceForm.department.trim()) {
      toast.error(isAr ? "الرجاء إدخال القسم" : "Please enter the department");
      return;
    }
    if (!experienceForm.startDate) {
      toast.error(isAr ? "الرجاء تحديد تاريخ البدء" : "Please select start date");
      return;
    }
    if (!experienceForm.currentlyWorking && !experienceForm.endDate) {
      toast.error(isAr ? "الرجاء تحديد تاريخ النهاية" : "Please select end date");
      return;
    }
    if (!experienceForm.responsibilities.trim()) {
      toast.error(isAr ? "الرجاء إدخال المسؤوليات" : "Please enter responsibilities");
      return;
    }

    setShowExperienceModal(false);

    let updatedExps = [...experiences];
    if (editingExperience) {
      updatedExps = experiences.map((item) =>
        (item.id && item.id === editingExperience.id) ||
          (item.tempId && item.tempId === editingExperience.tempId)
          ? { ...item, ...experienceForm }
          : item
      );
    } else {
      const newExp: ExperienceItem = {
        tempId: `exp-new-${Date.now()}`,
        ...experienceForm,
      };
      updatedExps.push(newExp);
    }

    setExperiences(updatedExps);
    await savePortfolio(languages, educations, updatedExps, skills, cvFile);
  };

  // -----------------
  // Skill Operations
  // -----------------
  const openSkillsEdit = () => {
    setModalSkills([...skills]);
    setNewSkillInput("");
    setShowSkillModal(true);
  };

  const addSkillToModal = () => {
    const text = newSkillInput.trim();
    if (!text) return;
    if (modalSkills.some((s) => s.skillName.toLowerCase() === text.toLowerCase())) {
      toast.error(isAr ? "المهارة مضافة بالفعل" : "Skill already added");
      return;
    }
    setModalSkills((prev) => [...prev, { tempId: `skill-${Date.now()}`, skillName: text }]);
    setNewSkillInput("");
  };

  const removeSkillFromModal = (index: number) => {
    setModalSkills((prev) => prev.filter((_, idx) => idx !== index));
  };

  const saveSkillsModal = async () => {
    if (modalSkills.length === 0) {
      toast.error(isAr ? "يجب إضافة مهارة واحدة على الأقل" : "At least one skill is required");
      return;
    }
    setShowSkillModal(false);
    setSkills(modalSkills);
    await savePortfolio(languages, educations, experiences, modalSkills, cvFile);
  };

  // Get display helpers
  const getLevelLabel = (lvl: string) => {
    const map: Record<string, string> = {
      beginner: isAr ? "مبتدئ" : "Beginner",
      intermediate: isAr ? "متوسط" : "Intermediate",
      fluent: isAr ? "محادثة" : "Conversational",
      native: isAr ? "اللغة الأم" : "Native or Bilingual",
    };
    return map[lvl] || lvl;
  };

  const getEduLevelLabel = (lvl: string) => {
    const map: Record<string, string> = {
      high_school: isAr ? "ثانوية عامة" : "High School",
      bachelor: isAr ? "بكالوريوس" : "Bachelor",
      master: isAr ? "ماجستير" : "Master",
      phd: isAr ? "دكتوراه" : "PhD",
    };
    return map[lvl] || lvl;
  };

  const getGradeLabel = (grd: string) => {
    const map: Record<string, string> = {
      excellent: isAr ? "امتياز (A = 90-100%)" : "A = 90-100%",
      very_good: isAr ? "جيد جداً (B = 80-89%)" : "B = 80-89%",
      good: isAr ? "جيد (C = 70-79%)" : "C = 70-79%",
      pass: isAr ? "مقبول (D = 50-69%)" : "D = 50-69%",
    };
    return map[grd] || grd;
  };

  const getFilenameFromUrl = (url?: string | null) => {
    if (!url) return "";
    return url.substring(url.lastIndexOf("/") + 1);
  };

  // Gradient heading direction matching read order
  const gradientTitleClasses = cn(
    "bg-clip-text text-transparent",
    isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
    "from-[#032C44] to-[#41A0CA]"
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006EA8] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">{isAr ? "جاري التحميل..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 max-w-[1000px] mx-auto pb-10" dir={isAr ? "rtl" : "ltr"}>
      {/* 1. CV Section */}
      <div className="rounded-[16px] bg-white p-6 border border-[#E5E7EB] shadow-sm">
        <h2 className={cn("text-[20px] font-bold", gradientTitleClasses)}> CV</h2>

        <div
          onClick={triggerCVUpload}
          onDragOver={handleCVDragOver}
          onDrop={handleCVDrop}
          className="border-2 border-dashed border-[#40A0CA] bg-[#F4FAFF] hover:bg-[#EBF7FF] transition rounded-[12px] py-10 px-4 flex flex-col items-center justify-center cursor-pointer text-center"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCVChange}
            accept=".pdf"
            className="hidden"
          />
          <img src="/portfolio/drop.svg" alt="Upload Icon" className="w-[50px] h-[50px] mb-3" />
          <p className="text-[#032C44] text-[15px] font-medium">
            {isAr ? (
              <>قم بسحب سيرتك الذاتية هنا، أو <span className="text-[#006EA8] underline">تصفح</span></>
            ) : (
              <>Drop your CV here, or <span className="text-[#006EA8] underline">browse</span></>
            )}
          </p>
          <p className="text-[#6B7280] text-[12px] mt-1">
            {isAr ? "يدعم بصيغة PDF" : "Supports PDF"}
          </p>
        </div>

        {/* Existing CV Link */}
        {cv && (
          <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-[8px]">
            <div className="flex items-center gap-2">
              <img src="/portfolio/pdf.svg" alt="PDF" className="w-6 h-6" />
              <span className="text-sm font-medium text-gray-700 truncate max-w-[200px] sm:max-w-md">
                {getFilenameFromUrl(cv)}
              </span>
            </div>
            <a
              href={cv}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#006EA8] hover:underline"
            >
              {isAr ? "عرض الملف" : "View File"}
            </a>
          </div>
        )}
      </div>

      {/* 2. Language Section */}
      <div className="rounded-[16px] bg-white p-6 border border-[#E5E7EB] shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className={cn("text-[20px] font-bold", gradientTitleClasses)}>
            {isAr ? "اللغات" : "Language"}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={openLanguagesEdit}
              className="flex items-center gap-1.5 px-4 py-2 border border-[#E5E7EB] hover:bg-gray-50 rounded-[8px] text-[14px] font-semibold text-[#032C44] transition"
            >
              <img src="/portfolio/edit.svg" alt="Edit" className="w-[16px] h-[16px]" />
              <span>{isAr ? "تعديل" : "Edit"}</span>
            </button>
            <PrimaryButton
              onClick={openLanguagesEdit}
              className="w-auto h-[40px] px-4 rounded-[8px] flex items-center justify-center gap-1 text-[14px] font-semibold cursor-pointer"
            >
              <span className="text-[16px] font-bold">+</span>
              <span>{isAr ? "إضافة جديد" : "Add New"}</span>
            </PrimaryButton>
          </div>
        </div>

        <div className="space-y-3">
          {languages.length > 0 ? (
            languages.map((lang, idx) => (
              <div key={idx} className="text-[#525252] text-[15px] font-medium flex items-center gap-1.5">
                <span className="font-bold text-[#032C44]">{lang.language}:</span>
                <span className="text-gray-600">{getLevelLabel(lang.level)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic">
              {isAr ? "لم يتم إضافة لغات بعد" : "No languages added yet"}
            </p>
          )}
        </div>
      </div>

      {/* 3. Education Section */}
      <div className="rounded-[16px] bg-white p-6 border border-[#E5E7EB] shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className={cn("text-[20px] font-bold", gradientTitleClasses)}>
            {isAr ? "المؤهلات العلمية" : "Education"}
          </h2>
          <PrimaryButton
            onClick={openAddEducation}
            className="w-auto h-[40px] px-4 rounded-[8px] flex items-center justify-center gap-1 text-[14px] font-semibold cursor-pointer"
          >
            <span className="text-[16px] font-bold">+</span>
            <span>{isAr ? "إضافة جديد" : "Add New"}</span>
          </PrimaryButton>
        </div>

        {educations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {educations.map((edu, idx) => (
              <div
                key={idx}
                className="border border-[#E5E7EB] bg-white rounded-[12px] p-4 relative flex flex-col justify-between min-h-[160px] shadow-sm hover:shadow-md transition"
              >
                {/* Actions top right */}
                <div className={cn("absolute top-3 flex gap-1", isAr ? "left-3" : "right-3")}>
                  <button
                    onClick={() => openEditEducation(edu)}
                    className="p-1 hover:bg-gray-100 rounded-full transition"
                    title={isAr ? "تعديل" : "Edit"}
                  >
                    <img src="/portfolio/edit.svg" alt="Edit" className="w-[16px] h-[16px]" />
                  </button>
                  <button
                    onClick={() => deleteEducationItem(idx)}
                    className="p-1 hover:bg-red-50 rounded-full transition"
                    title={isAr ? "حذف" : "Delete"}
                  >
                    <img src="/portfolio/remove.svg" alt="Remove" className="w-[16px] h-[16px]" />
                  </button>
                </div>

                <div className="pr-12 pl-2">
                  <h3 className="text-[16px] font-bold text-[#032C44] line-clamp-1 mb-1 leading-snug">
                    {getEduLevelLabel(edu.levelOfEducation)}
                  </h3>
                  <p className="text-[13px] text-[#525252] font-semibold line-clamp-1">
                    {edu.university}
                  </p>
                  <p className="text-[12px] text-[#6B7280] mt-1 font-medium">
                    {edu.graduationYear}
                  </p>
                  <p className="text-[12px] text-[#525252] mt-1 font-semibold">
                    {getGradeLabel(edu.finalGrade)}
                  </p>
                </div>

                {/* PDF File Indicator at bottom */}
                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-xs text-[#006EA8] truncate">
                  <img src="/portfolio/pdf.svg" alt="PDF Icon" className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate font-semibold text-[11px] max-w-[130px]">
                    {edu.attachmentFile
                      ? edu.attachmentFile.name
                      : edu.attachment
                        ? getFilenameFromUrl(edu.attachment)
                        : isAr ? "لا توجد شهادة مرفقة" : "No attachment"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">
            {isAr ? "لم يتم إضافة مؤهلات تعليمية بعد" : "No education added yet"}
          </p>
        )}
      </div>

      {/* 4. Work Experience Section */}
      <div className="rounded-[16px] bg-white p-6 border border-[#E5E7EB] shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className={cn("text-[20px] font-bold", gradientTitleClasses)}>
            {isAr ? "الخبرات العملية" : "Work Experience"}
          </h2>
          <PrimaryButton
            onClick={openAddExperience}
            className="w-auto h-[40px] px-4 rounded-[8px] flex items-center justify-center gap-1 text-[14px] font-semibold cursor-pointer"
          >
            <span className="text-[16px] font-bold">+</span>
            <span>{isAr ? "إضافة جديد" : "Add New"}</span>
          </PrimaryButton>
        </div>

        {experiences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {experiences.map((exp, idx) => (
              <div
                key={idx}
                className="border border-[#E5E7EB] bg-white rounded-[12px] p-4 relative flex flex-col justify-between min-h-[160px] shadow-sm hover:shadow-md transition"
              >
                {/* Actions */}
                <div className={cn("absolute top-3 flex gap-1", isAr ? "left-3" : "right-3")}>
                  <button
                    onClick={() => openEditExperience(exp)}
                    className="p-1 hover:bg-gray-100 rounded-full transition"
                    title={isAr ? "تعديل" : "Edit"}
                  >
                    <img src="/portfolio/edit.svg" alt="Edit" className="w-[16px] h-[16px]" />
                  </button>
                  <button
                    onClick={() => deleteExperienceItem(idx)}
                    className="p-1 hover:bg-red-50 rounded-full transition"
                    title={isAr ? "حذف" : "Delete"}
                  >
                    <img src="/portfolio/remove.svg" alt="Remove" className="w-[16px] h-[16px]" />
                  </button>
                </div>

                <div className="pr-12 pl-2">
                  <h3 className="text-[16px] font-bold text-[#032C44] line-clamp-1 mb-1 leading-snug">
                    {exp.companyName}
                  </h3>
                  <p className="text-[13px] text-[#525252] font-semibold line-clamp-1">
                    {exp.department}
                  </p>
                  <p className="text-[11px] text-[#6B7280] mt-1 font-semibold">
                    {exp.startDate} - {exp.currentlyWorking ? (isAr ? "حالياً" : "Present") : exp.endDate || ""}
                  </p>
                </div>

                {/* PDF File Indicator at bottom */}
                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-xs text-[#006EA8] truncate">
                  <img src="/portfolio/pdf.svg" alt="PDF Icon" className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate font-semibold text-[11px] max-w-[130px]">
                    {exp.attachmentFile
                      ? exp.attachmentFile.name
                      : exp.attachment
                        ? getFilenameFromUrl(exp.attachment)
                        : isAr ? "لا توجد مرفقات" : "No attachment"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">
            {isAr ? "لم يتم إضافة خبرات عملية بعد" : "No work experience added yet"}
          </p>
        )}
      </div>

      {/* 5. Skills Section */}
      <div className="rounded-[16px] bg-white p-6 border border-[#E5E7EB] shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className={cn("text-[20px] font-bold", gradientTitleClasses)}>
            {isAr ? "المهارات" : "Skills"}
          </h2>
          <button
            onClick={openSkillsEdit}
            className="flex items-center gap-1.5 px-4 py-2 border border-[#E5E7EB] hover:bg-gray-50 rounded-[8px] text-[14px] font-semibold text-[#032C44] transition"
          >
            <img src="/portfolio/edit.svg" alt="Edit" className="w-[16px] h-[16px]" />
            <span>{isAr ? "تعديل" : "Edit"}</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.length > 0 ? (
            skills.map((s, idx) => (
              <div
                key={idx}
                className="px-4 py-1.5 border border-[#006EA8] text-[#006EA8] bg-white rounded-full text-sm font-semibold hover:bg-[#F0F9FF] transition"
              >
                {s.skillName}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic">
              {isAr ? "لم يتم إضافة مهارات بعد" : "No skills added yet"}
            </p>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LANGUAGE MODAL (Edit all list, matching Screenshot 3) */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
        <DialogContent className="max-w-[550px] p-6 rounded-[20px] bg-white border-0 shadow-lg">
          <DialogDescription className="sr-only">
            {isAr ? "إضافة وتعديل اللغات في سيرتك الذاتية" : "Add and edit languages in your portfolio"}
          </DialogDescription>
          <div className="flex items-center justify-between mb-6">
            <DialogTitle className={gradientTitleClasses}>
              {isAr ? "اللغات" : "Language"}
            </DialogTitle>
            <button
              onClick={() => setShowLanguageModal(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <img src="/portfolio/close-circle.svg" alt="Close" className="w-7 h-7" />
            </button>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {modalLanguages.map((row, idx) => (
              <div key={idx} className="flex items-end gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                {/* Language name input */}
                <div className="flex-1 space-y-1">
                  <label className="text-[14px] font-bold text-[#032C44]">
                    {isAr ? "اللغة" : "Language"}
                  </label>
                  <Input
                    type="text"
                    value={row.language}
                    onChange={(e) => updateLanguageRow(idx, "language", e.target.value)}
                    placeholder={isAr ? "مثال: الإنجليزية" : "e.g. English"}
                    className="border border-[#E5E7EB] focus:border-[#40A0CA] rounded-[8px] px-3 py-2 text-sm w-full outline-none"
                  />
                </div>

                {/* Level select */}
                <div className="w-[180px] space-y-1">
                  <label className="text-[14px] font-bold text-[#032C44]">
                    {isAr ? "المستوى *" : "level *"}
                  </label>
                  <div className="relative">
                    <select
                      value={row.level}
                      onChange={(e) => updateLanguageRow(idx, "level", e.target.value as any)}
                      className="appearance-none border border-[#E5E7EB] focus:border-[#40A0CA] bg-white rounded-[8px] px-3 py-2 pr-8 text-sm w-full outline-none"
                    >
                      <option value="beginner">{isAr ? "مبتدئ" : "Beginner"}</option>
                      <option value="intermediate">{isAr ? "متوسط" : "Intermediate"}</option>
                      <option value="fluent">{isAr ? "محادثة" : "Conversational"}</option>
                      <option value="native">{isAr ? "اللغة الأم" : "Native or Bilingual"}</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <img src="/portfolio/arrow-down.svg" alt="Select" className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Delete row */}
                <button
                  onClick={() => removeLanguageRow(idx)}
                  className="p-2 border border-[#FF5B5C] bg-[#FFF5F5] hover:bg-[#FFE5E5] rounded-[8px] transition flex-shrink-0 mb-[1px]"
                  title={isAr ? "حذف الصف" : "Delete Row"}
                >
                  <img src="/portfolio/remove.svg" alt="Delete" className="w-[16px] h-[16px]" />
                </button>
              </div>
            ))}

            {modalLanguages.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                {isAr ? "لم تقم بإضافة لغة بعد. انقر على إضافة صف أدناه." : "No languages added yet. Click Add Row below."}
              </p>
            )}
          </div>

          <div className="mt-4">
            <button
              onClick={addLanguageRow}
              className="text-sm font-bold text-[#006EA8] hover:underline flex items-center gap-1"
            >
              <span>+</span> <span>{isAr ? "إضافة لغة جديدة" : "Add New Language"}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={() => setShowLanguageModal(false)}
              className="px-10 h-[44px] border border-[#006EA8] text-[#006EA8] bg-white hover:bg-[#F0F9FF] font-bold rounded-[12px] text-[15px] transition"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <PrimaryButton
              onClick={saveLanguagesModal}
              disabled={saving}
              className="px-10 w-auto"
            >
              {isAr ? "تأكيد" : "Submit"}
            </PrimaryButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* EDUCATION MODAL */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={showEducationModal} onOpenChange={setShowEducationModal}>
        <DialogContent className="max-w-[550px] p-6 rounded-[20px] bg-white border-0 shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogDescription className="sr-only">
            {isAr ? "إضافة أو تعديل المؤهل التعليمي" : "Add or edit an education qualification"}
          </DialogDescription>
          <div className="flex items-center justify-between mb-5">
            <DialogTitle className={gradientTitleClasses}>
              {isAr ? "المؤهلات العلمية" : "Education"}
            </DialogTitle>
            <button
              onClick={() => setShowEducationModal(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <img src="/portfolio/close-circle.svg" alt="Close" className="w-7 h-7" />
            </button>
          </div>

          <div className="space-y-4">
            {/* University input */}
            <div className="space-y-1">
              <label className="text-[14px] font-bold text-[#032C44]">
                {isAr ? "الجامعة *" : "University *"}
              </label>
              <Input
                type="text"
                value={educationForm.university}
                onChange={(e) => setEducationForm((prev) => ({ ...prev, university: e.target.value }))}
                placeholder={isAr ? "أدخل اسم الجامعة" : "Enter university name"}
                className="border border-[#E5E7EB] focus:border-[#40A0CA] rounded-[8px] px-3 py-2 text-sm w-full outline-none"
              />
            </div>

            {/* Level & Year rows */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[14px] font-bold text-[#032C44]">
                  {isAr ? "المستوى التعليمي *" : "Level Of Education *"}
                </label>
                <div className="relative">
                  <select
                    value={educationForm.levelOfEducation}
                    onChange={(e) =>
                      setEducationForm((prev) => ({
                        ...prev,
                        levelOfEducation: e.target.value as any,
                      }))
                    }
                    className="appearance-none border border-[#E5E7EB] focus:border-[#40A0CA] bg-white rounded-[8px] px-3 py-2 pr-8 text-sm w-full outline-none"
                  >
                    <option value="high_school">{isAr ? "ثانوية عامة" : "High School"}</option>
                    <option value="bachelor">{isAr ? "بكالوريوس" : "Bachelor"}</option>
                    <option value="master">{isAr ? "ماجستير" : "Master"}</option>
                    <option value="phd">{isAr ? "دكتوراه" : "PhD"}</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <img src="/portfolio/arrow-down.svg" alt="Select" className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-bold text-[#032C44]">
                  {isAr ? "سنة التخرج *" : "Graduation Year *"}
                </label>
                <div className="relative">
                  <select
                    value={educationForm.graduationYear}
                    onChange={(e) =>
                      setEducationForm((prev) => ({ ...prev, graduationYear: e.target.value }))
                    }
                    className="appearance-none border border-[#E5E7EB] focus:border-[#40A0CA] bg-white rounded-[8px] px-3 py-2 pr-8 text-sm w-full outline-none"
                  >
                    {gradYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <img src="/portfolio/arrow-down.svg" alt="Select" className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Specialization & Grade rows */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[14px] font-bold text-[#032C44]">
                  {isAr ? "التخصص *" : "Specialization *"}
                </label>
                <Input
                  type="text"
                  value={educationForm.specialization}
                  onChange={(e) =>
                    setEducationForm((prev) => ({ ...prev, specialization: e.target.value }))
                  }
                  placeholder={isAr ? "مثال: هندسة برمجيات" : "e.g. Software Engineering"}
                  className="border border-[#E5E7EB] focus:border-[#40A0CA] rounded-[8px] px-3 py-2 text-sm w-full outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-bold text-[#032C44]">
                  {isAr ? "التقدير النهائي *" : "Final Grade *"}
                </label>
                <div className="relative">
                  <select
                    value={educationForm.finalGrade}
                    onChange={(e) =>
                      setEducationForm((prev) => ({
                        ...prev,
                        finalGrade: e.target.value as any,
                      }))
                    }
                    className="appearance-none border border-[#E5E7EB] focus:border-[#40A0CA] bg-white rounded-[8px] px-3 py-2 pr-8 text-sm w-full outline-none"
                  >
                    <option value="excellent">{isAr ? "ممتاز (A = 90-100%)" : "A = 90-100%"}</option>
                    <option value="very_good">{isAr ? "جيد جداً (B = 80-89%)" : "B = 80-89%"}</option>
                    <option value="good">{isAr ? "جيد (C = 70-79%)" : "C = 70-79%"}</option>
                    <option value="pass">{isAr ? "مقبول (D = 50-69%)" : "D = 50-69%"}</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <img src="/portfolio/arrow-down.svg" alt="Select" className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Dropzone */}
            <div className="space-y-1">
              <label className="text-[14px] font-bold text-[#032C44]">
                {isAr ? "المرفقات" : "Attachments"}
              </label>
              <div
                onClick={() => document.getElementById("eduFile")?.click()}
                className="border-2 border-dashed border-[#40A0CA] bg-[#F4FAFF] hover:bg-[#EBF7FF] transition rounded-[12px] py-6 px-4 flex flex-col items-center justify-center cursor-pointer text-center"
              >
                <input
                  type="file"
                  id="eduFile"
                  onChange={(e) =>
                    setEducationForm((prev) => ({
                      ...prev,
                      attachmentFile: e.target.files?.[0] || null,
                    }))
                  }
                  accept=".pdf"
                  className="hidden"
                />
                <img src="/portfolio/drop.svg" alt="Upload" className="w-[36px] h-[36px] mb-2" />
                <p className="text-[#032C44] text-[13px] font-medium">
                  {educationForm.attachmentFile ? (
                    <span className="text-[#006EA8]">{educationForm.attachmentFile.name}</span>
                  ) : educationForm.attachment ? (
                    <span className="text-gray-600">{getFilenameFromUrl(educationForm.attachment)}</span>
                  ) : isAr ? (
                    <>قم بسحب الملف هنا، أو <span className="text-[#006EA8] underline">تصفح</span></>
                  ) : (
                    <>Drop a file, or <span className="text-[#006EA8] underline">browse</span></>
                  )}
                </p>
                <p className="text-[#6B7280] text-[10px] mt-1">
                  {isAr ? "حجم الملف أقل من 10MB والصيغة PDF فقط" : "File size should be less than 10MB and file type should be pdf"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={() => setShowEducationModal(false)}
              className="px-10 h-[44px] border border-[#006EA8] text-[#006EA8] bg-white hover:bg-[#F0F9FF] font-bold rounded-[12px] text-[15px] transition"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <PrimaryButton
              onClick={submitEducation}
              disabled={saving}
              className="px-10 w-auto"
            >
              {isAr ? "تأكيد" : "Submit"}
            </PrimaryButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* WORK EXPERIENCE MODAL */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={showExperienceModal} onOpenChange={setShowExperienceModal}>
        <DialogContent className="max-w-[550px] p-6 rounded-[20px] bg-white border-0 shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogDescription className="sr-only">
            {isAr ? "إضافة أو تعديل خبرة عملية في سيرتك الذاتية" : "Add or edit a work experience entry"}
          </DialogDescription>
          <div className="flex items-center justify-between mb-5">
            <DialogTitle className={gradientTitleClasses}>
              {isAr ? "الخبرات العملية" : "Work Experience"}
            </DialogTitle>
            <button
              onClick={() => setShowExperienceModal(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <img src="/portfolio/close-circle.svg" alt="Close" className="w-7 h-7" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Company & Department */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[14px] font-bold text-[#032C44]">
                  {isAr ? "اسم الشركة *" : "Company Name *"}
                </label>
                <Input
                  type="text"
                  value={experienceForm.companyName}
                  onChange={(e) =>
                    setExperienceForm((prev) => ({ ...prev, companyName: e.target.value }))
                  }
                  placeholder={isAr ? "أدخل اسم الشركة" : "Enter company name"}
                  className="border border-[#E5E7EB] focus:border-[#40A0CA] rounded-[8px] px-3 py-2 text-sm w-full outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-bold text-[#032C44]">
                  {isAr ? "القسم *" : "Department *"}
                </label>
                <Input
                  type="text"
                  value={experienceForm.department}
                  onChange={(e) =>
                    setExperienceForm((prev) => ({ ...prev, department: e.target.value }))
                  }
                  placeholder={isAr ? "مثال: قسم البرمجة" : "e.g. IT Department"}
                  className="border border-[#E5E7EB] focus:border-[#40A0CA] rounded-[8px] px-3 py-2 text-sm w-full outline-none"
                />
              </div>
            </div>

            {/* Dates (Employment Period) */}
            <div className="space-y-1">
              <label className="text-[14px] font-bold text-[#032C44]">
                {isAr ? "فترة العمل *" : "Employment Period *"}
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* From Date */}
                <div className="relative">
                  <Input
                    type="date"
                    value={experienceForm.startDate}
                    onChange={(e) =>
                      setExperienceForm((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    className="border border-[#E5E7EB] focus:border-[#40A0CA] rounded-[8px] pl-3 pr-10 py-2 text-sm w-full outline-none"
                  />
                  <img src="/portfolio/calender.svg" alt="Calendar" className="w-[18px] h-[18px] absolute right-3 top-[50%] translate-y-[-50%] pointer-events-none" />
                </div>

                {/* To Date */}
                <div className="relative">
                  <Input
                    type="date"
                    value={experienceForm.endDate || ""}
                    onChange={(e) =>
                      setExperienceForm((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                    disabled={experienceForm.currentlyWorking}
                    className="border border-[#E5E7EB] focus:border-[#40A0CA] rounded-[8px] pl-3 pr-10 py-2 text-sm w-full outline-none disabled:bg-gray-50"
                  />
                  <img src="/portfolio/calender.svg" alt="Calendar" className="w-[18px] h-[18px] absolute right-3 top-[50%] translate-y-[-50%] pointer-events-none opacity-60" />
                </div>
              </div>

              {/* Currently work here checkbox */}
              <div className="pt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="currWork"
                  checked={experienceForm.currentlyWorking}
                  onChange={(e) =>
                    setExperienceForm((prev) => ({
                      ...prev,
                      currentlyWorking: e.target.checked,
                      endDate: e.target.checked ? "" : prev.endDate,
                    }))
                  }
                  className="w-4 h-4 text-[#006EA8] border-gray-300 rounded focus:ring-[#006EA8]"
                />
                <label htmlFor="currWork" className="text-xs font-semibold text-gray-600 cursor-pointer">
                  {isAr ? "أعمل هنا حالياً" : "Currently Work Here"}
                </label>
              </div>
            </div>

            {/* Responsibilities */}
            <div className="space-y-1">
              <label className="text-[14px] font-bold text-[#032C44]">
                {isAr ? "المسؤوليات *" : "Responsibilities *"}
              </label>
              <Textarea
                rows={3}
                value={experienceForm.responsibilities}
                onChange={(e) =>
                  setExperienceForm((prev) => ({ ...prev, responsibilities: e.target.value }))
                }
                placeholder={isAr ? "اكتب تفاصيل مهامك ومسؤولياتك" : "Write details about your roles and tasks"}
                className="border border-[#E5E7EB] focus:border-[#40A0CA] rounded-[8px] px-3 py-2 text-sm w-full outline-none resize-none"
              />
            </div>

            {/* Attachment */}
            <div className="space-y-1">
              <label className="text-[14px] font-bold text-[#032C44]">
                {isAr ? "المرفقات" : "Attachments"}
              </label>
              <div
                onClick={() => document.getElementById("expFile")?.click()}
                className="border-2 border-dashed border-[#40A0CA] bg-[#F4FAFF] hover:bg-[#EBF7FF] transition rounded-[12px] py-6 px-4 flex flex-col items-center justify-center cursor-pointer text-center"
              >
                <input
                  type="file"
                  id="expFile"
                  onChange={(e) =>
                    setExperienceForm((prev) => ({
                      ...prev,
                      attachmentFile: e.target.files?.[0] || null,
                    }))
                  }
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <img src="/portfolio/drop.svg" alt="Upload" className="w-[36px] h-[36px] mb-2" />
                <p className="text-[#032C44] text-[13px] font-medium">
                  {experienceForm.attachmentFile ? (
                    <span className="text-[#006EA8]">{experienceForm.attachmentFile.name}</span>
                  ) : experienceForm.attachment ? (
                    <span className="text-gray-600">{getFilenameFromUrl(experienceForm.attachment)}</span>
                  ) : isAr ? (
                    <>قم بسحب الملف هنا، أو <span className="text-[#006EA8] underline">تصفح</span></>
                  ) : (
                    <>Drop a file, or <span className="text-[#006EA8] underline">browse</span></>
                  )}
                </p>
                <p className="text-[#6B7280] text-[10px] mt-1">
                  {isAr ? "صيغ الملفات المدعومة: pdf, jpg, jpeg, png وحجم أقل من 10MB" : "File size should be less than 10MB and file type should be jpg, jpeg, png, pdf"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={() => setShowExperienceModal(false)}
              className="px-10 h-[44px] border border-[#006EA8] text-[#006EA8] bg-white hover:bg-[#F0F9FF] font-bold rounded-[12px] text-[15px] transition"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <PrimaryButton
              onClick={submitExperience}
              disabled={saving}
              className="px-10 w-auto"
            >
              {isAr ? "تأكيد" : "Submit"}
            </PrimaryButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* SKILLS MODAL */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={showSkillModal} onOpenChange={setShowSkillModal}>
        <DialogContent className="max-w-[500px] p-6 rounded-[20px] bg-white border-0 shadow-lg">
          <DialogDescription className="sr-only">
            {isAr ? "إضافة وتعديل المهارات في سيرتك الذاتية" : "Add and manage skills in your portfolio"}
          </DialogDescription>
          <div className="flex items-center justify-between mb-5">
            <DialogTitle className={gradientTitleClasses}>
              {isAr ? "المهارات" : "Skills"}
            </DialogTitle>
            <button
              onClick={() => setShowSkillModal(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <img src="/portfolio/close-circle.svg" alt="Close" className="w-7 h-7" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Add Skill Input Row */}
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkillToModal();
                  }
                }}
                placeholder={isAr ? "أدخل اسم المهارة واضغط إضافة" : "Enter skill name and press add"}
                className="border border-[#E5E7EB] focus:border-[#40A0CA] rounded-[8px] px-3 py-2 text-sm flex-1 outline-none"
              />
              <button
                onClick={addSkillToModal}
                className="px-5 py-2 bg-[#006EA8] hover:bg-[#005685] text-white font-bold text-sm rounded-[8px] transition"
              >
                {isAr ? "إضافة" : "Add"}
              </button>
            </div>

            {/* List of current modal skills as badges */}
            <div className="border border-[#E5E7EB] rounded-[12px] p-4 min-h-[120px] max-h-[220px] overflow-y-auto flex flex-wrap gap-2 bg-[#F9FAFB]">
              {modalSkills.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1 border border-[#006EA8] text-[#006EA8] bg-white rounded-full text-xs font-semibold"
                >
                  <span>{s.skillName}</span>
                  <button
                    onClick={() => removeSkillFromModal(idx)}
                    className="p-0.5 hover:bg-red-50 rounded-full transition flex items-center justify-center"
                    title={isAr ? "حذف" : "Remove"}
                  >
                    <img src="/portfolio/remove.svg" alt="Remove" className="w-[10px] h-[10px]" />
                  </button>
                </div>
              ))}
              {modalSkills.length === 0 && (
                <p className="text-sm text-gray-400 m-auto italic">
                  {isAr ? "اكتب مهارة في المربع أعلاه لإضافتها" : "Write a skill in the box above to add it"}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={() => setShowSkillModal(false)}
              className="px-10 h-[44px] border border-[#006EA8] text-[#006EA8] bg-white hover:bg-[#F0F9FF] font-bold rounded-[12px] text-[15px] transition"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <PrimaryButton
              onClick={saveSkillsModal}
              disabled={saving}
              className="px-10 w-auto"
            >
              {isAr ? "تأكيد" : "Submit"}
            </PrimaryButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}