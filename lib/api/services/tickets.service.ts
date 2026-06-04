// lib/api/services/tickets.service.ts
import { api } from "../client"
import type { ApiResponse, Ticket, PaginationMeta } from "../types"

export interface CreateTicketData {
  subject: string
  message: string
  priority?: "low" | "medium" | "high"
  receiver_id?: string
  file?: File | null
}

export async function createTicket(
  data: CreateTicketData,
  token: string,
  locale = "ar"
): Promise<Ticket> {
  const formData = new FormData()
  
  // Set default receiver_id if not present
  const payload = {
    receiver_id: "1",
    priority: "medium",
    ...data
  }

  Object.entries(payload).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value)
    } else if (value !== null && value !== undefined) {
      formData.append(key, String(value))
    }
  })

  const response = await api.post<ApiResponse<Ticket>>(
    "/tickets",
    formData,
    { token, locale }
  )
  return response.data
}

export async function getTickets(
  token: string,
  page = 1,
  locale = "ar"
): Promise<{ data: Ticket[]; meta: PaginationMeta }> {
  const response = await api.get<ApiResponse<Ticket[]>>(
    `/tickets?page=${page}`,
    { token, locale }
  )
  return { data: response.data, meta: response.meta! }
}

export async function getTicket(
  id: number,
  token: string,
  locale = "ar"
): Promise<Ticket> {
  const response = await api.get<ApiResponse<Ticket>>(
    `/tickets/${id}`,
    { token, locale }
  )
  return response.data
}

export async function replyToTicket(
  ticketId: number,
  message: string,
  token: string,
  locale = "ar"
): Promise<Ticket> {
  const formData = new FormData()
  formData.append("message", message)

  const response = await api.post<ApiResponse<Ticket>>(
    `/tickets/${ticketId}/reply`,
    formData,
    { token, locale }
  )
  return response.data
}
