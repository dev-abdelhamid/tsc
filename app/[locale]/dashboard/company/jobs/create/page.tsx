// app/[locale]/dashboard/company/jobs/create/page.tsx
"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function CreateJobPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    employment_type: "",
    country_id: "",
    city_id: "",
    salary_from: "",
    salary_to: "",
    currency: "EUR",
    description: "",
    requirements: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Submit to API
      console.log("Submitting job:", formData)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">نشر وظيفة جديدة</h1>

      {/* Steps Indicator */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 mx-2 text-center`}>
            <div
              className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold mb-2 ${
                s === step
                  ? "bg-blue-600 text-white"
                  : s < step
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {s}
            </div>
            <span className="text-sm">
              {s === 1 ? "المعلومات الأساسية" : s === 2 ? "الموقع والراتب" : "التفاصيل"}
            </span>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1
              ? "المعلومات الأساسية"
              : step === 2
                ? "الموقع والراتب"
                : "التفاصيل الكاملة"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1 */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">عنوان الوظيفة</label>
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="مثال: مهندس برمجيات"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">التصنيف</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="">اختر التصنيف</option>
                    <option value="1">تطوير البرمجيات</option>
                    <option value="2">الهندسة</option>
                    <option value="3">الرعاية الصحية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">نوع التوظيف</label>
                  <select
                    name="employment_type"
                    value={formData.employment_type}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="">اختر النوع</option>
                    <option value="full-time">دوام كامل</option>
                    <option value="part-time">دوام جزئي</option>
                    <option value="contract">عقد</option>
                  </select>
                </div>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">الدولة</label>
                    <select
                      name="country_id"
                      value={formData.country_id}
                      onChange={handleChange}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="">اختر الدولة</option>
                      <option value="1">ألمانيا</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">المدينة</label>
                    <select
                      name="city_id"
                      value={formData.city_id}
                      onChange={handleChange}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="">اختر المدينة</option>
                      <option value="1">برلين</option>
                      <option value="2">فرانكفورت</option>
                      <option value="3">ميونخ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">الراتب من</label>
                    <Input
                      type="number"
                      name="salary_from"
                      value={formData.salary_from}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">الراتب إلى</label>
                    <Input
                      type="number"
                      name="salary_to"
                      value={formData.salary_to}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">العملة</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="EUR">€ يورو</option>
                      <option value="USD">$ دولار</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">الوصف</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2"
                    rows={5}
                    placeholder="اكتب وصفاً تفصيلياً للوظيفة..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">المتطلبات</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2"
                    rows={5}
                    placeholder="اكتب متطلبات الوظيفة..."
                  />
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-between gap-4 mt-6">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  variant="outline"
                >
                  السابق
                </Button>
              )}

              <Button
                type="submit"
                className="flex-1"
              >
                {step === 3 ? "نشر الوظيفة" : "التالي"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
