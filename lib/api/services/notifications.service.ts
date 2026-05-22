// lib/api/services/notifications.service.ts
import { api } from "../client"
import type { ApiResponse, Notification, PaginationMeta } from "../types"

export async function getNotifications(
  token: string,
  page = 1,
  locale = "ar"
): Promise<{ data: Notification[]; meta: PaginationMeta }> {
  const response = await api.get<ApiResponse<Notification[]>>(
    `/notifications?page=${page}`,
    { token, locale }
  )
  return { data: response.data, meta: response.meta! }
}

export async function markAsRead(
  notificationId: number,
  token: string,
  locale = "ar"
): Promise<Notification> {
  const response = await api.post<ApiResponse<Notification>>(
    `/notifications/${notificationId}/read`,
    {},
    { token, locale }
  )
  return response.data
}

export async function markAllAsRead(
  token: string,
  locale = "ar"
): Promise<void> {
  await api.post("/notifications/read-all", {}, { token, locale })
}

export async function deleteNotification(
  notificationId: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.delete(`/notifications/${notificationId}`, { token, locale })
}

export async function getUnreadCount(
  token: string,
  locale = "ar"
): Promise<{ unread_count: number }> {
  const response = await api.get<ApiResponse<{ unread_count: number }>>(
    "/notifications/unread-count",
    { token, locale }
  )
  return response.data
}
