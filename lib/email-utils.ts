import { createClient } from "./supabase/client"

export interface EmailResult {
  success: boolean
  message: string
  error?: string
}

export const sendPasswordResetEmail = async (email: string): Promise<EmailResult> => {
  try {
    console.log("Attempting to send password reset email to:", email)
    const supabase = createClient()

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    console.log("Supabase response:", { data, error })

    if (error) {
      console.error("Password reset email error:", error)

      // Handle specific error cases
      if (error.message?.includes("rate limit") || error.message?.includes("too many")) {
        return {
          success: false,
          message: "Too many reset attempts. Please wait a few minutes before trying again.",
          error: error.message,
        }
      }

      if (error.message?.includes("not found") || error.message?.includes("user not found")) {
        // For security, don't reveal if email exists or not
        return {
          success: true,
          message: "If an account with that email exists, you will receive a password reset link shortly.",
        }
      }

      if (error.message?.includes("email not confirmed")) {
        return {
          success: false,
          message: "Please confirm your email address first before resetting your password.",
          error: error.message,
        }
      }

      return {
        success: false,
        message: error.message || "Failed to send reset email. Please try again.",
        error: error.message,
      }
    }

    return {
      success: true,
      message: "Password reset link has been sent to your email address. Please check your inbox and spam folder.",
    }
  } catch (error) {
    console.error("Unexpected error sending reset email:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export const sendEmailConfirmation = async (email: string): Promise<EmailResult> => {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      return {
        success: false,
        message: "Failed to send confirmation email. Please try again.",
        error: error.message,
      }
    }

    return {
      success: true,
      message: "Confirmation email has been sent. Please check your inbox.",
    }
  } catch (error) {
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
