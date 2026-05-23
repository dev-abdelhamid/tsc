// lib/api/client.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.talentseeker.com/api/v1"

export class ApiError extends Error {
  public status: number
  public errors?: Record<string, string[]>
  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
  }
}

type FetchOptions = RequestInit & { locale?: string; token?: string }

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { locale, token, ...fetchOptions } = options

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": locale || "ar",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  // For FormData do not set Content-Type (browser/node fetch will set it)
  if (!(fetchOptions.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  const cacheOption = (fetchOptions as unknown as { cache?: RequestCache }).cache ?? "no-store"
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    cache: cacheOption,
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = errorData.message || `Request failed with status ${res.status}`
    const errors = errorData.errors as Record<string, string[]> | undefined
    throw new ApiError(res.status, message, errors)
  }

  // Some endpoints return an empty body
  const text = await res.text()
  if (!text) return (null as unknown) as T
  try {
    return JSON.parse(text) as T
  } catch (err) {
    console.warn("Failed to parse JSON response, returning raw text", err)
    return (text as unknown) as T
  }
}

export const api = {
  get: <T>(endpoint: string, opts?: { locale?: string; token?: string; cache?: RequestCache }) =>
    fetchApi<T>(endpoint, { method: "GET", ...opts }),

  post: <T>(endpoint: string, body?: FormData | Record<string, unknown>, opts?: { locale?: string; token?: string }) =>
    fetchApi<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      ...opts,
    }),

  put: <T>(endpoint: string, body: Record<string, unknown>, opts?: { locale?: string; token?: string }) =>
    fetchApi<T>(endpoint, { method: "PUT", body: JSON.stringify(body), ...opts }),

  patch: <T>(endpoint: string, body?: Record<string, unknown>, opts?: { locale?: string; token?: string }) =>
    fetchApi<T>(endpoint, { method: "PATCH", body: body ? JSON.stringify(body) : undefined, ...opts }),

  delete: <T>(endpoint: string, opts?: { locale?: string; token?: string }) =>
    fetchApi<T>(endpoint, { method: "DELETE", ...opts }),
}
