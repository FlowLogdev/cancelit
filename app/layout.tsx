import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { ResizeObserverFix } from "@/components/resizeobserver-fix"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "CancelIt — Find & Cancel Forgotten Subscriptions",
  description:
    "Connect your bank, discover every subscription draining your money, and cancel them in seconds. The average user saves $240/year with CancelIt.",
  keywords: "cancel subscriptions, find subscriptions, subscription tracker, stop recurring charges",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <ResizeObserverFix />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
