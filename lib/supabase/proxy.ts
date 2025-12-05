import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes by role
  const pathname = request.nextUrl.pathname

  // Check if accessing any protected route without auth
  const isProtectedRoute =
    pathname.startsWith("/student") || pathname.startsWith("/teacher") || pathname.startsWith("/admin")

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // If user is logged in, check role-based access
  if (user && isProtectedRoute) {
    const { data: profile } = await supabase.from("profiles").select("role, is_verified").eq("id", user.id).single()

    if (profile) {
      // Check student routes
      if (pathname.startsWith("/student") && profile.role !== "student" && profile.role !== "admin") {
        const url = request.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
      }

      // Check teacher routes - must be verified
      if (pathname.startsWith("/teacher")) {
        if (profile.role !== "teacher" && profile.role !== "admin") {
          const url = request.nextUrl.clone()
          url.pathname = "/"
          return NextResponse.redirect(url)
        }
        if (profile.role === "teacher" && !profile.is_verified && pathname !== "/teacher/verification-pending") {
          const url = request.nextUrl.clone()
          url.pathname = "/teacher/verification-pending"
          return NextResponse.redirect(url)
        }
      }

      // Check admin routes
      if (pathname.startsWith("/admin") && profile.role !== "admin") {
        const url = request.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
