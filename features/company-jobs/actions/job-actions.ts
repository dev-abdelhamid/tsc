"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/session"
import {
  createJob,
  deleteJob,
  stopJob,
  type CreateJobPayload,
} from "@/lib/api/services/company.service"
import { formatApiValidationMessage } from "@/features/company-jobs/lib/format-api-error"

export type ActionResult = { ok: true } | { ok: false; message: string }

export async function submitCreateJobAction(
  payload: CreateJobPayload,
  locale: string
): Promise<ActionResult> {
  const session = await getSession()
  if (!session.accessToken) {
    return { ok: false, message: "unauthorized" }
  }

  try {
    await createJob(payload, session.accessToken, locale)
    revalidatePath(`/${locale}/dashboard/company/jobs`)
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      message: formatApiValidationMessage(err, "Failed to create job"),
    }
  }
}

export async function deleteCompanyJobAction(
  jobId: number,
  locale: string
): Promise<ActionResult> {
  const session = await getSession()
  if (!session.accessToken) {
    return { ok: false, message: "unauthorized" }
  }

  try {
    await deleteJob(jobId, session.accessToken, locale)
    revalidatePath(`/${locale}/dashboard/company/jobs`)
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Failed to delete",
    }
  }
}

export async function stopCompanyJobAction(
  jobId: number,
  locale: string
): Promise<ActionResult> {
  const session = await getSession()
  if (!session.accessToken) {
    return { ok: false, message: "unauthorized" }
  }

  try {
    await stopJob(jobId, session.accessToken, locale)
    revalidatePath(`/${locale}/dashboard/company/jobs`)
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Failed to stop job",
    }
  }
}
