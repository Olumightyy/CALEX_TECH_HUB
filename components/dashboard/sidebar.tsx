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
  PlusCircle,
  Layers,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from "lucide-react"
import type { Profile } from "@/lib/types/database"
import type { LucideIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

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
  { href: "/admin/revenue", label: "Revenue", icon: DollarSign },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/logs", label: "Audit Logs", icon: FileText },
]

export function DashboardSidebar({ profile, role }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = role === "admin" ? adminNavItems : role === "teacher" ? teacherNavItems : studentNavItems
  const homeLink = role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student"
  const roleLabel = role === "admin" ? "Administrator" : role === "teacher" ? "Instructor" : "Learner"
  const roleColor = role === "admin" ? "text-rose-600" : role === "teacher" ? "text-emerald-600" : "text-primary"
  const roleBg = role === "admin" ? "bg-rose-500/10" : role === "teacher" ? "bg-emerald-500/10" : "bg-primary/10"

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <SidebarProvider>
      <SidebarUI className="border-r border-border bg-card">
        {/* Header */}
        <SidebarHeader className="border-b border-border p-5">
          <Link href={homeLink} className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
              <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">EduPlatform</span>
              <span className={cn("text-[10px] font-medium uppercase tracking-wide", roleColor)}>
                {roleLabel} Portal
              </span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="scrollbar-thin p-3">
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Main Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href || (item.href !== homeLink && pathname.startsWith(item.href + "/"))
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <item.icon className={cn("h-5 w-5", isActive && "text-primary-foreground")} />
                          <span className="flex-1">{item.label}</span>
                          {isActive && <ChevronRight className="h-4 w-4" />}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Admin Extras */}
          {role === "admin" && (
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Administration
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/admin/verifications"}>
                      <Link
                        href="/admin/verifications"
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          pathname === "/admin/verifications"
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <ShieldCheck className="h-5 w-5" />
                        <span className="flex-1">Teacher Verification</span>
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-accent-foreground">
                          3
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Support */}
          <SidebarGroup className="mt-auto pt-4">
            <SidebarGroupLabel className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Support
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.includes("/settings")}>
                    <Link
                      href={`/${role}/settings`}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                        pathname.includes("/settings")
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      href="/help"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                    >
                      <HelpCircle className="h-5 w-5" />
                      <span>Help Center</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer - User Profile */}
        <SidebarFooter className="border-t border-border p-4">
          <Link
            href={`/${role}/settings`}
            className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
          >
            <div className="h-10 w-10 overflow-hidden rounded-full bg-muted ring-2 ring-border">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url || "/placeholder.svg"}
                  alt={profile.full_name || ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className={cn("flex h-full w-full items-center justify-center text-sm font-bold", roleBg, roleColor)}
                >
                  {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold text-foreground">{profile.full_name || "User"}</p>
              <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </SidebarFooter>
      </SidebarUI>
    </SidebarProvider>
  )
}
