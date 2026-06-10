import { Loader2 } from "lucide-react"

export default function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
        <p className="text-lg">Loading payment confirmation...</p>
      </div>
    </div>
  )
}
