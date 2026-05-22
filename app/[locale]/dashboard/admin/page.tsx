// app/[locale]/dashboard/admin/page.tsx
import { getSession } from "@/lib/session"
import { getAdminStats, getAdminJobs } from "@/lib/api/services/admin.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminDashboardPage() {
  const session = await getSession()
  const token = session.accessToken

  if (!token || session.user?.role !== "admin") {
    return <div>غير مخول للوصول</div>
  }

  try {
    const stats = await getAdminStats(token, "ar")
    const { data: pendingJobs } = await getAdminJobs(token, "pending", 1, "ar")

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">لوحة تحكم الإدارة</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                إجمالي المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                إجمالي الشركات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_companies}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                إجمالي الوظائف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_jobs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                الوظائف المعلقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.pending_jobs}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Jobs for Review */}
        <Card>
          <CardHeader>
            <CardTitle>الوظائف بانتظار المراجعة</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingJobs.length === 0 ? (
              <p className="text-gray-500">لا توجد وظائف بانتظار المراجعة</p>
            ) : (
              <div className="space-y-4">
                {pendingJobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="flex justify-between items-start p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.company.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{job.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600">
                        موافقة
                      </button>
                      <button className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600">
                        رفض
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">حدث خطأ في تحميل البيانات</div>
      </div>
    )
  }
}
