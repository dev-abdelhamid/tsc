export { cn } from "@/hooks/lib/utils"

export function resolveImageUrl(src?: string | null): string {
  if (!src) return ""
  const clean = src.trim()
  if (!clean) return ""
  
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:") || clean.startsWith("blob:")) {
    return clean
  }
  
  const base = (process.env.NEXT_PUBLIC_STORAGE_URL || process.env.NEXT_PUBLIC_API_URL || "https://cv.subcodeco.com").replace(
    /\/api\/v1\/?$/,
    ""
  ).replace(/\/$/, "")

  if (clean.startsWith("/storage/")) {
    return `${base}${clean}`
  }
  if (clean.startsWith("storage/")) {
    return `${base}/${clean}`
  }
  if (clean.startsWith("/")) {
    return clean
  }
  return `${base}/${clean}`
}
