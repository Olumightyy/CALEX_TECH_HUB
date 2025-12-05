import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  // Get auth token from cookies
  const allCookies = cookieStore.getAll()

  // Find the access token cookie (matches sb-*-auth-token or sb-*-auth-token-code-verifier pattern)
  const authCookie = allCookies.find(
    (cookie) =>
      cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token") && !cookie.name.includes("-code-verifier"),
  )

  console.log(
    "[v0] Server Client - Found cookies:",
    allCookies.map((c) => c.name),
  )
  console.log("[v0] Server Client - Auth cookie:", authCookie?.name)

  // Create client with auth context
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: authCookie?.value
          ? {
              Authorization: `Bearer ${authCookie.value}`,
            }
          : {},
      },
    },
  )

  return supabase
}
