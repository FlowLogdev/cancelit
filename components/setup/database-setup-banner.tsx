"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, ExternalLink } from "lucide-react"

export function DatabaseSetupBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <strong className="text-orange-800">Database Setup Required</strong>
          <p className="text-orange-700 mt-1">
            The database tables haven't been created yet. Please run the setup script in your Supabase dashboard to get
            started.
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Open Supabase
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
            className="text-orange-700 hover:bg-orange-100"
          >
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
