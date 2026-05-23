const FALLBACK_IMAGES = [
  "/home/content/news-feature.png",
  "/home/content/news-1.png",
  "/home/content/news-2.png",
  "/home/content/news-3.png",
] as const

export function resolveNewsImageUrl(image?: string | null, index = 0): string {
  const src = image?.trim()
  if (!src) return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]

  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src
  }

  const base = (process.env.NEXT_PUBLIC_STORAGE_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(
    /\/api\/v1\/?$/,
    ""
  )
  if (!base) return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
  return `${base.replace(/\/$/, "")}/${src.replace(/^\//, "")}`
}
