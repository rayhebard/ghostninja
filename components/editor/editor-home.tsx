"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjectDialogContext } from "@/hooks/use-project-dialog"

export function EditorHome() {
  const { openCreate } = useProjectDialogContext()

  return (
    <div className="h-full flex flex-col items-center justify-center px-4">
      <h1 className="text-lg font-semibold text-copy-primary text-center">
        Create a project or open an existing one
      </h1>
      <p className="mt-2 text-sm text-copy-muted text-center max-w-sm">
        Start a new architecture workspace, or choose a project from the sidebar.
      </p>
      <Button className="mt-6 gap-2" onClick={openCreate}>
        <Plus className="h-4 w-4" />
        New Project
      </Button>
    </div>
  )
}
