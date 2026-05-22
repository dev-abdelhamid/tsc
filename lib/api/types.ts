// lib/api/types.ts

export interface ApiResponse<T> {
  data: T
  message?: string
  meta?: PaginationMeta
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface User {
  id: number
  name: string
  email: string
  phone: string
  avatar?: string
  role: "user" | "company" | "admin"
  email_verified_at?: string
  preferences?: UserPreferences
}

export interface UserPreferences {
  language: "ar" | "en" | "de"
  notifications: boolean
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: "Bearer"
  expires_in: number
}

export interface Job {
  id: number
  title: string
  description: string
  requirements: string
  salary_from: number
  salary_to: number
  location: string
  city: City
  country: Country
  category: Category
  company: CompanyProfile
  status: "pending" | "approved" | "rejected" | "stopped"
  created_at: string
  applications_count?: number
}

export interface JobApplication {
  id: number
  job: Job
  user: User
  status: "pending" | "accepted" | "rejected"
  applied_at: string
  cv_url?: string
}

export interface News {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  image?: string
  published_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  icon?: string
  jobs_count?: number
}

export interface Country {
  id: number
  name: string
  code: string
  flag?: string
}

export interface City {
  id: number
  name: string
  country: Country
}

export interface CompanyProfile {
  id: number
  name: string
  logo?: string
  description: string
  company_type: CompanyType
  country: Country
  city: City
  website?: string
}

export interface CompanyType {
  id: number
  name: string
}

export interface Ticket {
  id: number
  subject: string
  status: "open" | "closed" | "pending"
  created_at: string
  replies?: TicketReply[]
}

export interface TicketReply {
  id: number
  message: string
  user: User
  created_at: string
}

export interface Notification {
  id: number
  title: string
  body: string
  read_at?: string
  created_at: string
  data?: Record<string, unknown>
}

export interface HomeData {
  hero: {
    title: string
    description: string
    stats: { value: string; label: string }[]
  }
  categories: Category[]
  featured_jobs: Job[]
  testimonials: Testimonial[]
  news: News[]
}

export interface Testimonial {
  id: number
  name: string
  position: string
  avatar?: string
  content: string
  rating: number
}

export interface About {
  title: string
  description: string
  mission: string
  vision: string
  stats: { value: string; label: string }[]
  team?: TeamMember[]
}

export interface TeamMember {
  id: number
  name: string
  position: string
  avatar?: string
}
