interface ResetAttempt {
  email: string
  timestamp: Date
  attempts: number
}

class PasswordResetLimiter {
  private attempts: Map<string, ResetAttempt> = new Map()
  private readonly SUPABASE_RATE_LIMIT = 10 * 60 * 1000 // 10 minutes
  private readonly MAX_ATTEMPTS_PER_HOUR = 3

  canAttemptReset(email: string): { allowed: boolean; waitTime?: number; reason?: string } {
    const normalizedEmail = email.toLowerCase().trim()
    const attempt = this.attempts.get(normalizedEmail)
    const now = new Date()

    if (!attempt) {
      return { allowed: true }
    }

    const timeSinceLastAttempt = now.getTime() - attempt.timestamp.getTime()

    // Check if still within Supabase rate limit window
    if (timeSinceLastAttempt < this.SUPABASE_RATE_LIMIT) {
      const waitTime = Math.ceil((this.SUPABASE_RATE_LIMIT - timeSinceLastAttempt) / 1000 / 60)
      return {
        allowed: false,
        waitTime,
        reason: "rate_limit",
      }
    }

    // Check hourly limit
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    if (attempt.timestamp > oneHourAgo && attempt.attempts >= this.MAX_ATTEMPTS_PER_HOUR) {
      const waitTime = Math.ceil((attempt.timestamp.getTime() + 60 * 60 * 1000 - now.getTime()) / 1000 / 60)
      return {
        allowed: false,
        waitTime,
        reason: "hourly_limit",
      }
    }

    return { allowed: true }
  }

  recordAttempt(email: string): void {
    const normalizedEmail = email.toLowerCase().trim()
    const now = new Date()
    const existing = this.attempts.get(normalizedEmail)

    if (existing) {
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const attempts = existing.timestamp > oneHourAgo ? existing.attempts + 1 : 1

      this.attempts.set(normalizedEmail, {
        email: normalizedEmail,
        timestamp: now,
        attempts,
      })
    } else {
      this.attempts.set(normalizedEmail, {
        email: normalizedEmail,
        timestamp: now,
        attempts: 1,
      })
    }
  }

  getRemainingWaitTime(email: string): number {
    const normalizedEmail = email.toLowerCase().trim()
    const attempt = this.attempts.get(normalizedEmail)

    if (!attempt) return 0

    const now = new Date()
    const timeSinceLastAttempt = now.getTime() - attempt.timestamp.getTime()

    if (timeSinceLastAttempt < this.SUPABASE_RATE_LIMIT) {
      return Math.ceil((this.SUPABASE_RATE_LIMIT - timeSinceLastAttempt) / 1000 / 60)
    }

    return 0
  }

  clearAttempts(email: string): void {
    const normalizedEmail = email.toLowerCase().trim()
    this.attempts.delete(normalizedEmail)
  }

  // Clean up old attempts
  cleanup(): void {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    for (const [email, attempt] of this.attempts.entries()) {
      if (attempt.timestamp < oneHourAgo) {
        this.attempts.delete(email)
      }
    }
  }
}

export const passwordResetLimiter = new PasswordResetLimiter()

// Clean up old attempts every 30 minutes
if (typeof window !== "undefined") {
  setInterval(
    () => {
      passwordResetLimiter.cleanup()
    },
    30 * 60 * 1000,
  )
}
