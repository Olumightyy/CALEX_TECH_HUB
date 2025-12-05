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
import { Bell, LogOut, Settings, User, ExternalLink, Search } from "lucide-react"
import type { Profile } from "@/lib/types/database"
import { Input } from "@/components/ui/input"

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
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-3 backdrop-blur-lg sm:h-16 sm:px-4 md:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger className="h-9 w-9 sm:h-10 sm:w-10" />

        {/* Search - hidden on mobile, shown on md+ */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="h-9 w-48 rounded-full bg-muted/50 pl-9 text-sm lg:w-64" />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
        {/* View Site - hidden on mobile */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="hidden sm:flex h-8 text-xs sm:h-9 sm:text-sm bg-transparent"
        >
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">View Site</span>
          </a>
        </Button>

        {/* Search icon on mobile */}
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 md:hidden">
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive sm:right-1 sm:top-1 sm:h-2 sm:w-2" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 sm:h-9 sm:w-9">
              <div className="h-8 w-8 overflow-hidden rounded-full bg-muted sm:h-9 sm:w-9">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url || "/placeholder.svg"}
                    alt={profile.full_name || ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-medium text-primary-foreground sm:text-sm">
                    {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 sm:w-56">
            <div className="flex items-center gap-2 p-2">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium truncate">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={`/${profile.role}/settings`} className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/${profile.role}/settings`} className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </a>
            </DropdownMenuItem>
            {/* View site on mobile dropdown */}
            <DropdownMenuItem asChild className="sm:hidden">
              <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                View Site
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
