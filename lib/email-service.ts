import { createClient } from "./supabase/client"

export interface EmailResult {
  success: boolean
  message: string
  error?: string
  data?: any
  retryAfter?: number
}

export class EmailService {
  // Send password reset email
  static async sendPasswordReset(email: string): Promise<EmailResult> {
    try {
      console.log("🔄 Sending password reset email to:", email)
      const supabase = createClient()

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      console.log("📧 Password reset response:", { data, error })

      // Check if error exists and has any meaningful content
      if (error) {
        console.error("❌ Password reset error details:", {
          error,
          errorType: typeof error,
          errorKeys: Object.keys(error || {}),
          errorValues: Object.values(error || {}),
          errorString: String(error),
          errorJSON: JSON.stringify(error),
          hasMessage: !!error.message,
          hasStatus: !!error.status,
          isEmpty: Object.keys(error || {}).length === 0,
        })

        // Handle specific Supabase Auth errors
        if (error.code) {
          switch (error.code) {
            case "over_email_send_rate_limit":
              return {
                success: false,
                message: "Email rate limit exceeded. Please wait 60 seconds before requesting another password reset.",
                error: "Rate limit exceeded",
                retryAfter: 60,
              }

            case "email_not_confirmed":
              return {
                success: false,
                message: "Please confirm your email address first before resetting your password.",
                error: error.message || "Email not confirmed",
              }

            case "user_not_found":
              // For security, don't reveal if email exists
              return {
                success: true,
                message: "If an account with that email exists, you will receive a password reset link shortly.",
              }

            case "signup_disabled":
              return {
                success: false,
                message: "Account registration is currently disabled. Please contact support.",
                error: "Signup disabled",
              }

            default:
              return {
                success: false,
                message: `Email service error: ${error.message || error.code}`,
                error: error.message || error.code,
              }
          }
        }

        // Handle HTTP status codes
        if (error.status) {
          switch (error.status) {
            case 429:
              return {
                success: false,
                message: "Too many email requests. Please wait a few minutes before trying again.",
                error: "Rate limit exceeded",
                retryAfter: 300, // 5 minutes
              }

            case 400:
              return {
                success: false,
                message: "Invalid email address. Please check and try again.",
                error: "Invalid request",
              }

            case 422:
              return {
                success: false,
                message: "Email address format is invalid. Please enter a valid email.",
                error: "Invalid email format",
              }

            case 500:
              return {
                success: false,
                message: "Email service is temporarily unavailable. Please try again later.",
                error: "Server error",
              }

            default:
              return {
                success: false,
                message: `Email service error (${error.status}). Please try again later.`,
                error: `HTTP ${error.status}`,
              }
          }
        }

        // Handle traditional error messages
        if (error.message) {
          if (error.message.includes("rate limit") || error.message.includes("too many")) {
            return {
              success: false,
              message: "Too many reset attempts. Please wait 10-15 minutes before trying again.",
              error: error.message,
              retryAfter: 900, // 15 minutes
            }
          }

          if (error.message.includes("not found") || error.message.includes("user not found")) {
            // For security, don't reveal if email exists
            return {
              success: true,
              message: "If an account with that email exists, you will receive a password reset link shortly.",
            }
          }

          if (error.message.includes("SMTP") || error.message.includes("email")) {
            return {
              success: false,
              message: "Email service is temporarily unavailable. Please try again later or contact support.",
              error: error.message,
            }
          }

          return {
            success: false,
            message: error.message,
            error: error.message,
          }
        }

        // Handle empty error object (common Supabase issue)
        if (!error.message && Object.keys(error).length === 0) {
          console.log("⚠️ Empty error object detected - this might indicate SMTP is not configured")
          return {
            success: false,
            message: "Email service is not properly configured. Please contact support or try again later.",
            error: "SMTP configuration missing or invalid",
          }
        }

        // Fallback for any other error format
        return {
          success: false,
          message: "Failed to send reset email. Please check your email address and try again.",
          error: "Unknown error format",
        }
      }

      // Success case
      console.log("✅ Password reset email sent successfully")
      return {
        success: true,
        message: "Password reset link has been sent to your email address. Please check your inbox and spam folder.",
        data,
      }
    } catch (error) {
      console.error("💥 Unexpected password reset error:", error)

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          message: "Network error. Please check your internet connection and try again.",
          error: "Network error",
        }
      }

      return {
        success: false,
        message: "An unexpected error occurred. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Send email confirmation
  static async sendEmailConfirmation(email: string): Promise<EmailResult> {
    try {
      console.log("🔄 Sending confirmation email to:", email)
      const supabase = createClient()

      const { data, error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      console.log("📧 Confirmation email response:", { data, error })

      if (error) {
        // Handle rate limiting for confirmation emails too
        if (error.code === "over_email_send_rate_limit" || error.status === 429) {
          return {
            success: false,
            message: "Email rate limit exceeded. Please wait before requesting another confirmation email.",
            error: "Rate limit exceeded",
            retryAfter: 60,
          }
        }

        return {
          success: false,
          message: "Failed to send confirmation email. Please try again.",
          error: error.message,
        }
      }

      return {
        success: true,
        message: "Confirmation email has been sent. Please check your inbox.",
        data,
      }
    } catch (error) {
      return {
        success: false,
        message: "An unexpected error occurred. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Test SMTP connection
  static async testSMTPConnection(testEmail: string): Promise<EmailResult> {
    try {
      console.log("🧪 Testing SMTP connection with email:", testEmail)

      // Use a test email that we know won't exist to avoid sending actual emails
      const result = await this.sendPasswordReset(testEmail)

      return {
        success: true,
        message: `SMTP test completed. Check console for detailed logs.`,
        data: result,
      }
    } catch (error) {
      return {
        success: false,
        message: "SMTP test failed. Check your configuration.",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}
