"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { COUNTRIES } from "@/lib/countries"
import { invalidateSessionCache, updateSessionUser } from "@/hooks/use-auth"
import { PrimaryButton } from "@/components/ui/primary-button"
import { resolveImageUrl } from "@/lib/utils"
import { User as UserIcon } from "lucide-react"

type Props = {
  locale: string
  initialProfile?: Record<string, any>
}

type Category = { id: number; name: string; sub_categories?: { id: number; name: string }[] }
type Country = { id: number; name: string; code?: string; flag?: string; dialCode?: string }

const fieldBase =
  "w-full border-b border-[#D4D4D4] py-2.5 text-sm text-[#525252] bg-transparent outline-none transition-colors focus:border-[#40A0CA] placeholder:text-[#A3A3A3]"

const selectBase =
  "w-full border-b border-[#D4D4D4] py-2.5 text-sm text-[#525252] bg-transparent outline-none transition-colors focus:border-[#40A0CA] appearance-none cursor-pointer"

const formatDateForInput = (dobString: any) => {
  if (!dobString || typeof dobString !== "string") return ""
  const match = dobString.match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : ""
}

export default function UserProfileClient({ locale, initialProfile }: Props) {
  const { loading } = useAuth()
  const isAr = locale === "ar"

  // Process initial phone number code and raw digits
  const getInitialPhoneDetails = (fullPhone: string) => {
    let parsedPhone = fullPhone || ""
    let parsedDial = "+20"
    const sortedCountries = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length)
    for (const c of sortedCountries) {
      if (parsedPhone.startsWith(c.dialCode)) {
        parsedDial = c.dialCode
        parsedPhone = parsedPhone.slice(c.dialCode.length)
        break
      }
    }
    return { phone_raw: parsedPhone, phone_code: parsedDial }
  }

  const initialPhone = getInitialPhoneDetails(initialProfile?.phone || "")

  const [profile, setProfile] = useState<Record<string, any>>(() => {
    if (initialProfile) {
      return {
        ...initialProfile,
        phone_raw: initialPhone.phone_raw,
        phone_code: initialPhone.phone_code,
        dob: formatDateForInput(initialProfile.dob),
      }
    }
    return {
      first_name: "",
      last_name: "",
      email: "",
      phone_raw: "",
      phone_code: "+20",
      gender: "",
      dob: "",
      country_id: "",
      category_id: "",
      sub_category_id: "",
      avatar: "",
      facebook: "",
      linkedin: "",
      twitter: "",
      pinterest: "",
      locale: "",
    }
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile?.avatar ?? null)
  const [message, setMessage] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<{ id: number; name: string }[]>([])
  const [countries, setCountries] = useState<Country[]>([])

  useEffect(() => {
    let mounted = true
    async function loadProfile() {
      if (initialProfile) return
      setFetching(true)
      try {
        const res = await fetch("/api/auth/profile", { headers: { "x-locale": locale } })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.message || "فشل جلب البيانات")
        if (!mounted) return
        const p: any = data.data || {}
        const userProfile = p.Userprofile || {}

        let firstName = userProfile.firstName || ""
        let lastName = userProfile.lastName || ""
        if (!firstName && !lastName && p.name) {
          const parts = (p.name || "").split(" ")
          firstName = parts.shift() || ""
          lastName = parts.join(" ") || ""
        }

        const categoryId = userProfile.categoryId || p.category?.id || undefined
        const subcategoryId = userProfile.subcategoryId || p.sub_category?.id || undefined
        const phoneDetails = getInitialPhoneDetails(p.phone || "")

        setProfile({
          first_name: firstName,
          last_name: lastName,
          email: p.email || "",
          phone_raw: phoneDetails.phone_raw,
          phone_code: phoneDetails.phone_code,
          gender: userProfile.gender || p.gender || "",
          dob: formatDateForInput(userProfile.dateOfBirth || p.dob || ""),
          country_id: p.country?.id ?? p.country_id,
          category_id: categoryId,
          sub_category_id: subcategoryId,
          avatar: p.avatar || "",
          facebook: userProfile.facebook || p.facebook || "",
          linkedin: userProfile.linkedin || p.linkedin || "",
          twitter: userProfile.twitterX || p.twitter || "",
          pinterest: userProfile.pinterest || p.pinterest || "",
          locale: p.locale || p.preferences?.locale || "",
        })
        setAvatarPreview(p.avatar || null)
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setFetching(false)
      }
    }
    loadProfile()
    return () => {
      mounted = false
    }
  }, [initialProfile, locale])

  // Load categories + countries for selects
  useEffect(() => {
    let mounted = true
    async function loadMeta() {
      try {
        const [cRes, cntRes] = await Promise.all([
          fetch(`/api/categories?locale=${locale}`).then((r) => r.json()).catch(() => ({ data: [] })),
          fetch(`/api/countries?locale=${locale}`).then((r) => r.json()).catch(() => ({ data: [] })),
        ])
        if (!mounted) return
        setCategories(Array.isArray(cRes?.data) ? cRes.data : [])
        setCountries(Array.isArray(cntRes?.data) ? cntRes.data : [])
      } catch (err) {
        // ignore
      }
    }
    loadMeta()
    return () => {
      mounted = false
    }
  }, [locale])

  // Reactively populate subcategories when category changes or loads
  useEffect(() => {
    if (profile.category_id && categories.length > 0) {
      const selectedCat = categories.find((c) => Number(c.id) === Number(profile.category_id))
      if (selectedCat && Array.isArray(selectedCat.sub_categories)) {
        setSubCategories(selectedCat.sub_categories)
      } else {
        setSubCategories([])
      }
    } else {
      setSubCategories([])
    }
  }, [profile.category_id, categories])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "category") {
      const id = Number(value) || undefined
      setProfile((s) => ({
        ...s,
        category_id: id,
        sub_category_id: undefined,
      }))
      return
    }

    if (name === "sub_category") {
      const id = Number(value) || undefined
      setProfile((s) => ({ ...s, sub_category_id: id }))
      return
    }

    if (name === "country") {
      const id = Number(value) || undefined
      const selected = countries.find((c) => Number(c.id) === Number(id))
      const dialCode = selected?.code || selected?.dialCode || "+20"
      setProfile((s) => ({
        ...s,
        country_id: id,
        phone_code: dialCode,
      }))
      return
    }

    setProfile((s) => ({ ...s, [name]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      // 1. Update password if present
      if (newPassword) {
        if (!currentPassword) {
          throw new Error(isAr ? "الرجاء إدخال كلمة المرور الحالية لتحديث كلمة المرور" : "Please enter the current password to update the password")
        }
        if (newPassword !== confirmPassword) {
          throw new Error(isAr ? "كلمتا المرور غير متطابقتين" : "Passwords do not match")
        }

        const passRes = await fetch("/api/auth/profile/password", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept-Language": locale },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
            new_password_confirmation: confirmPassword,
          })
        })
        const passData = await passRes.json()
        if (!passRes.ok) {
          throw new Error(passData.message || (isAr ? "فشل تحديث كلمة المرور" : "Failed to update password"))
        }
      }

      // 2. Upload avatar first if present
      let uploadedAvatarUrl = ""
      if (avatarFile) {
        const avatarFd = new FormData()
        avatarFd.append("avatar", avatarFile)
        const avatarRes = await fetch("/api/auth/profile/avatar", {
          method: "POST",
          body: avatarFd,
          headers: { "x-locale": locale },
        })
        const avatarData = await avatarRes.json()
        if (!avatarRes.ok) {
          throw new Error(avatarData.message || (isAr ? "فشل حفظ الصورة الشخصية" : "Failed to save avatar image"))
        }
        const updatedObj = avatarData.data || avatarData
        uploadedAvatarUrl = updatedObj.avatar || updatedObj.avatar_url || ""
      }

      // 3. Update general profile info
      const form = new FormData()
      form.append("first_name", profile.first_name || "")
      form.append("last_name", profile.last_name || "")
      form.append("email", profile.email || "")

      const fullPhone = `${profile.phone_code || "+20"}${profile.phone_raw || ""}`
      form.append("phone", fullPhone)
      form.append("gender", profile.gender || "")
      form.append("date_of_birth", profile.dob || "")

      if (profile.category_id) form.append("category_id", String(profile.category_id))
      if (profile.sub_category_id) form.append("subcategory_id", String(profile.sub_category_id))

      // Social Links (using correct flat keys from API collection)
      form.append("user_facebook", profile.facebook || "")
      form.append("user_linkedin", profile.linkedin || "")
      form.append("user_twitter_x", profile.twitter || "")
      form.append("user_pinterest", profile.pinterest || "")

      if (profile.country_id) form.append("country_id", String(profile.country_id))
      if (profile.locale) form.append("locale", profile.locale)

      const res = await fetch("/api/auth/profile", {
        method: "POST",
        body: form,
        headers: { "x-locale": locale },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "فشل حفظ البيانات")

      const updatedUser: Record<string, unknown> = {}
      const userProfileObj = data.data?.Userprofile || data.data?.user_profile || data.data?.profile || {}
      const latestAvatar = uploadedAvatarUrl || data.data?.avatar || data.data?.avatar_url || userProfileObj.avatar || userProfileObj.avatar_url || userProfileObj.image
      const newName = data.data?.name || (data.data?.first_name ? `${data.data.first_name} ${data.data.last_name || ""}`.trim() : "") || data.data?.username

      if (latestAvatar) updatedUser.avatar = latestAvatar
      if (newName) updatedUser.name = newName
      if (Object.keys(updatedUser).length > 0) {
        updateSessionUser(updatedUser)
      }
      // Also invalidate to fetch latest from server in the background
      invalidateSessionCache()

      setMessage(locale === "ar" ? "تم حفظ البيانات بنجاح" : "Saved successfully")
      if (latestAvatar) setAvatarPreview(latestAvatar)

      // Clear password inputs on success
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : (locale === "ar" ? "فشل حفظ البيانات" : "Failed to save"))
    } finally {
      setSaving(false)
    }
  }

  const selectedDialCode = profile.phone_code || "+20"
  const activeDialObj = COUNTRIES.find((c) => c.dialCode === selectedDialCode) || COUNTRIES[0]

  return (
    <div className="w-full flex flex-col gap-8" dir={isAr ? "rtl" : "ltr"}>
      {/* Hide native date picker calendar indicator for chrome */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-date-input::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
        }
      `}} />

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium border text-center ${
          message.includes("فشل") || message.includes("Failed") || message.includes("الرجاء") || message.includes("Please")
            ? "bg-red-50 text-red-700 border-red-200"
            : "bg-green-50 text-green-700 border-green-200"
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ==================== CARD 1: BASIC INFO ==================== */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
          <div className="px-8 pt-8 pb-8">
            {/* Avatar upload inside Card 1 */}
            <div className="flex flex-col items-center mb-8 gap-4 border-b border-[#F3F4F6] pb-6">
              <div className="relative">
                <div className="h-44 w-44 rounded-full border-4 border-white shadow-lg overflow-hidden bg-[#E0F2FE] flex items-center justify-center relative">
                  <UserIcon className="h-24 w-24 text-[#006EA8]" />
                  {avatarPreview && avatarPreview.trim() !== "" && (
                    <img 
                      src={resolveImageUrl(avatarPreview)} 
                      alt="avatar" 
                      className="h-full w-full object-cover absolute inset-0" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0';
                      }}
                    />
                  )}
                </div>
                <label className="absolute bottom-2 right-2 h-11 w-11 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-105 bg-gradient-to-b from-[#006EA8] to-[#005685] z-10">
                  <Image src="/update.svg" alt="update" width={20} height={20} className="text-white" />
                  <input
                    accept="image/*"
                    onChange={handleAvatarChange}
                    type="file"
                    className="hidden"
                  />
                </label>
              </div>
              <span className="text-xs text-gray-500">{isAr ? "اضغط على الأيقونة لتحديث صورتك" : "Click icon to update profile picture"}</span>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
              {/* First Name */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "الاسم الأول" : "First Name"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  name="first_name"
                  value={profile.first_name || ""}
                  onChange={handleChange}
                  className={fieldBase}
                  placeholder={isAr ? "الاسم الأول" : "First Name"}
                />
              </div>

              {/* Last Name */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "اسم العائلة" : "Last Name"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  name="last_name"
                  value={profile.last_name || ""}
                  onChange={handleChange}
                  className={fieldBase}
                  placeholder={isAr ? "اسم العائلة" : "Last Name"}
                />
              </div>

              {/* Email (disabled) */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "البريد الإلكتروني" : "Email"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  disabled
                  name="email"
                  value={profile.email || ""}
                  className="w-full border-b border-[#D4D4D4] py-2.5 text-sm text-[#A3A3A3] bg-transparent outline-none cursor-not-allowed"
                />
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "الجنس" : "Gender"}
                </label>
                <div className="relative w-full">
                  <select
                    name="gender"
                    value={profile.gender || ""}
                    onChange={handleChange}
                    className={selectBase}
                  >
                    <option value="">{isAr ? "اختر" : "Select"}</option>
                    <option value="male">{isAr ? "ذكر" : "Male"}</option>
                    <option value="female">{isAr ? "أنثى" : "Female"}</option>
                    <option value="other">{isAr ? "أخرى" : "Other"}</option>
                  </select>
                  <Image
                    src="/portfolio/arrow-down.svg"
                    alt="arrow"
                    width={20}
                    height={20}
                    className="pointer-events-none absolute end-0 top-1/2 h-5 w-5 -translate-y-1/2"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "تاريخ الميلاد" : "Date of Birth"}
                </label>
                <div className="relative w-full">
                  <input
                    type="date"
                    name="dob"
                    value={profile.dob || ""}
                    onChange={handleChange}
                    className={`${fieldBase} custom-date-input pe-10`}
                  />
                  <div className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Image src="/portfolio/calender.svg" alt="calendar" width={20} height={20} className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Phone Field */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "رقم الهاتف" : "Phone"} <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border-b border-[#D4D4D4] py-2.5 focus-within:border-[#40A0CA] transition-colors">
                  <div className="relative flex items-center shrink-0 pe-2 me-2 border-e border-[#D4D4D4] h-6">
                    <select
                      aria-label="phone-code"
                      value={selectedDialCode}
                      onChange={(e) => {
                        const code = e.target.value
                        setProfile((s) => ({ ...s, phone_code: code }))
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={`country-${c.id}`} value={c.dialCode}>
                          {c.flag} {c.dialCode} ({c.name})
                        </option>
                      ))}
                    </select>
                    <span className="text-base me-1">{activeDialObj.flag}</span>
                    <span className="text-sm text-[#525252] font-medium">{activeDialObj.dialCode}</span>
                    <Image
                      src="/portfolio/arrow-down.svg"
                      alt="arrow"
                      width={16}
                      height={16}
                      className="h-4 w-4 text-[#A3A3A3] ms-1 pointer-events-none"
                    />
                  </div>
                  <input
                    type="tel"
                    required
                    dir={isAr ? "rtl" : "ltr"}
                    value={profile.phone_raw || ""}
                    onChange={(e) => {
                      const val = e.target.value
                      setProfile((s) => ({ ...s, phone_raw: val }))
                    }}
                    placeholder="1003630088"
                    className={`w-full min-w-0 bg-transparent text-sm text-[#525252] outline-none ${isAr ? "text-right" : "text-left"}`}
                  />
                </div>
              </div>

              {/* Country */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "البلد" : "Country"}
                </label>
                <div className="relative w-full">
                  <select
                    name="country"
                    value={profile.country_id || ""}
                    onChange={handleChange}
                    className={selectBase}
                  >
                    <option value="">{isAr ? "اختر البلد" : "Select Country"}</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <Image
                    src="/portfolio/arrow-down.svg"
                    alt="arrow"
                    width={20}
                    height={20}
                    className="pointer-events-none absolute end-0 top-1/2 h-5 w-5 -translate-y-1/2"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "التخصص" : "Category"}
                </label>
                <div className="relative w-full">
                  <select
                    name="category"
                    value={profile.category_id || ""}
                    onChange={handleChange}
                    className={selectBase}
                  >
                    <option value="">{isAr ? "اختر التخصص" : "Select Category"}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <Image
                    src="/portfolio/arrow-down.svg"
                    alt="arrow"
                    width={20}
                    height={20}
                    className="pointer-events-none absolute end-0 top-1/2 h-5 w-5 -translate-y-1/2"
                  />
                </div>
              </div>

              {/* Sub-Category */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "التخصص الفرعي" : "Sub Category"}
                </label>
                <div className="relative w-full">
                  <select
                    name="sub_category"
                    value={profile.sub_category_id || ""}
                    onChange={handleChange}
                    className={selectBase}
                    disabled={subCategories.length === 0}
                  >
                    <option value="">{isAr ? "اختر" : "Select Sub Category"}</option>
                    {subCategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <Image
                    src="/portfolio/arrow-down.svg"
                    alt="arrow"
                    width={20}
                    height={20}
                    className="pointer-events-none absolute end-0 top-1/2 h-5 w-5 -translate-y-1/2"
                  />
                </div>
              </div>

              {/* Preferred Language */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "اللغة المفضلة" : "Preferred Language"}
                </label>
                <div className="relative w-full">
                  <select
                    name="locale"
                    value={profile.locale || locale}
                    onChange={handleChange}
                    className={selectBase}
                  >
                    <option value="ar">العربية (Arabic)</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch (German)</option>
                  </select>
                  <Image
                    src="/portfolio/arrow-down.svg"
                    alt="arrow"
                    width={20}
                    height={20}
                    className="pointer-events-none absolute end-0 top-1/2 h-5 w-5 -translate-y-1/2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== CARD 2: SOCIAL LINKS ==================== */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
          <div className="px-8 pt-8 pb-4">
            <h2 className="text-[22px] font-bold italic text-start bg-gradient-to-r from-[#032C44] via-[#0e5f83] to-[#41A0CA] bg-clip-text text-transparent">
              {isAr ? "روابط التواصل الاجتماعي" : "Social Links"}
            </h2>
          </div>

          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
              {/* Facebook */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">Facebook</label>
                <input
                  type="url"
                  name="facebook"
                  value={profile.facebook || ""}
                  onChange={handleChange}
                  placeholder="https://facebook.com/username"
                  className={fieldBase}
                />
              </div>

              {/* LinkedIn */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  value={profile.linkedin || ""}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className={fieldBase}
                />
              </div>

              {/* Twitter / X */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">X (Twitter)</label>
                <input
                  type="url"
                  name="twitter"
                  value={profile.twitter || ""}
                  onChange={handleChange}
                  placeholder="https://x.com/username"
                  className={fieldBase}
                />
              </div>

              {/* Pinterest */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">Pinterest</label>
                <input
                  type="url"
                  name="pinterest"
                  value={profile.pinterest || ""}
                  onChange={handleChange}
                  placeholder="https://pinterest.com/username"
                  className={fieldBase}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ==================== CARD 3: CHANGE PASSWORD ==================== */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
          <div className="px-8 pt-8 pb-4">
            <h2 className="text-[22px] font-bold italic text-start bg-gradient-to-r from-[#032C44] via-[#0e5f83] to-[#41A0CA] bg-clip-text text-transparent">
              {isAr ? "تغيير كلمة المرور" : "Security & Password"}
            </h2>
          </div>

          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-3">
              {/* Current Password */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "كلمة المرور الحالية" : "Current password"}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={fieldBase}
                />
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "كلمة المرور الجديدة" : "New password"}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={fieldBase}
                />
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "تأكيد كلمة المرور" : "Confirm password"}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={fieldBase}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <PrimaryButton
            type="submit"
            disabled={saving || loading || fetching}
            className="max-w-[220px] h-[48px] text-base font-semibold shadow-[0_24px_48px_rgba(0,86,133,0.16)] hover:shadow-[0_24px_48px_rgba(0,86,133,0.24)]"
          >
            {saving ? (isAr ? "جاري التحديث..." : "Updating...") : (isAr ? "تحديث" : "Update")}
          </PrimaryButton>
        </div>
      </form>
    </div>
  )
}
