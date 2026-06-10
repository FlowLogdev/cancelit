import DebugAuth from "@/components/auth/debug-auth"

export default function DebugPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Tools</h1>
      <div className="grid gap-8">
        <DebugAuth />
      </div>
    </div>
  )
}
