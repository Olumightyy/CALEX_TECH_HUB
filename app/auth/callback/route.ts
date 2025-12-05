import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Get user profile to determine redirect
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

      let redirectPath = next
      if (profile?.role === "admin") {
        redirectPath = "/admin"
      } else if (profile?.role === "teacher") {
        redirectPath = "/teacher"
      } else {
        redirectPath = "/student"
      }

      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error?error=auth_callback_error`)
}
