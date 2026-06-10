import { Loader2 } from "lucide-react"

export default function PlansLoading() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
        <p className="text-xl">Loading plans comparison...</p>
      </div>
    </div>
  )
}
