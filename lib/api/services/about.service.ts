import { api } from "../client"
import type { ApiResponse } from "../types"

export type AboutFeature = {
  id: number | string
  title: string
  description: string
}

export type AboutPageContent = {
  title: string
  descriptionLeft: string
  descriptionRight: string
  secondTitle: string
  secondDescription: string
  image?: string | null
  secondImage?: string | null
  video?: string | null
  features: AboutFeature[]
}

function pickLocalizedString(value: unknown, locale = "ar"): string {
  if (typeof value === "string") return value
  if (!value || typeof value !== "object") return ""

  const map = value as Record<string, unknown>
  const priority = [locale, "ar", "en", "de"]

  for (const key of priority) {
    const candidate = map[key]
    if (typeof candidate === "string" && candidate.trim()) return candidate
  }

  for (const candidate of Object.values(map)) {
    if (typeof candidate === "string" && candidate.trim()) return candidate
  }

  return ""
}

function extractData(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null

  const root = raw as Record<string, unknown>
  if (root.data && typeof root.data === "object" && !Array.isArray(root.data)) {
    return root.data as Record<string, unknown>
  }

  return root
}

function normalizeFeatures(raw: unknown, locale = "ar"): AboutFeature[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null

      const row = item as Record<string, unknown>
      const title = pickLocalizedString(row.title, locale)
      const description = pickLocalizedString(row.description ?? row.description_en ?? row.description_ar, locale)

      if (!title && !description) return null

      return {
        id: typeof row.id === "number" ? row.id : typeof row.id === "string" ? row.id : index + 1,
        title: title || "—",
        description: description || "",
      }
    })
    .filter((row): row is AboutFeature => row !== null)
}

function normalizeAbout(raw: unknown, locale = "ar"): AboutPageContent | null {
  const data = extractData(raw)
  if (!data) return null

  const title = pickLocalizedString(data.title, locale)
  const descriptionLeft = pickLocalizedString(data.description_left ?? data.descriptionLeft ?? data.description, locale)
  const descriptionRight = pickLocalizedString(data.description_right ?? data.descriptionRight ?? data.description_left, locale)
  const secondTitle = pickLocalizedString(data.second_title ?? data.secondTitle ?? data.title, locale)
  const secondDescription = pickLocalizedString(data.second_description ?? data.secondDescription ?? data.description_right ?? data.description_left, locale)
  const image = typeof data.image === "string" ? data.image : typeof data.image_url === "string" ? data.image_url : null
  const secondImage =
    typeof data.second_image === "string"
      ? data.second_image
      : typeof data.second_image_url === "string"
        ? data.second_image_url
        : null
  const video = typeof data.video === "string" ? data.video : null
  const features = normalizeFeatures(data.features, locale)

  if (!title && !descriptionLeft && !descriptionRight && !secondTitle && !secondDescription && features.length === 0) {
    return null
  }

  return {
    title: title || "",
    descriptionLeft: descriptionLeft || "",
    descriptionRight: descriptionRight || "",
    secondTitle: secondTitle || title || "",
    secondDescription: secondDescription || descriptionLeft || "",
    image,
    secondImage,
    video,
    features,
  }
}

export async function getAbout(locale = "ar"): Promise<AboutPageContent | null> {
  const endpoints = ["/public/about", "/about"]

  for (const endpoint of endpoints) {
    try {
      const response = await api.get<unknown>(endpoint, {
        locale,
        cache: "force-cache",
      })
      const normalized = normalizeAbout(response, locale)
      if (normalized) return normalized
    } catch (err) {
      console.error(err)
    }
  }

  return null
}

export async function getAdminAbout(token: string, locale = "ar"): Promise<AboutPageContent | null> {
  const response = await api.get<unknown>("/about", { token, locale })
  return normalizeAbout(response, locale)
}

export async function updateAbout(formData: FormData, token: string, locale = "ar"): Promise<AboutPageContent | null> {
  const response = await api.post<ApiResponse<unknown>>("/about", formData, { token, locale })
  return normalizeAbout(response, locale)
}
