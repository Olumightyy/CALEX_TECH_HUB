"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import {
  GraduationCap,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  BookOpen,
  ChevronDown,
  Award,
  Search,
  Bell,
} from "lucide-react"
import type { Profile } from "@/lib/types/database"
import { cn } from "@/lib/utils"

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    async function getUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single()
        setUser(profile)
      }
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null)
      } else if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        setUser(profile)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const getDashboardLink = () => {
    if (!user) return "/auth/login"
    switch (user.role) {
      case "admin":
        return "/admin"
      case "teacher":
        return "/teacher"
      default:
        return "/student"
    }
  }

  const navLinks = [
    { href: "/courses", label: "Courses" },
    { href: "/become-teacher", label: "Teach" },
    { href: "/about", label: "About" },
  ]

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-border/50 bg-background/95 backdrop-blur-lg shadow-sm" : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary transition-transform group-hover:scale-105">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-foreground">EduPlatform</span>
              <span className="hidden text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:block">
                Learn Without Limits
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                  pathname === link.href
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                Categories
                <ChevronDown className="h-4 w-4 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 p-2">
                <DropdownMenuItem asChild className="rounded-md">
                  <Link href="/courses?category=web-development" className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <span>Web Development</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-md">
                  <Link href="/courses?category=data-science" className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                      <BookOpen className="h-4 w-4 text-green-600" />
                    </div>
                    <span>Data Science</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-md">
                  <Link href="/courses?category=mobile-development" className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                    </div>
                    <span>Mobile Development</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-md">
                  <Link href="/courses?category=design" className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10">
                      <BookOpen className="h-4 w-4 text-pink-600" />
                    </div>
                    <span>Design</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-md">
                  <Link href="/courses" className="font-medium text-primary">
                    View All Categories
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Section */}
          <div className="hidden items-center gap-3 lg:flex">
            {/* Search Button */}
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
              <Search className="h-5 w-5" />
            </Button>

            {loading ? (
              <div className="h-10 w-28 animate-pulse rounded-full bg-muted" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full text-muted-foreground hover:text-foreground"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 rounded-full pl-1.5 pr-3 hover:bg-muted/50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url || "/placeholder.svg"}
                            alt={user.full_name || ""}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-primary-foreground">
                            {user.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2">
                    <div className="mb-2 rounded-lg bg-muted/50 p-3">
                      <p className="font-semibold text-foreground">{user.full_name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {user.role}
                      </div>
                    </div>
                    <DropdownMenuItem asChild className="rounded-md">
                      <Link href={getDashboardLink()} className="flex items-center gap-3">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "student" && (
                      <DropdownMenuItem asChild className="rounded-md">
                        <Link href="/student/my-courses" className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4" />
                          My Courses
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="rounded-md">
                      <Link href={`/${user.role}/certificates`} className="flex items-center gap-3">
                        <Award className="h-4 w-4" />
                        Certificates
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center gap-3 rounded-md text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" className="rounded-full px-5 font-medium">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-full bg-primary px-5 font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40"
                >
                  <Link href="/auth/sign-up">Get Started Free</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="inline-flex items-center justify-center rounded-xl p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="border-t border-border py-4 lg:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary/5 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-2 border-t border-border" />

              {user ? (
                <>
                  <div className="mb-2 rounded-lg bg-muted/50 px-4 py-3">
                    <p className="font-medium text-foreground">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Link
                    href={getDashboardLink()}
                    className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsOpen(false)
                    }}
                    className="rounded-lg px-4 py-3 text-left text-sm font-medium text-destructive hover:bg-destructive/5"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Button asChild variant="outline" className="w-full justify-center rounded-xl bg-transparent">
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-center rounded-xl">
                    <Link href="/auth/sign-up" onClick={() => setIsOpen(false)}>
                      Get Started Free
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
