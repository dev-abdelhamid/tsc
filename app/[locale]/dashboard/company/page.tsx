"use client"

import { useState, useEffect } from "react"
import { Briefcase, Users, Ticket } from "lucide-react"
import { StatCard } from "@/features/dashboard/components/stat-card"
import { LastJobTable } from "@/features/dashboard/components/last-job-table"
import { useLocale } from "next-intl"

interface Job {
  id: number
  title: string
  appliedCandidates: number
  deadline: string
  status: "approved" | "rejected" | "pending"
}

interface Stats {
  totalJobs: number
  totalApplicants: number
  totalTickets: number
}

export default function CompanyDashboardPage() {
  const locale = useLocale()
  const isRTL = locale === "ar"
  const [stats, setStats] = useState<Stats>({
    totalJobs: 20,
    totalApplicants: 20,
    totalTickets: 20,
  })
  const [jobs, setJobs] = useState<Job[]>([
    { id: 1, title: "Software Engineer", appliedCandidates: 4, deadline: "12/12/2027", status: "approved" },
    { id: 2, title: "Product Manager", appliedCandidates: 0, deadline: "12/12/2027", status: "rejected" },
    { id: 3, title: "UX Designer", appliedCandidates: 0, deadline: "12/12/2027", status: "pending" },
    { id: 4, title: "Data Analyst", appliedCandidates: 12, deadline: "12/12/2027", status: "approved" },
    { id: 5, title: "DevOps Engineer", appliedCandidates: 0, deadline: "12/12/2027", status: "pending" },
    { id: 6, title: "Marketing Specialist", appliedCandidates: 0, deadline: "12/12/2027", status: "rejected" },
    { id: 7, title: "Sales Representative", appliedCandidates: 0, deadline: "12/12/2027", status: "pending" },
  ])

  const t = {
    totalJobs: locale === "ar" ? "إجمالي الوظائف" : "Total Jobs",
    totalApplicants: locale === "ar" ? "إجمالي المتقدمين" : "Total Job Applicants",
    totalTickets: locale === "ar" ? "إجمالي التذاكر" : "Total Ticket",
    lastJob: locale === "ar" ? "آخر الوظائف" : "Last Job",
    job: locale === "ar" ? "وظيفة" : "Job",
    application: locale === "ar" ? "طلب" : "application",
    ticket: locale === "ar" ? "تذكرة" : "ticket",
    viewAll: locale === "ar" ? "عرض الكل" : "View All",
  }

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        // TODO: Replace with actual API calls
        // const statsData = await getCompanyStats(token, locale)
        // const jobsData = await getCompanyJobs(token, 1, locale)
        // setStats(statsData)
        // setJobs(jobsData.data || [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      }
    }
    fetchData()
  }, [locale])

  return (
    <div className="min-h-screen ">
      {/* Main Content */}
      <div className="max-w-[1512px] mx-auto  ">
        {/* Stats Cards */}
        <div className={`flex gap-6 mb-8`}>
          <StatCard
            icon={Briefcase}
            title={t.totalJobs}
            value={stats.totalJobs}
            unit={t.job}
            href="/dashboard/company/jobs"
            linkText={t.viewAll}
            locale={locale}
          />
          <StatCard
            icon={Users}
            title={t.totalApplicants}
            value={stats.totalApplicants}
            unit={t.application}
            href="/dashboard/company/applicants"
            linkText={t.viewAll}
            locale={locale}
          />
          <StatCard
            icon={Ticket}
            title={t.totalTickets}
            value={stats.totalTickets}
            unit={t.ticket}
            href="/dashboard/company/tickets"
            linkText={t.viewAll}
            locale={locale}
          />
        </div>

        {/* Last Job Table */}
        <LastJobTable 
          jobs={jobs} 
          title={t.lastJob}
        />
      </div>
    </div>
  )
}