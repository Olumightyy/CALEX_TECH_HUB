import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarProvider } from "@/components/ui/sidebar"

export default async function StudentLayout({
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

  if (!profile || (profile.role !== "student" && profile.role !== "admin")) {
    redirect("/")
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <DashboardSidebar profile={profile} role="student" />
        <div className="flex flex-1 flex-col">
          <DashboardHeader profile={profile} />
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
