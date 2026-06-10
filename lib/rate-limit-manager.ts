interface RateLimitInfo {
  email: string
  limitedUntil: Date
  attempts: number
}

class RateLimitManager {
  private limits: Map<string, RateLimitInfo> = new Map()
  private readonly RATE_LIMIT_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
  private readonly MAX_ATTEMPTS = 3

  isRateLimited(email: string): boolean {
    const limit = this.limits.get(email)
    if (!limit) return false

    if (new Date() > limit.limitedUntil) {
      this.limits.delete(email)
      return false
    }

    return true
  }

  getRemainingTime(email: string): number {
    const limit = this.limits.get(email)
    if (!limit) return 0

    const remaining = limit.limitedUntil.getTime() - new Date().getTime()
    return Math.max(0, Math.ceil(remaining / 1000 / 60)) // Return minutes
  }

  addAttempt(email: string): void {
    const existing = this.limits.get(email)
    const now = new Date()

    if (existing && now < existing.limitedUntil) {
      // Still rate limited, extend the time
      existing.attempts += 1
      existing.limitedUntil = new Date(now.getTime() + this.RATE_LIMIT_DURATION)
    } else {
      // New rate limit
      this.limits.set(email, {
        email,
        limitedUntil: new Date(now.getTime() + this.RATE_LIMIT_DURATION),
        attempts: 1,
      })
    }
  }

  clearLimit(email: string): void {
    this.limits.delete(email)
  }

  // Clean up expired limits periodically
  cleanup(): void {
    const now = new Date()
    for (const [email, limit] of this.limits.entries()) {
      if (now > limit.limitedUntil) {
        this.limits.delete(email)
      }
    }
  }
}

export const rateLimitManager = new RateLimitManager()

// Clean up expired limits every 10 minutes
if (typeof window !== "undefined") {
  setInterval(
    () => {
      rateLimitManager.cleanup()
    },
    10 * 60 * 1000,
  )
}
