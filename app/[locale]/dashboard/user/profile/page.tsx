// app/[locale]/dashboard/user/profile/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="p-6 max-w-[1120px] mx-auto">
      <h1 className="text-3xl font-bold mb-6">ملفي الشخصي</h1>

      {message && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded-lg">{message}</div>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>البيانات الأساسية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-start gap-8">
            <form onSubmit={handleSubmit} className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم الأول</label>
                <Input name="first_name" value={profile.first_name} onChange={handleChange} placeholder="الاسم الأول" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">اسم العائلة</label>
                <Input name="last_name" value={profile.last_name} onChange={handleChange} placeholder="اسم العائلة" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                <Input name="email" value={profile.email} onChange={handleChange} placeholder="example@mail.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الجنس</label>
                <select aria-label="gender" name="gender" value={profile.gender} onChange={handleChange} className="w-full border-b border-gray-200 py-2 bg-transparent">
                  <option value="">اختر</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">تاريخ الميلاد</label>
                <Input type="date" name="dob" value={profile.dob} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                <Input name="phone" value={profile.phone} onChange={handleChange} placeholder="+20xxxxxxxxx" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">الدولة</label>
                <Input name="country" value={profile.country} onChange={handleChange} placeholder="Country" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الفئة</label>
                <Input name="category" value={profile.category} onChange={handleChange} placeholder="Category" />
              </div>

              <div className="col-span-1 lg:col-span-2">
                <div className="flex justify-center">
                  <button type="submit" disabled={saving || loading} className="px-12 py-3 rounded-full bg-gradient-to-r from-[#006EA8] to-[#005685] text-white shadow-[0_24px_48px_rgba(0,86,133,0.16)]">
                    {saving ? "جاري الحفظ..." : "تحديث"}
                  </button>
                </div>
              </div>
            </form>

            {/* Avatar + Upload */}
            <div className="w-full lg:w-[260px] flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar size="lg">
                  {avatarPreview ? (
                    // AvatarImage expects src prop
                    <AvatarImage src={avatarPreview} alt="avatar" />
                  ) : (
                    <AvatarFallback>{(profile.first_name || profile.email || "").charAt(0).toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                <label className="absolute right-0 bottom-0">
                  <input accept="image/*" onChange={handleAvatarChange} type="file" className="hidden" />
                  <span className="inline-flex items-center justify-center px-3 py-2 bg-white text-sm rounded-full border">رفع</span>
                </label>
              </div>

              <div className="w-full">
                <h4 className="text-sm font-medium">Linked accounts</h4>
                <div className="flex gap-3 mt-3">
                  <button className="flex-1 py-2 rounded bg-[#1877F2] text-white">Facebook</button>
                  <button className="flex-1 py-2 rounded border">LinkedIn</button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تغيير كلمة المرور</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="grid grid-cols-1 gap-4">
            <Input name="current_password" type="password" placeholder="كلمة المرور الحالية" />
            <Input name="new_password" type="password" placeholder="كلمة المرور الجديدة" />
            <Input name="new_password_confirmation" type="password" placeholder="تأكيد كلمة المرور" />
            <div className="flex justify-center">
              <button type="submit" disabled={saving || loading} className="px-12 py-3 rounded-full bg-gradient-to-r from-[#006EA8] to-[#005685] text-white">
                {saving ? "جاري التحديث..." : "تحديث كلمة المرور"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
