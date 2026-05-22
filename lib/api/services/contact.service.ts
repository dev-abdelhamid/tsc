// lib/api/services/contact.service.ts
import { api } from "../client"
import type { ApiResponse } from "../types"

export interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export async function sendContact(
  data: ContactFormData,
  locale = "ar"
): Promise<{ message: string }> {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })

  const response = await api.post<ApiResponse<{ message: string }>>(
    "/public/contact",
    formData,
    { locale }
  )
  return response.data
}
