// app/[locale]/dashboard/user/profile/page.tsx
"use client"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function UserProfilePage() {
  const { loading } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [message, setMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // This will be connected to updateProfile service
    setMessage("سيتم حفظ البيانات قريباً...")
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    // This will be connected to updatePassword service
    setMessage("سيتم تحديث كلمة المرور قريباً...")
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">ملفي الشخصي</h1>

      {message && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded-lg">
          {message}
        </div>
      )}

      {/* Profile Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>بيانات الملف الشخصي</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">الاسم</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="أدخل اسمك"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="أدخل بريدك الإلكتروني"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="أدخل رقم الهاتف"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "جاري الحفظ..." : "حفظ البيانات"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle>تغيير كلمة المرور</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">كلمة المرور الحالية</label>
              <Input type="password" placeholder="أدخل كلمة المرور الحالية" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">كلمة المرور الجديدة</label>
              <Input type="password" placeholder="أدخل كلمة مرور جديدة" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">تأكيد كلمة المرور</label>
              <Input type="password" placeholder="أعد إدخال كلمة المرور الجديدة" />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
