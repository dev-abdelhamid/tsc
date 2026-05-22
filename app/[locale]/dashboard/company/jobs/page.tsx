// app/[locale]/dashboard/company/jobs/page.tsx
import { getSession } from "@/lib/session"
import { getCompanyJobs } from "@/lib/api/services/company.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function CompanyJobsPage() {
  const session = await getSession()
  const token = session.accessToken

  if (!token) {
    return <div>خطأ في التوثيق</div>
  }

  try {
    const { data: jobs } = await getCompanyJobs(token, 1, "ar")

    const statusConfig = {
      pending: { label: "انتظار", color: "bg-yellow-100 text-yellow-800" },
      approved: { label: "نشط", color: "bg-green-100 text-green-800" },
      rejected: { label: "مرفوض", color: "bg-red-100 text-red-800" },
      stopped: { label: "موقوف", color: "bg-gray-100 text-gray-800" },
    }

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">وظائفي</h1>
          <Link href="/dashboard/company/jobs/create">
            <Button>+ إضافة وظيفة جديدة</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>جميع الوظائف ({jobs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">لم تنشر أي وظائف بعد</p>
                <Link href="/dashboard/company/jobs/create">
                  <Button>نشر وظيفة جديدة</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-right py-3 px-4 font-semibold">الوظيفة</th>
                      <th className="text-right py-3 px-4 font-semibold">التصنيف</th>
                      <th className="text-right py-3 px-4 font-semibold">الحالة</th>
                      <th className="text-right py-3 px-4 font-semibold">الطلبات</th>
                      <th className="text-right py-3 px-4 font-semibold">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold">{job.title}</td>
                        <td className="py-3 px-4">{job.category.name}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              statusConfig[job.status as keyof typeof statusConfig]
                                ?.color || "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {statusConfig[job.status as keyof typeof statusConfig]?.label ||
                              job.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link
                            href={`/dashboard/company/jobs/${job.id}/applications`}
                            className="font-semibold text-blue-600"
                          >
                            {job.applications_count || 0}
                          </Link>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <Link href={`/dashboard/company/jobs/${job.id}`}>
                            <button className="text-blue-600 hover:underline">تعديل</button>
                          </Link>
                          <button className="text-red-600 hover:underline">حذف</button>
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
  } catch (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">حدث خطأ في تحميل البيانات</div>
      </div>
    )
  }
}
