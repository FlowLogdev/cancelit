import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.SUPER_ADMIN_EMAIL || "support@flowlog.dev"
const password = process.env.SUPER_ADMIN_PASSWORD

if (!supabaseUrl || !serviceRoleKey || !password) {
  console.error(
    [
      "Missing required environment variables.",
      "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPER_ADMIN_PASSWORD.",
    ].join("\n"),
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function findUserByEmail(targetEmail) {
  let page = 1
  const perPage = 100

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })

    if (error) {
      throw error
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === targetEmail.toLowerCase())
    if (user) return user
    if (data.users.length < perPage) return null

    page += 1
  }
}

async function main() {
  const existingUser = await findUserByEmail(email)

  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      app_metadata: {
        ...(existingUser.app_metadata || {}),
        role: "super_admin",
        permissions: ["admin:all"],
      },
      user_metadata: {
        ...(existingUser.user_metadata || {}),
        full_name: "CancelIt Super Admin",
      },
    })

    if (error) throw error
    console.log(`Updated super admin ${data.user.email} (${data.user.id})`)
    return
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: {
      role: "super_admin",
      permissions: ["admin:all"],
    },
    user_metadata: {
      full_name: "CancelIt Super Admin",
    },
  })

  if (error) throw error
  console.log(`Created super admin ${data.user.email} (${data.user.id})`)
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
