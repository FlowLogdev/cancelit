import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

/**
 * Validate env vars in every runtime (browser + server).
 * If they’re missing we log a clear message and skip initialising the client
 * to avoid the “Failed to construct 'URL'” error.
 */
if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error("❌ Supabase env vars missing: please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

/**
 * Only create the client when the env vars are present.
 * Export `null` otherwise so callers can handle the absence gracefully.
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Extra server-side logging & connection test
if (typeof window === "undefined" && supabase) {
  // eslint-disable-next-line no-console
  console.log("✅ Supabase client initialised on the server")

  supabase.auth
    .getSession()
    .then(({ data, error }) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.error("❌ Supabase connection test failed:", error)
      } else {
        // eslint-disable-next-line no-console
        console.log("🔄 Auth session", data.session ? `for user ${data.session.user.id}` : "none")
      }
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("💥 Supabase test error:", err)
    })
}
