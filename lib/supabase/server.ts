import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  // Get auth token from cookies
  const allCookies = cookieStore.getAll()
  const authToken = allCookies.find((cookie) => cookie.name.includes("auth-token"))?.value

  // Create client with auth context
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
      global: {
        headers: authToken
          ? {
              Authorization: `Bearer ${authToken}`,
            }
          : {},
      },
    },
  )

  return supabase
}
