import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  // Create Supabase client
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
    },
  )

  // Get auth token from request cookies
  const authCookie = request.cookies
    .getAll()
    .find((cookie) => cookie.name.includes("auth-token") || cookie.name.includes("sb-"))

  if (!authCookie) {
    // No auth, proceed with checks
    const pathname = request.nextUrl.pathname
    const isProtectedRoute =
      pathname.startsWith("/student") || pathname.startsWith("/teacher") || pathname.startsWith("/admin")

    if (isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Set auth for this request
  const {
    data: { user },
  } = await supabase.auth.getUser(authCookie.value)

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
        if (profile.role === "teacher" && !profile.is_verified) {
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
