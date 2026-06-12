"use client"

import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PrimaryButton } from "@/components/ui/primary-button"
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Save,
  Loader2,
  ShieldCheck,
} from "lucide-react"

type Props = {
  locale: string
  initialProfile?: Record<string, any>
}

const BACKEND_AVATAR_PREFIX = process.env.NEXT_PUBLIC_STORAGE_URL || ""

function resolveAvatar(url?: string): string {
  if (!url) return ""
  if (url.startsWith("http")) return url
  if (url.startsWith("/storage") || url.startsWith("storage")) {
    return `${BACKEND_AVATAR_PREFIX}/${url.replace(/^\//, "")}`
  }
  return url
}

export default function AdminProfileClient({ locale, initialProfile }: Props) {
  const isAr = locale === "ar"

  /* ── Profile form state ── */
  const [form, setForm] = useState({
    name: initialProfile?.name || "",
    email: initialProfile?.email || "",
    phone: initialProfile?.phone || "",
  })
  const [avatar, setAvatar] = useState<string>(resolveAvatar(initialProfile?.avatar))
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ── Password form state ── */
  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  })
  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [savingPw, setSavingPw] = useState(false)

  // Sync if initialProfile changes (e.g., navigating back)
  useEffect(() => {
    if (initialProfile) {
      setForm({
        name: initialProfile.name || "",
        email: initialProfile.email || "",
        phone: initialProfile.phone || "",
      })
      setAvatar(resolveAvatar(initialProfile.avatar))
    }
  }, [])

  /* ── Handle avatar file selection ── */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const url = URL.createObjectURL(file)
    setAvatar(url)
  }

  /* ── Save profile (name, phone, avatar) ── */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
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

      const fd = new FormData()
      fd.append("name", form.name)
      fd.append("phone", form.phone)

      const res = await fetch("/api/auth/profile", {
        method: "POST",
        credentials: "include",
        headers: { "x-locale": locale },
        body: fd,
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || (isAr ? "فشل حفظ الملف الشخصي" : "Failed to save profile"))
      }

      // Sync updated avatar from response
      const updated = data.data || data
      const newAvatar =
        uploadedAvatarUrl ||
        updated?.avatar ||
        updated?.avatar_url ||
        updated?.logoUrl ||
        updated?.logo_url ||
        ""
      if (newAvatar) setAvatar(resolveAvatar(newAvatar))

      setAvatarFile(null)
      toast.success(isAr ? "تم حفظ الملف الشخصي بنجاح ✓" : "Profile saved successfully ✓")
    } catch (err: any) {
      toast.error(err.message || (isAr ? "حدث خطأ" : "An error occurred"))
    } finally {
      setSavingProfile(false)
    }
  }

  /* ── Save password ── */
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pwForm.current_password || !pwForm.new_password) {
      toast.error(isAr ? "يرجى ملء جميع حقول كلمة المرور" : "Please fill in all password fields")
      return
    }
    if (pwForm.new_password !== pwForm.new_password_confirmation) {
      toast.error(isAr ? "كلمات المرور الجديدة غير متطابقة" : "New passwords do not match")
      return
    }
    if (pwForm.new_password.length < 8) {
      toast.error(isAr ? "يجب أن تكون كلمة المرور 8 أحرف على الأقل" : "Password must be at least 8 characters")
      return
    }

    setSavingPw(true)
    try {
      const res = await fetch("/api/auth/profile/password", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-locale": locale,
        },
        body: JSON.stringify({
          current_password: pwForm.current_password,
          new_password: pwForm.new_password,
          new_password_confirmation: pwForm.new_password_confirmation,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || (isAr ? "فشل تغيير كلمة المرور" : "Failed to change password"))
      }

      setPwForm({ current_password: "", new_password: "", new_password_confirmation: "" })
      toast.success(isAr ? "تم تغيير كلمة المرور بنجاح ✓" : "Password changed successfully ✓")
    } catch (err: any) {
      toast.error(err.message || (isAr ? "حدث خطأ" : "An error occurred"))
    } finally {
      setSavingPw(false)
    }
  }

  const gradientTitle = cn(
    "bg-clip-text text-transparent font-bold bg-gradient-to-r from-[#032C44] to-[#41A0CA]"
  )

  return (
    <div className="space-y-8 pb-12" dir={isAr ? "rtl" : "ltr"}>
      {/* ── Page heading ── */}
      <div>
        <h1 className={cn("text-2xl", gradientTitle)}>
          {isAr ? "الملف الشخصي للمدير" : "Admin Profile"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isAr
            ? "تحديث معلومات حسابك الشخصي وصورتك وكلمة المرور"
            : "Update your personal account info, photo, and password"}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* ── Left: Avatar card ── */}
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm flex flex-col items-center gap-5 text-center">
          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#E4ECF5] shadow-md bg-[#F0F4F8] flex items-center justify-center">
              {avatar ? (
                <img
                  src={avatar}
                  alt={form.name || "Admin"}
                  className="w-full h-full object-cover"
                  onError={() => setAvatar("")}
                />
              ) : (
                <User className="w-12 h-12 text-[#006EA8] opacity-50" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 end-0 w-8 h-8 rounded-full bg-[#006EA8] text-white shadow-md flex items-center justify-center hover:bg-[#005685] transition-colors"
              title={isAr ? "تغيير الصورة" : "Change photo"}
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Name & role badge */}
          <div>
            <p className="text-[17px] font-bold text-[#032C44]">{form.name || "—"}</p>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#E4ECF5] px-3 py-1 text-xs font-bold text-[#006EA8]">
              <ShieldCheck className="h-3.5 w-3.5" />
              {isAr ? "مدير النظام" : "System Admin"}
            </span>
          </div>

          <p className="text-xs text-gray-400">
            {isAr
              ? "انقر على أيقونة الكاميرا لتغيير الصورة"
              : "Click the camera icon to change your photo"}
          </p>
        </div>

        {/* ── Right: Forms ── */}
        <div className="space-y-6">
          {/* Profile info form */}
          <form
            onSubmit={handleSaveProfile}
            className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm space-y-6"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-[#E5E7EB]">
              <User className="h-5 w-5 text-[#006EA8]" />
              <h2 className="font-bold text-[#111827]">
                {isAr ? "المعلومات الشخصية" : "Personal Information"}
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  {isAr ? "الاسم الكامل" : "Full Name"}
                </label>
                <div className="relative">
                  <User className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none", isAr ? "right-3" : "left-3")} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder={isAr ? "اسمك الكامل" : "Your full name"}
                    className={cn(
                      "w-full rounded-lg border border-[#E5E7EB] py-2.5 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8] bg-white text-[#111827]",
                      isAr ? "pr-9 pl-3" : "pl-9 pr-3"
                    )}
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  {isAr ? "البريد الإلكتروني" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none", isAr ? "right-3" : "left-3")} />
                  <input
                    type="email"
                    value={form.email}
                    readOnly
                    className={cn(
                      "w-full rounded-lg border border-[#E5E7EB] py-2.5 text-sm bg-[#F9FAFB] text-gray-500 cursor-not-allowed",
                      isAr ? "pr-9 pl-3" : "pl-9 pr-3"
                    )}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {isAr ? "لا يمكن تغيير البريد الإلكتروني" : "Email cannot be changed"}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  {isAr ? "رقم الهاتف" : "Phone Number"}
                </label>
                <div className="relative">
                  <Phone className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none", isAr ? "right-3" : "left-3")} />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder={isAr ? "رقم هاتفك" : "Your phone number"}
                    className={cn(
                      "w-full rounded-lg border border-[#E5E7EB] py-2.5 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8] bg-white text-[#111827]",
                      isAr ? "pr-9 pl-3" : "pl-9 pr-3"
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <PrimaryButton type="submit" disabled={savingProfile} className="h-10 px-8 text-sm w-auto">
                {savingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin me-2" />
                    {isAr ? "جاري الحفظ..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 me-2" />
                    {isAr ? "حفظ التغييرات" : "Save Changes"}
                  </>
                )}
              </PrimaryButton>
            </div>
          </form>

          {/* Change password form */}
          <form
            onSubmit={handleSavePassword}
            className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm space-y-6"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-[#E5E7EB]">
              <Lock className="h-5 w-5 text-[#006EA8]" />
              <h2 className="font-bold text-[#111827]">
                {isAr ? "تغيير كلمة المرور" : "Change Password"}
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Current password */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  {isAr ? "كلمة المرور الحالية" : "Current Password"}
                </label>
                <div className="relative">
                  <Lock className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none", isAr ? "right-3" : "left-3")} />
                  <input
                    type={showPw.current ? "text" : "password"}
                    value={pwForm.current_password}
                    onChange={(e) => setPwForm((p) => ({ ...p, current_password: e.target.value }))}
                    placeholder={isAr ? "أدخل كلمة المرور الحالية" : "Enter current password"}
                    className={cn(
                      "w-full rounded-lg border border-[#E5E7EB] py-2.5 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8] bg-white text-[#111827]",
                      isAr ? "pr-9 pl-10" : "pl-9 pr-10"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => ({ ...p, current: !p.current }))}
                    className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600", isAr ? "left-3" : "right-3")}
                  >
                    {showPw.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  {isAr ? "كلمة المرور الجديدة" : "New Password"}
                </label>
                <div className="relative">
                  <Lock className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none", isAr ? "right-3" : "left-3")} />
                  <input
                    type={showPw.new ? "text" : "password"}
                    value={pwForm.new_password}
                    onChange={(e) => setPwForm((p) => ({ ...p, new_password: e.target.value }))}
                    placeholder={isAr ? "كلمة مرور جديدة (8 أحرف+)" : "New password (8+ chars)"}
                    className={cn(
                      "w-full rounded-lg border border-[#E5E7EB] py-2.5 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8] bg-white text-[#111827]",
                      isAr ? "pr-9 pl-10" : "pl-9 pr-10"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => ({ ...p, new: !p.new }))}
                    className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600", isAr ? "left-3" : "right-3")}
                  >
                    {showPw.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm new password */}
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1.5">
                  {isAr ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
                </label>
                <div className="relative">
                  <Lock className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none", isAr ? "right-3" : "left-3")} />
                  <input
                    type={showPw.confirm ? "text" : "password"}
                    value={pwForm.new_password_confirmation}
                    onChange={(e) => setPwForm((p) => ({ ...p, new_password_confirmation: e.target.value }))}
                    placeholder={isAr ? "أعد إدخال كلمة المرور الجديدة" : "Re-enter new password"}
                    className={cn(
                      "w-full rounded-lg border border-[#E5E7EB] py-2.5 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8] bg-white text-[#111827]",
                      isAr ? "pr-9 pl-10" : "pl-9 pr-10"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}
                    className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600", isAr ? "left-3" : "right-3")}
                  >
                    {showPw.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <PrimaryButton
                type="submit"
                disabled={savingPw || !pwForm.current_password || !pwForm.new_password}
                className="h-10 px-8 text-sm w-auto"
              >
                {savingPw ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin me-2" />
                    {isAr ? "جاري التغيير..." : "Changing..."}
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 me-2" />
                    {isAr ? "تغيير كلمة المرور" : "Change Password"}
                  </>
                )}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
