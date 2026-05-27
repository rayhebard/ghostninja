"use client"

import { ArrowLeft, PanelLeftOpen, PanelLeftClose, Share2, Bot, LayoutTemplate } from "lucide-react"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { useProjectDialogContext } from "@/hooks/use-project-dialog"

interface WorkspaceNavbarProps {
  projectName: string
  isAiSidebarOpen: boolean
  onToggleAiSidebar: () => void
  onShare: () => void
  onOpenTemplates?: () => void
}

export function WorkspaceNavbar({
  projectName,
  isAiSidebarOpen,
  onToggleAiSidebar,
  onShare,
  onOpenTemplates,
}: WorkspaceNavbarProps) {
  const { sidebarOpen, toggleSidebar } = useProjectDialogContext()

  return (
    <header className="h-12 flex items-center justify-between bg-elevated border-b border-border-default px-3 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </Button>

        <Link
          href="/editor"
          className="flex items-center gap-1 text-sm text-copy-muted hover:text-copy-primary transition-colors shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Projects</span>
        </Link>

        <span className="text-copy-faint select-none">/</span>

        <h1 className="text-sm font-semibold text-copy-primary truncate min-w-0">
          {projectName}
        </h1>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" aria-label="Share project" onClick={onShare}>
          <Share2 className="h-4 w-4" />
        </Button>
        {onOpenTemplates && (
          <Button variant="ghost" size="icon" aria-label="Starter templates" onClick={onOpenTemplates}>
            <LayoutTemplate className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleAiSidebar}
          aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
        >
          <Bot className="h-4 w-4" />
        </Button>
        <UserButton />
      </div>
    </header>
  )
}
