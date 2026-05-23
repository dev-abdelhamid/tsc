// app/[locale]/dashboard/user/applications/page.tsx
import { getSession } from "@/lib/session"
import { getMyApplications } from "@/lib/api/services/user.service"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import type { JobApplication } from "@/lib/api/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function UserApplicationsPage() {
  const session = await getSession()
  const token = session.accessToken

  if (!token) {
    return <div>خطأ في التوثيق</div>
  }

  let applications: JobApplication[] = []
  try {
    const { data } = await getMyApplications(token, 1, "ar")
    applications = data || []
  } catch (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">حدث خطأ في تحميل البيانات</div>
      </div>
    )
  }

  const statusConfig = {
    pending: { label: "معلق", color: "bg-yellow-100 text-yellow-800" },
    accepted: { label: "مقبول", color: "bg-green-100 text-green-800" },
    rejected: { label: "مرفوض", color: "bg-red-100 text-red-800" },
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">طلباتي للوظائف</h1>

      <Card>
        <CardHeader>
          <CardTitle>جميع الطلبات ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">لم تقدم على أي وظائف بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-right py-3 px-4 font-semibold">الوظيفة</th>
                    <th className="text-right py-3 px-4 font-semibold">الشركة</th>
                    <th className="text-right py-3 px-4 font-semibold">تاريخ التقديم</th>
                    <th className="text-right py-3 px-4 font-semibold">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold">الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{getJobTitle(app.job, "ar")}</td>
                      <td className="py-3 px-4">{app.job.company?.name ?? "—"}</td>
                      <td className="py-3 px-4">
                        {new Date(app.applied_at).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            statusConfig[app.status as keyof typeof statusConfig]
                              ?.color || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {statusConfig[app.status as keyof typeof statusConfig]?.label ||
                            app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-blue-600 hover:underline">عرض التفاصيل</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
