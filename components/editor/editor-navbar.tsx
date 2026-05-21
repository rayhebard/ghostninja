"use client"

import { PanelLeftOpen, PanelLeftClose } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useProjectDialogContext } from "@/hooks/use-project-dialog"

export function EditorNavbar() {
  const { sidebarOpen, toggleSidebar } = useProjectDialogContext()

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "h-12",
        "flex items-center justify-between",
        "bg-elevated border-b border-border-default",
        "px-3"
      )}
    >
      <div className="flex items-center">
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
      </div>

      <div className="flex items-center" />

      <div className="flex items-center gap-2">
        <UserButton />
      </div>
    </header>
  )
}
