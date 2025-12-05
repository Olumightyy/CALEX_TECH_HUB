"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"
import { Bell, LogOut, Settings, User, ExternalLink } from "lucide-react"
import type { Profile } from "@/lib/types/database"

interface DashboardHeaderProps {
  profile: Profile
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-slate-600 hover:text-amber-600 hover:bg-amber-50" />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild className="hidden sm:flex border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Site
          </a>
        </Button>

        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-amber-600 hover:bg-amber-50">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-amber-200 transition-all">
              <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url || "/placeholder.svg"}
                    alt={profile.full_name || ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-900 text-sm font-medium text-amber-500">
                    {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 p-2">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100 border border-slate-200 shrink-0">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name || ""} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-900 text-sm font-bold text-amber-500">
                      {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                    </div>
                  )}
              </div>
              <div className="flex flex-col space-y-0.5 overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate">{profile.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{profile.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="focus:bg-amber-50 focus:text-amber-700 cursor-pointer">
              <a href={`/${profile.role}/profile`} className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-amber-50 focus:text-amber-700 cursor-pointer">
              <a href={`/${profile.role}/settings`} className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
