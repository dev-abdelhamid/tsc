// app/[locale]/dashboard/user/profile/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function UserProfilePage() {
  const { loading } = useAuth()

  const [profile, setProfile] = useState<Record<string, any>>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    country: "",
    category: "",
    sub_category: "",
    avatar: "",
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    async function loadProfile() {
      setFetching(true)
      try {
        const res = await fetch("/api/auth/profile")
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "فشل جلب البيانات")
        if (!mounted) return
        const p: any = data.data || {}
        const parts = (p.name || "").split(" ")
        setProfile({
          first_name: parts.shift() || "",
          last_name: parts.join(" ") || "",
          email: p.email || "",
          phone: p.phone || "",
          gender: p.gender || "",
          dob: p.dob || "",
          country: p.country?.name || "",
          category: p.category?.name || "",
          sub_category: p.sub_category?.name || "",
          avatar: p.avatar || "",
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
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
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
      const form = new FormData()
      form.append("name", `${profile.first_name} ${profile.last_name}`)
      form.append("email", profile.email || "")
      form.append("phone", profile.phone || "")
      if (profile.gender) form.append("gender", profile.gender)
      if (profile.dob) form.append("dob", profile.dob)
      if (profile.country) form.append("country", profile.country)
      if (profile.category) form.append("category", profile.category)
      if (profile.sub_category) form.append("sub_category", profile.sub_category)
      if (avatarFile) form.append("avatar", avatarFile)

      const res = await fetch("/api/auth/profile", {
        method: "POST",
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "فشل حفظ البيانات")
      setMessage("تم حفظ البيانات بنجاح")
      if (data.data?.avatar) setAvatarPreview(data.data.avatar)
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "فشل حفظ البيانات")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      const form = e.target as HTMLFormElement
      const fd = new FormData(form)
      const payload = {
        current_password: fd.get("current_password"),
        new_password: fd.get("new_password"),
        new_password_confirmation: fd.get("new_password_confirmation"),
      }
      const res = await fetch("/api/auth/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "فشل تغيير كلمة المرور")
      setMessage("تم تحديث كلمة المرور بنجاح")
      form.reset()
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "فشل تغيير كلمة المرور")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full">
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">البيانات الأساسية</h1>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm sm:text-base">
            {message}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 order-first lg:order-last">
            <div className="relative">
              <Avatar size="lg">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="avatar" />
                ) : (
                  <AvatarFallback>
                    {(profile.first_name || profile.email || "").charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <label className="absolute bottom-0 right-0">
                <input
                  accept="image/*"
                  onChange={handleAvatarChange}
                  type="file"
                  className="hidden"
                />
                <span className="inline-flex items-center justify-center px-3 py-2 bg-white text-xs sm:text-sm rounded-full border border-gray-200 cursor-pointer hover:bg-gray-50">
                  رفع
                </span>
              </label>
            </div>

            {/* Linked Accounts */}
            <div className="w-full">
              <h4 className="text-xs sm:text-sm font-semibold text-[#111827] mb-3">
                الحسابات المرتبطة
              </h4>
              <div className="flex gap-2 sm:gap-3">
                <button className="flex-1 py-2 rounded text-xs sm:text-sm bg-[#1877F2] text-white hover:bg-[#1563D3] transition">
                  Facebook
                </button>
                <button className="flex-1 py-2 rounded text-xs sm:text-sm border border-gray-300 hover:bg-gray-50 transition">
                  LinkedIn
                </button>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="flex-1 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                  الاسم الأول
                </label>
                <Input
                  name="first_name"
                  value={profile.first_name}
                  onChange={handleChange}
                  placeholder="الاسم الأول"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                  اسم العائلة
                </label>
                <Input
                  name="last_name"
                  value={profile.last_name}
                  onChange={handleChange}
                  placeholder="اسم العائلة"
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                  البريد الإلكتروني
                </label>
                <Input
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="example@mail.com"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                  الجنس
                </label>
                <select
                  aria-label="gender"
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  className="w-full border-b border-gray-200 py-2 bg-transparent text-sm focus:outline-none"
                >
                  <option value="">اختر</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                  <option value="other">آخر</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                  تاريخ الميلاد
                </label>
                <Input
                  type="date"
                  name="dob"
                  value={profile.dob}
                  onChange={handleChange}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                  رقم الهاتف
                </label>
                <Input
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="+20xxxxxxxxx"
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                  الدولة
                </label>
                <Input
                  name="country"
                  value={profile.country}
                  onChange={handleChange}
                  placeholder="الدولة"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                  الفئة
                </label>
                <Input
                  name="category"
                  value={profile.category}
                  onChange={handleChange}
                  placeholder="الفئة"
                  className="text-sm"
                />
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={saving || loading}
                className="px-8 sm:px-12 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#006EA8] to-[#005685] text-white text-sm sm:text-base font-semibold shadow-[0_24px_48px_rgba(0,86,133,0.16)] hover:shadow-[0_24px_48px_rgba(0,86,133,0.24)] transition disabled:opacity-60"
              >
                {saving ? "جاري الحفظ..." : "تحديث"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="mt-4 sm:mt-6 rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-bold text-[#111827] mb-4 sm:mb-6">
          تغيير كلمة المرور
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
              كلمة المرور الحالية
            </label>
            <Input
              name="current_password"
              type="password"
              placeholder="كلمة المرور الحالية"
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
              كلمة المرور الجديدة
            </label>
            <Input
              name="new_password"
              type="password"
              placeholder="كلمة المرور الجديدة"
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
              تأكيد كلمة المرور
            </label>
            <Input
              name="new_password_confirmation"
              type="password"
              placeholder="تأكيد كلمة المرور"
              className="text-sm"
            />
          </div>
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={saving || loading}
              className="px-8 sm:px-12 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#006EA8] to-[#005685] text-white text-sm sm:text-base font-semibold hover:shadow-[0_24px_48px_rgba(0,86,133,0.24)] transition disabled:opacity-60"
            >
              {saving ? "جاري التحديث..." : "تحديث كلمة المرور"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
