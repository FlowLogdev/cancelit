import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

import { ResizeObserverFix } from "@/components/resizeobserver-fix"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "CancelIt | Find and manage recurring charges",
  description:
    "Connect a bank account through Plaid, discover recurring payments, and manage subscriptions from a secure web dashboard.",
  keywords: "cancel subscriptions, find subscriptions, subscription tracker, stop recurring charges",
  openGraph: {
    title: "CancelIt",
    description: "Find and manage recurring charges before they renew.",
    type: "website",
    url: "https://cancelit.app",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} ${geistMono.variable} font-sans`}>
        <AuthProvider>
          <ResizeObserverFix />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
