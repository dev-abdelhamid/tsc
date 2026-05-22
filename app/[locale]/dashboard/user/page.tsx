// app/[locale]/dashboard/user/page.tsx
import { getSession } from "@/lib/session"
import { getUserStats, getMyApplications } from "@/lib/api/services/user.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function UserDashboardPage() {
  const session = await getSession()
  const token = session.accessToken

  if (!token) {
    return <div>خطأ في التوثيق</div>
  }

  try {
    const stats = await getUserStats(token, "ar")
    const { data: applications } = await getMyApplications(token, 1, "ar")

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">لوحة تحكم المستخدم</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                إجمالي الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_applications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                الطلبات المعلقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.pending_applications}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                الطلبات المقبولة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.accepted_applications}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                الطلبات المرفوضة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {stats.rejected_applications}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>آخر الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <p className="text-gray-500">لا توجد طلبات حتى الآن</p>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{app.job.title}</p>
                      <p className="text-sm text-gray-500">
                        {app.job.company.name}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        app.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : app.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {app.status === "pending"
                        ? "معلق"
                        : app.status === "accepted"
                          ? "مقبول"
                          : "مرفوض"}
                    </span>
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
