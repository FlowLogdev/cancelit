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
  metadataBase: new URL("https://cancelit.app"),
  title: {
    default: "CancelIt | Find and manage recurring charges",
    template: "%s | CancelIt",
  },
  description:
    "Connect a bank account through Plaid, discover recurring payments, and manage subscriptions from a secure web dashboard.",
  keywords: "cancel subscriptions, find subscriptions, subscription tracker, stop recurring charges",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "CancelIt",
    description: "Find and manage recurring charges before they renew.",
    type: "website",
    url: "https://cancelit.app",
    siteName: "CancelIt",
    images: [
      {
        url: "/brand/cancelit-logo.jpg",
        width: 1254,
        height: 1254,
        alt: "CancelIt App logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CancelIt",
    description: "Find and manage recurring charges before they renew.",
    images: ["/brand/cancelit-logo.jpg"],
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
