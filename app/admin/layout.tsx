import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarProvider } from "@/components/ui/sidebar"

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: null },
  { href: "/admin/courses", label: "Courses", icon: null },
  { href: "/admin/teachers", label: "Teachers", icon: null },
  { href: "/admin/students", label: "Students", icon: null },
  { href: "/admin/revenue", label: "Revenue", icon: null },
  { href: "/admin/analytics", label: "Analytics", icon: null },
  { href: "/admin/logs", label: "Audit Logs", icon: null },
  { href: "/admin/settings", label: "Settings", icon: null },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/")
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar profile={profile} role="admin" />
        <div className="flex flex-1 flex-col">
          <DashboardHeader profile={profile} />
          <main className="flex-1 p-6 bg-muted/30">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
