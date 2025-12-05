import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  // Get all cookies to find the Supabase session
  const allCookies = cookieStore.getAll()

  // Find the access token from Supabase auth cookies
  // Supabase stores tokens in cookies like: sb-{project-ref}-auth-token
  const authTokenCookie = allCookies.find(
    (cookie) =>
      cookie.name.includes("sb-") && cookie.name.includes("-auth-token") && !cookie.name.includes("-code-verifier"),
  )

  // Create Supabase client
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  )

  // If we have an auth token, set it in the client
  if (authTokenCookie?.value) {
    // Parse the token value (it might be JSON stringified)
    try {
      const tokenData = JSON.parse(authTokenCookie.value)
      if (tokenData.access_token) {
        // Set the session manually
        await supabase.auth.setSession({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || "",
        })
      }
    } catch {
      // If not JSON, try using the value directly as a token
      await supabase.auth.setSession({
        access_token: authTokenCookie.value,
        refresh_token: "",
      })
    }
  }

  return supabase
}
