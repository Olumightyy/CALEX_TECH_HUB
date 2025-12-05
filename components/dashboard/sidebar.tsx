"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Award,
  Bell,
  Settings,
  HelpCircle,
  Users,
  FileText,
  BarChart3,
  DollarSign,
  CheckSquare,
  PlusCircle,
  Layers,
  ShieldCheck,
  LogOut,
  Shield,
} from "lucide-react"
import type { Profile } from "@/lib/types/database"
import type { LucideIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface DashboardSidebarProps {
  profile: Profile
  role: "student" | "teacher" | "admin"
}

const studentNavItems: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/my-courses", label: "My Courses", icon: BookOpen },
  { href: "/student/certificates", label: "Certificates", icon: Award },
  { href: "/student/notifications", label: "Notifications", icon: Bell },
]

const teacherNavItems: NavItem[] = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/courses", label: "My Courses", icon: BookOpen },
  { href: "/teacher/courses/new", label: "Create Course", icon: PlusCircle },
  { href: "/teacher/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/teacher/announcements", label: "Announcements", icon: Bell },
]

const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", icon: Layers },
  { href: "/admin/teachers", label: "Teachers", icon: Users },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: DollarSign },
  { href: "/admin/reviews", label: "Reviews", icon: CheckSquare },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/logs", label: "Logs", icon: FileText },
]

export function DashboardSidebar({ profile, role }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = role === "admin" ? adminNavItems : role === "teacher" ? teacherNavItems : studentNavItems

  const homeLink = role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student"

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <SidebarUI className="border-r border-slate-800 bg-slate-950 text-slate-300">
      <SidebarHeader className="border-b border-slate-800 p-4">
        <Link href={homeLink} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white tracking-tight">CalexHub</span>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">{role} Portal</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`hover:bg-slate-800 hover:text-white transition-colors w-full ${isActive ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400' : ''}`}
                    >
                      <Link href={item.href}>
                        <item.icon className={`h-4 w-4 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/admin/verifications"} className="hover:bg-slate-800 hover:text-white">
                    <Link href="/admin/verifications">
                      <ShieldCheck className="h-4 w-4 text-slate-400" />
                      <span>Teacher Verification</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500">Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.includes("/settings")} className="hover:bg-slate-800 hover:text-white">
                  <Link href={`/${role}/settings`}>
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-slate-800 hover:text-white">
                  <Link href="/help">
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                    <span>Help Center</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} className="hover:bg-red-900/20 hover:text-red-400 text-slate-400">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-800 p-4 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-800 border border-slate-700">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url || "/placeholder.svg"}
                alt={profile.full_name || ""}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-800 text-sm font-medium text-amber-500">
                {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">{profile.full_name || "User"}</p>
            <p className="truncate text-xs text-slate-500">{profile.email}</p>
          </div>
        </div>
      </SidebarFooter>
    </SidebarUI>
  )
}
