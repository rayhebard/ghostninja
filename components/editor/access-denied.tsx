import { Lock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AccessDenied() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4">
      <Lock className="h-8 w-8 text-copy-faint mb-4" />
      <h1 className="text-lg font-semibold text-copy-primary text-center">
        Access denied
      </h1>
      <p className="mt-2 text-sm text-copy-muted text-center max-w-sm">
        This project does not exist or you don&apos;t have permission to view it.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/editor">Back to projects</Link>
      </Button>
    </div>
  )
}
