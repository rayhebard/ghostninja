"use client"

import { useEffect, useRef, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toSlug } from "@/hooks/use-project-dialog"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  onNameChange: (name: string) => void
  onSubmit: () => void
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  onSubmit,
}: CreateProjectDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const slug = toSlug(name)
  const suffix = useMemo(() => Math.random().toString(36).substring(2, 6), [open])
  const roomId = slug ? `${slug}-${suffix}` : ""

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            Give your project a name. A URL-friendly slug will be generated
            automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-copy-primary">
              Project name
            </label>
            <Input
              ref={inputRef}
              placeholder="e.g. My Architecture"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && slug) onSubmit()
              }}
            />
          </div>
          {name.trim() ? (
            slug ? (
              <div className="space-y-1 rounded-md bg-subtle px-3 py-2">
                <p className="text-xs text-copy-muted">Room ID (auto-generated)</p>
                <p className="text-sm font-mono text-copy-secondary break-all">{roomId}</p>
              </div>
            ) : (
              <p className="text-xs text-state-error">
                Project name must include at least one letter or number.
              </p>
            )
          ) : null}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!slug} onClick={onSubmit}>
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
