import { redirect } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/auth-token"
import { normalizeRole } from "@/lib/auth-token"
import { getAdminJobs } from "@/lib/api/services/admin.service"
import type { Job } from "@/lib/api/types"
import { AdminJobsPanel } from "@/features/admin/components/admin-jobs-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

const VALID_TABS = ["pending", "approved", "rejected", "all"] as const

type Tab = (typeof VALID_TABS)[number]

export default async function AdminJobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const { status: statusParam } = await searchParams
  const session = await getSession()
  const t = await getTranslations("Admin.jobs")

    if (!session.user || normalizeRole(session.user) !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const needsClientPersist = Boolean((session as unknown as { __needsClientPersist?: boolean }).__needsClientPersist)

  const statuses = ["pending", "approved", "active", "rejected"] as const
  let jobs: Job[] = []
  let serverCounts: { total: number; pending: number; approved: number; rejected: number } | undefined = undefined

  try {
    const token = session.accessToken as string | undefined
    if (!token) {
      jobs = []
    } else {
      const results = await Promise.all(
        statuses.map((s) =>
          getAdminJobs(token, s, 1, locale).catch(() => ({ data: [], meta: { total: 0, last_page: 1 } }))
        )
      )

      const batches = results.map((r) => r.data)

      const seen = new Set<number>()
      const collected: Job[] = []
      for (const batch of batches) {
        for (const job of batch) {
          if (!seen.has(job.id)) {
            seen.add(job.id)
            collected.push(job)
          }
        }
      }
      jobs = collected

      // Build server-side counts (prefer meta.total when available)
      try {
        // Compute per-status totals from meta when available (fallback to fetched page lengths)
        const perStatusTotals = results.map((r) => Number(r.meta?.total ?? (Array.isArray(r.data) ? r.data.length : 0)))
        const pendingCount = perStatusTotals[0] ?? 0
        const approvedCount = (perStatusTotals[1] ?? 0) + (perStatusTotals[2] ?? 0)
        const rejectedCount = perStatusTotals[3] ?? 0

        const allRes = await getAdminJobs(token as string, undefined, 1, locale).catch(() => ({ data: [], meta: { total: 0, last_page: 1 } }))

        // Compute sums and authoritative total: prefer the sum of per-status
        // totals when `allRes.meta.total` appears inconsistent. Fall back to
        // the number of unique jobs we've collected when meta is unreliable.
        const perStatusSum = perStatusTotals.reduce((s, v) => s + v, 0)
        const allMetaTotal = Number(allRes.meta?.total ?? -1)

        let totalCount: number
        if (allMetaTotal >= 0 && allMetaTotal === perStatusSum) {
          totalCount = allMetaTotal
        } else if (perStatusSum > 0) {
          // If per-status totals are available use their sum (more reliable
          // for consistency across status endpoints).
          totalCount = perStatusSum
        } else {
          // As a last resort use the number of unique jobs already fetched.
          totalCount = jobs.length
        }

        if (process.env.NODE_ENV === "development") {
          if (allMetaTotal >= 0 && allMetaTotal !== perStatusSum) {
            // eslint-disable-next-line no-console
            console.warn("[AdminJobsPage] totals mismatch:", { allMetaTotal, perStatusTotals, perStatusSum, collected: jobs.length })
          }
        }

        serverCounts = {
          total: Number(totalCount || 0),
          pending: Number(pendingCount || 0),
          approved: Number(approvedCount || 0),
          rejected: Number(rejectedCount || 0),
        }

        // If server reports more jobs than we've collected from the first pages,
        // try fetching remaining pages from the unfiltered /admin/jobs endpoint
        // and from per-status endpoints (approved/active) to surface the
        // missing rows in the table (useful when totals span pages).
        try {
          const lastPage = Number(allRes.meta?.last_page ?? 1)
          if (lastPage > 1 && (jobs.length || 0) < totalCount) {
            for (let p = 2; p <= lastPage; p++) {
              const next = await getAdminJobs(token as string, undefined, p, locale).catch(() => ({ data: [], meta: { total: 0 } }))
              for (const job of next.data) {
                if (!jobs.find((j) => j.id === job.id)) jobs.push(job)
              }
              if (jobs.length >= totalCount) break
            }
          }

          // Ensure we fetch more pages for approved/active if their totals
          // indicate more items than we've collected for the published group.
          const collectedApproved = jobs.filter((j) => {
            const s = j.status || ""
            return s === "approved" || s === "active"
          }).length
          const desiredApproved = (results[1].meta?.total ?? 0) + (results[2].meta?.total ?? 0)

          if (desiredApproved > collectedApproved) {
            // Fetch additional pages for both 'approved' and 'active'
            const statusIndices = [1, 2] // approved, active
            for (const idx of statusIndices) {
              const status = statuses[idx]
              const last = Number(results[idx].meta?.last_page ?? 1)
              if (last <= 1) continue
              for (let p = 2; p <= last; p++) {
                const pageRes = await getAdminJobs(token as string, status, p, locale).catch(() => ({ data: [], meta: { total: 0 } }))
                for (const job of pageRes.data) {
                  if (!jobs.find((j) => j.id === job.id)) jobs.push(job)
                }
                const newCollected = jobs.filter((j) => j.status === "approved" || j.status === "active").length
                if (newCollected >= desiredApproved) break
              }
              const nowCollected = jobs.filter((j) => j.status === "approved" || j.status === "active").length
              if (nowCollected >= desiredApproved) break
            }
          }
        } catch (e) {
          // ignore pagination failures; table will show what was fetched
        }
      } catch (e) {
        serverCounts = undefined
      }

      // If jobs were fetched, we may inspect sample data in development only
      if (process.env.NODE_ENV === "development" && jobs.length > 0) {
        // intentionally left blank — avoid noisy logs in production
      }

      // no-op return
    }
  } catch (err) {
    console.error(err)
    // If refresh/auth fails, present an empty list but allow client-side SessionPersist to run
    jobs = []
  }

  const initialTab: Tab =
    statusParam && VALID_TABS.includes(statusParam as Tab) ? (statusParam as Tab) : "all"

  return (
    <AdminPageLayout title={t("title")} description={t("description")} needsClientPersist={needsClientPersist}>
      <AdminJobsPanel jobs={jobs} locale={locale} initialTab={initialTab} serverCounts={serverCounts} />
    </AdminPageLayout>
  )
}
