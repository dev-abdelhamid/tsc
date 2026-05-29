// lib/auth-utils.ts
// Helper functions للمصادقة والتحقق من الصلاحيات

import { SessionData } from "./session"

/**
 * التحقق من أن المستخدم له دور معين
 */
export function hasRole(user: SessionData["user"] | undefined, role: "user" | "company" | "admin"): boolean {
  if (!user) return false
  if (user.role === "admin") return true // Admin له صلاحية كل شيء
  return user.role === role
}

/**
 * التحقق من أن المستخدم مسؤول
 */
export function isAdmin(user: SessionData["user"] | undefined): boolean {
  return user?.role === "admin"
}

/**
 * التحقق من أن المستخدم شركة
 */
export function isCompany(user: SessionData["user"] | undefined): boolean {
  return user?.role === "company"
}

/**
 * التحقق من أن المستخدم عادي
 */
export function isRegularUser(user: SessionData["user"] | undefined): boolean {
  return user?.role === "user"
}

/**
 * الحصول على عنوان لوحة المراقبة حسب الدور
 */
export function getDashboardPath(role: "user" | "company" | "admin"): string {
  const baseRole = role === "admin" ? "admin" : role === "company" ? "company" : "user"
  return `/dashboard/${baseRole}`
}

/**
 * التحقق من أن المستخدم موثق
 */
export function isAuthenticated(session: SessionData | null | undefined): boolean {
  return session?.isLoggedIn === true && session?.user !== undefined
}

/**
 * الحصول على معلومات المستخدم الآمنة
 */
export function getSafeUserInfo(user: SessionData["user"] | undefined) {
  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  }
}

/**
 * الحصول على رسالة ترحيب حسب الدور
 */
export function getWelcomeMessage(role: "user" | "company" | "admin"): string {
  const messages: Record<typeof role, string> = {
    user: "مرحباً بك في منصة الباحثين عن عمل",
    company: "مرحباً بك في منصة الشركات",
    admin: "مرحباً بك في لوحة الإدارة",
  }
  return messages[role]
}

/**
 * التحقق من أن التوكن لم ينتهِ
 */
export function isTokenExpired(expiresIn: number, timestamp: number): boolean {
  const expirationTime = timestamp + expiresIn * 1000 // تحويل للميلي ثانية
  return Date.now() > expirationTime
}

/**
 * الحصول على وقت انتهاء الجلسة بصيغة قابلة للقراءة
 */
export function getSessionExpiryTime(expiresIn: number): Date {
  return new Date(Date.now() + expiresIn * 1000)
}

/**
 * التحقق من صلاحية الوصول لمسار معين
 */
export function canAccessPath(
  userRole: "user" | "company" | "admin" | null | undefined,
  requiredRoles: ("user" | "company" | "admin")[]
): boolean {
  if (!userRole) return false

  // Admin له صلاحية الوصول لكل شيء
  if (userRole === "admin") return true

  return requiredRoles.includes(userRole)
}

/**
 * الحصول على الصلاحيات (permissions) حسب الدور
 */
export function getRolePermissions(role: "user" | "company" | "admin"): Record<string, boolean> {
  const basePermissions = {
    viewProfile: true,
    editProfile: true,
    viewNotifications: true,
  }

  const rolePermissions: Record<string, Record<string, boolean>> = {
    user: {
      ...basePermissions,
      viewJobs: true,
      applyJobs: true,
      viewApplications: true,
      manageFavorites: true,
    },
    company: {
      ...basePermissions,
      postJobs: true,
      viewApplications: true,
      manageJobs: true,
      viewAnalytics: true,
    },
    admin: {
      ...basePermissions,
      manageUsers: true,
      manageCompanies: true,
      manageJobs: true,
      viewAllApplications: true,
      manageContent: true,
      viewAnalytics: true,
      manageSiteSetting: true,
    },
  }

  return rolePermissions[role] || basePermissions
}
