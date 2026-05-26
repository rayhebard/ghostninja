"use client"

import { useState, useEffect, useTransition } from "react"
import Image from "next/image"
import { Copy, Check, X, Loader2, Mail, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Collaborator {
  id: string
  email: string | null
  name: string | null
  imageUrl: string | null
  role: "owner" | "collaborator"
  createdAt: string
}

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  isOwner: boolean
}

async function fetchCollaborators(projectId: string) {
  const res = await fetch(`/api/projects/${projectId}/collaborators`)
  if (!res.ok) return []
  const data = await res.json()
  return (data.collaborators || []) as Collaborator[]
}

async function inviteCollaborator(projectId: string, email: string) {
  const res = await fetch(`/api/projects/${projectId}/collaborators`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to invite")
  }
  return res.json()
}

async function removeCollaborator(projectId: string, email: string) {
  const res = await fetch(
    `/api/projects/${projectId}/collaborators?email=${encodeURIComponent(email)}`,
    { method: "DELETE" },
  )
  if (!res.ok) throw new Error("Failed to remove")
}

export function ShareDialog({
  open,
  onOpenChange,
  projectId,
  isOwner,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const [copied, setCopied] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const projectUrl = typeof window !== "undefined"
    ? `${window.location.origin}/editor/${projectId}`
    : ""

  useEffect(() => {
    if (!open) return

    startTransition(() => {
      setCopied(false)
      setInviteEmail("")
      setInviteError("")
      setLoading(true)
    })

    fetchCollaborators(projectId).then((list) => {
      startTransition(() => {
        setCollaborators(list)
        setLoading(false)
      })
    })
  }, [open, projectId])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text manually
    }
  }

  const handleInvite = async () => {
    const email = inviteEmail.trim().toLowerCase()
    if (!email) return

    setInviting(true)
    setInviteError("")
    try {
      const newCollaborator = await inviteCollaborator(projectId, email)
      setCollaborators((prev) => [{ ...newCollaborator, role: "collaborator" as const }, ...prev])
      setInviteEmail("")
    } catch (e) {
      setInviteError(e instanceof Error ? e.message : "Failed to invite")
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (email: string) => {
    setRemoving(email)
    try {
      await removeCollaborator(projectId, email)
      setCollaborators((prev) => prev.filter((c) => c.email !== email))
    } catch {
      // silently fail; list will be stale
    } finally {
      setRemoving(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share project</DialogTitle>
          <DialogDescription>
            Invite people to collaborate on this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-copy-primary">
              Project link
            </label>
            <div className="flex gap-2">
              <Input
                value={projectUrl}
                readOnly
                className="flex-1 text-xs font-mono text-copy-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                aria-label={copied ? "Copied" : "Copy link"}
                className={cn(
                  copied && "border-state-success text-state-success",
                )}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-state-success">Copied!</p>
            )}
          </div>

          {/* Collaborators */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-copy-primary">
              People with access
            </label>

            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-copy-muted" />
              </div>
            ) : collaborators.length === 0 ? (
              <p className="text-sm text-copy-muted py-4 text-center">
                No collaborators yet.
              </p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {collaborators.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-subtle group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {c.imageUrl ? (
                        <Image
                          src={c.imageUrl}
                          alt=""
                          width={28}
                          height={28}
                          className="rounded-full shrink-0"
                          unoptimized
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-subtle flex items-center justify-center shrink-0">
                          <User className="h-3.5 w-3.5 text-copy-muted" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-copy-primary truncate">
                            {c.name || c.email || "Owner"}
                          </p>
                          {c.role === "owner" && (
                            <span className="text-[10px] font-medium text-copy-muted bg-subtle px-1.5 py-0.5 rounded shrink-0">
                              Owner
                            </span>
                          )}
                        </div>
                        {c.name && c.email && (
                          <p className="text-xs text-copy-muted truncate">
                            {c.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {isOwner && c.role === "collaborator" && c.email && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 h-7 w-7"
                        onClick={() => handleRemove(c.email!)}
                        disabled={removing === c.email}
                        aria-label={`Remove ${c.name || c.email}`}
                      >
                        {removing === c.email ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-copy-muted" />
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invite — owners only */}
          {isOwner && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-copy-primary">
                Invite people
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-copy-muted pointer-events-none" />
                  <Input
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && inviteEmail.trim() && !inviting) {
                        handleInvite()
                      }
                    }}
                    className="pl-8"
                  />
                </div>
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || inviting}
                >
                  {inviting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Invite"
                  )}
                </Button>
              </div>
              {inviteError && (
                <p className="text-xs text-state-error">{inviteError}</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
