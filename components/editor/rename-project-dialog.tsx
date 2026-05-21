"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Project } from "@/hooks/use-project-dialog"

interface RenameProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  name: string
  onNameChange: (name: string) => void
  onSubmit: () => void | Promise<void>
}

export function RenameProjectDialog({
  open,
  onOpenChange,
  project,
  name,
  onNameChange,
  onSubmit,
}: RenameProjectDialogProps) {
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await Promise.resolve(onSubmit())
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>
            Rename <span className="font-medium text-copy-primary">{project?.name}</span> to
            something else.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium text-copy-primary">
            Project name
          </label>
          <Input
            ref={inputRef}
            value={name}
            disabled={loading}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim() && !loading) handleSubmit()
            }}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!name.trim() || loading} onClick={handleSubmit}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Rename
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
