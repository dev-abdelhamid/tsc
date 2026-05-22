// app/[locale]/dashboard/admin/jobs/page.tsx
import { getSession } from "@/lib/session"
import { getAdminJobs } from "@/lib/api/services/admin.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminJobsPage() {
  const session = await getSession()
  const token = session.accessToken

  if (!token || session.user?.role !== "admin") {
    return <div>غير مخول للوصول</div>
  }

  try {
    const { data: pendingJobs } = await getAdminJobs(token, "pending", 1, "ar")
    const { data: approvedJobs } = await getAdminJobs(token, "approved", 1, "ar")
    const { data: rejectedJobs } = await getAdminJobs(token, "rejected", 1, "ar")

    const JobsTable = ({ jobs, title }: { jobs: any[]; title: string }) => (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-gray-500">لا توجد وظائف</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-right py-3 px-4 font-semibold">الوظيفة</th>
                    <th className="text-right py-3 px-4 font-semibold">الشركة</th>
                    <th className="text-right py-3 px-4 font-semibold">التصنيف</th>
                    <th className="text-right py-3 px-4 font-semibold">الراتب</th>
                    <th className="text-right py-3 px-4 font-semibold">الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold">{job.title}</td>
                      <td className="py-3 px-4">{job.company.name}</td>
                      <td className="py-3 px-4">{job.category.name}</td>
                      <td className="py-3 px-4">
                        €{job.salary_from} - €{job.salary_to}
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button className="text-green-600 hover:underline">موافقة</button>
                        <button className="text-red-600 hover:underline">رفض</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    )

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">إدارة الوظائف</h1>

        <JobsTable jobs={pendingJobs} title="الوظائف بانتظار المراجعة" />
        <JobsTable jobs={approvedJobs} title="الوظائف المنشورة" />
        <JobsTable jobs={rejectedJobs} title="الوظائف المرفوضة" />
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
