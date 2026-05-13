"use client"

import { PanelLeftOpen, PanelLeftClose } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export function EditorNavbar({ isSidebarOpen, onToggleSidebar }: EditorNavbarProps) {
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
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex items-center" />

      <div className="flex items-center" />
    </header>
  )
}
