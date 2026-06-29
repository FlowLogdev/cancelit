import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { headers } from "next/headers"
import type { Database } from "@/lib/database.types"
import { createClient as createCookieClient } from "./server"

export async function createClient() {
  const headerStore = await headers()
  const authorization = headerStore.get("authorization")

  if (!authorization) {
    return createCookieClient()
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Authorization: authorization,
        },
      },
    },
  )
}

