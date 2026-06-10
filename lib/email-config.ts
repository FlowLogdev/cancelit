// Email configuration for Supabase Auth
export const emailConfig = {
  // Custom email templates can be configured in Supabase Dashboard
  // under Authentication > Email Templates

  // Password Reset Email Template Variables:
  // {{ .SiteURL }} - Your site URL
  // {{ .Token }} - Reset token
  // {{ .TokenHash }} - Token hash
  // {{ .RedirectTo }} - Redirect URL after reset

  passwordReset: {
    subject: "Reset Your CancelIt Password",
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
  },

  // Email Confirmation Template Variables:
  emailConfirmation: {
    subject: "Confirm Your CancelIt Account",
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
  },
}

// Helper function to send password reset email
export const sendPasswordResetEmail = async (email: string) => {
  const { createClient } = await import("./supabase/client")
  const supabase = createClient()

  console.log("Sending password reset email to:", email)
  console.log("Redirect URL:", emailConfig.passwordReset.redirectTo)

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: emailConfig.passwordReset.redirectTo,
  })

  console.log("Password reset response:", { data, error })

  return { data, error }
}

// Helper function to resend confirmation email
export const resendConfirmationEmail = async (email: string) => {
  const { createClient } = await import("./supabase/client")
  const supabase = createClient()

  console.log("Resending confirmation email to:", email)

  const { data, error } = await supabase.auth.resend({
    type: "signup",
    email: email,
    options: {
      emailRedirectTo: emailConfig.emailConfirmation.redirectTo,
    },
  })

  console.log("Confirmation email response:", { data, error })

  return { data, error }
}
