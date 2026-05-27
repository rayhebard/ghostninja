"use client"

import { useState, useCallback } from "react"
import { WorkspaceNavbar } from "./workspace-navbar"
import { ShareDialog } from "./share-dialog"
import { Canvas } from "./canvas"
import { StarterTemplateModal } from "./starter-template-modal"
import type { CanvasTemplate } from "./starter-templates"

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
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [importTemplate, setImportTemplate] = useState<((t: CanvasTemplate) => void) | null>(null)

  const handleImport = useCallback(
    (template: CanvasTemplate) => {
      importTemplate?.(template)
    },
    [importTemplate],
  )

  const handleRegisterImport = useCallback(
    (fn: ((template: CanvasTemplate) => void) | null) => {
      setImportTemplate(() => fn)
    },
    [],
  )

  return (
    <div className="h-full flex flex-col">
      <WorkspaceNavbar
        projectName={projectName}
        isAiSidebarOpen={isAiSidebarOpen}
        onToggleAiSidebar={() => setIsAiSidebarOpen((prev) => !prev)}
        onShare={() => setShareOpen(true)}
        onOpenTemplates={importTemplate ? () => setTemplateModalOpen(true) : undefined}
      />

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        projectId={projectId}
        isOwner={isOwner}
      />

      <StarterTemplateModal
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        onImport={handleImport}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <Canvas roomId={projectId} onRegisterImportTemplate={handleRegisterImport} />

        {isAiSidebarOpen && (
          <aside className="absolute right-0 top-0 bottom-0 w-72 border-l border-border-default bg-surface z-30 flex items-center justify-center">
            <p className="text-sm text-copy-faint">AI chat</p>
          </aside>
        )}
      </div>
    </div>
  )
}
