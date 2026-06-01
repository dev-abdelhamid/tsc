"use client"

import * as React from "react"
import { Bookmark } from "lucide-react"
import { toast } from "sonner"
import { toggleFavorite } from "@/lib/api/services/jobs.service"
import { useAuth } from "@/hooks/use-auth"

type FavoriteButtonProps = {
  jobId: number
  locale?: string
  initialIsFavorite?: boolean
}

export function FavoriteButton({ 
  jobId, 
  locale = "ar", 
  initialIsFavorite = false 
}: FavoriteButtonProps) {
  const { session } = useAuth()
  const [isFavorite, setIsFavorite] = React.useState(initialIsFavorite)
  const [loading, setLoading] = React.useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Check if user is logged in
    if (!session?.accessToken) {
      const message = locale === "ar" 
        ? "يجب تسجيل الدخول أولاً"
        : "Please log in first"
      toast.error(message)
      setTimeout(() => {
        window.location.href = `/${locale}/sign-in`
      }, 1000)
      return
    }

    if (loading) return
    setLoading(true)
    const toastId = toast.loading(locale === "ar" ? "جاري..." : "Loading...")

    try {
      const result = await toggleFavorite(jobId, session.accessToken, locale)
      setIsFavorite(result.is_favourite)
      toast.dismiss(toastId)
      
      if (result.is_favourite) {
        toast.success(locale === "ar" ? "تمت الإضافة للمفضلة" : "Added to favorites")
      } else {
        toast.success(locale === "ar" ? "تمت الإزالة من المفضلة" : "Removed from favorites")
      }
    } catch (err: any) {
      setLoading(false)
      toast.dismiss(toastId)
      const errMsg = err?.message || (locale === "ar" ? "حدث خطأ" : "Error occurred")
      toast.error(errMsg)
      console.error("Toggle favorite error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className="rounded-full p-1 text-[#40A0CA] transition hover:bg-[#e8f2ff] disabled:opacity-60"
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      title={isFavorite ? (locale === "ar" ? "إزالة من المفضلة" : "Remove from favorites") : (locale === "ar" ? "إضافة للمفضلة" : "Add to favorites")}
    >
      <Bookmark 
        className={`size-8 transition ${
          isFavorite 
            ? "fill-[#40A0CA] stroke-[#40A0CA]" 
            : "fill-[#40A0CA]/25 stroke-[#40A0CA]"
        }`} 
      />
    </button>
  )
}
