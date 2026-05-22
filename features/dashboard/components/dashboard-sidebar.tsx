"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  UserPen, 
  Briefcase, 
  Heart, 
  Ticket, 
  LogOut,
  Users,
  Building2,
  FileText,
  Settings,
  BriefcaseBusiness
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarItemProps {
  icon: React.ElementType
  label: string
  href: string
  active?: boolean
  badge?: number
}

function SidebarItem({ icon: Icon, label, href, active, badge }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
        active 
          ? "bg-gradient-to-r from-[#006EA8]/10 to-[#005685]/10 text-[#006EA8] font-semibold shadow-sm" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#006EA8] to-[#005685] rounded-r-full" />
      )}
      
      <div className={cn(
        "transition-colors",
        active ? "text-[#40A0CA]" : "text-gray-400 group-hover:text-gray-900"
      )}>
        <Icon size={20} />
      </div>
      
      <span className="flex-1">{label}</span>
      
      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
          {badge}
        </span>
      )}
    </Link>
  )
}



interface DashboardSidebarProps {
  locale: string
  userRole: "user" | "company" | "admin"
}

export function DashboardSidebar({ locale, userRole }: DashboardSidebarProps) {
  const pathname = usePathname()
  
  const getMenuItems = () => {
    const isRTL = locale === "ar"
    
    switch (userRole) {
      case "user":
        return [
          {
            icon: LayoutDashboard,
            label: isRTL ? "لوحة التحكم" : "Dashboard",
            href: `/${locale}/dashboard/user`,
          },
          {
            icon: UserPen,
            label: isRTL ? "تحديث الملف الشخصي" : "Update Profile",
            href: `/${locale}/dashboard/user/profile`,
          },
          {
            icon: Briefcase,
            label: isRTL ? "الوظائف المفضلة" : "Favourite Jobs",
            href: `/${locale}/dashboard/user/favourites`,
            badge: 3,
          },
          {
            icon: FileText,
            label: isRTL ? "طلبات الوظائف" : "Job Applications",
            href: `/${locale}/dashboard/user/applications`,
          },
          {
            icon: Ticket,
            label: isRTL ? "التذاكر" : "Tickets",
            href: `/${locale}/dashboard/user/tickets`,
            badge: 2,
          },
        ]
      
      case "company":
        return [
          {
            icon: LayoutDashboard,
            label: isRTL ? "لوحة التحكم" : "Dashboard",
            href: `/${locale}/dashboard/company`,
          },
          {
            icon: UserPen,
            label: isRTL ? "تحديث الملف الشخصي" : "Update Profile",
            href: `/${locale}/dashboard/company/profile`,
          },
          {
            icon: BriefcaseBusiness,
            label: isRTL ? "كل الوظائف" : "All Jobs",
            href: `/${locale}/dashboard/company/jobs`,
          },
          {
            icon: Users,
            label: isRTL ? "المتقدمين" : "Applicants",
            href: `/${locale}/dashboard/company/applicants`,
          },
          {
            icon: Ticket,
            label: isRTL ? "التذاكر" : "Tickets",
            href: `/${locale}/dashboard/company/tickets`,
          },
        ]
      
      case "admin":
        return [
          {
            icon: LayoutDashboard,
            label: isRTL ? "لوحة التحكم" : "Dashboard",
            href: `/${locale}/dashboard/admin`,
          },
          {
            icon: Users,
            label: isRTL ? "المستخدمين" : "Users",
            href: `/${locale}/dashboard/admin/users`,
          },
          {
            icon: Building2,
            label: isRTL ? "الشركات" : "Companies",
            href: `/${locale}/dashboard/admin/companies`,
          },
          {
            icon: Briefcase,
            label: isRTL ? "الوظائف" : "Jobs",
            href: `/${locale}/dashboard/admin/jobs`,
          },
          {
            icon: Settings,
            label: isRTL ? "الإعدادات" : "Settings",
            href: `/${locale}/dashboard/admin/settings`,
          },
        ]
      
      default:
        return []
    }
  }

  const menuItems = getMenuItems()
  const isRTL = locale === "ar"

  return (
    <div className={cn(
      "w-[310px] bg-gradient-to-b from-[#006EA8]/5 to-[#005685]/5 rounded-[8px] p-4 flex flex-col h-fit sticky top-8 border border-gray-100",
      isRTL && "rtl"
    )}>
      <nav className="flex flex-col gap-2 flex-grow">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={pathname === item.href}
            badge={item.badge}
          />
        ))}
      </nav>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <Link
          href={`/${locale}/logout`}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <LogOut size={20} className="text-gray-400 group-hover:text-red-600" />
          <span>{isRTL ? "تسجيل الخروج" : "Logout"}</span>
        </Link>
      </div>
    </div>
  )
}