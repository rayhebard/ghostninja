"use client"

import { useState } from "react"
import { WorkspaceNavbar } from "./workspace-navbar"
import { ShareDialog } from "./share-dialog"

interface WorkspaceShellProps {
  projectName: string
  projectId: string
  isOwner: boolean
}

export function WorkspaceShell({
  projectName,
  projectId,
  isOwner,
}: WorkspaceShellProps) {
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  return (
    <div className="h-full flex flex-col">
      <WorkspaceNavbar
        projectName={projectName}
        isAiSidebarOpen={isAiSidebarOpen}
        onToggleAiSidebar={() => setIsAiSidebarOpen((prev) => !prev)}
        onShare={() => setShareOpen(true)}
      />

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        projectId={projectId}
        isOwner={isOwner}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 bg-base flex items-center justify-center">
          <p className="text-sm text-copy-faint">Canvas area</p>
        </div>

        {/* AI sidebar placeholder */}
        {isAiSidebarOpen && (
          <aside className="w-72 border-l border-border-default bg-surface flex items-center justify-center">
            <p className="text-sm text-copy-faint">AI chat</p>
          </aside>
        )}
      </div>
    </div>
  )
}
