import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing Supabase environment variables!")
    console.error("NEXT_PUBLIC_SUPABASE_URL exists:", !!supabaseUrl)
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!supabaseAnonKey)
    throw new Error("Missing Supabase environment variables. Check your .env.local file.")
  }

  // Log for debugging (only show prefixes for security)
  if (typeof window !== "undefined") {
    console.log("🔧 [SUPABASE-CLIENT] Initializing...")
    console.log("URL exists:", !!supabaseUrl)
    console.log("URL prefix:", supabaseUrl.substring(0, 30))
    console.log("Anon Key exists:", !!supabaseAnonKey)
    console.log("Anon Key prefix:", supabaseAnonKey.substring(0, 20))
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: "pkce",
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
    // Add timeout and retry configuration
    global: {
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          // Add a reasonable timeout (60 seconds)
          signal: AbortSignal.timeout(60000),
        })
      },
    },
  })
}

// For backward compatibility
export function createClientComponentClient() {
  return createClient()
}
