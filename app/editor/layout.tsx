"use client"

import { useState } from "react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { CreateProjectDialog } from "@/components/editor/create-project-dialog"
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog"
import {
  useProjectDialogState,
  ProjectDialogProvider,
} from "@/hooks/use-project-dialog"

function EditorContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const dialog = useProjectDialogState()

  return (
    <ProjectDialogProvider value={dialog}>
      <div className="flex-1 flex flex-col">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        <div className="flex flex-1 pt-12">
          <ProjectSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          <main className="flex-1">{children}</main>
        </div>

        <CreateProjectDialog
          open={dialog.dialog === "create"}
          onOpenChange={(open) => { if (!open) dialog.close() }}
          name={dialog.name}
          onNameChange={dialog.setName}
          onSubmit={() => dialog.close()}
        />

        <RenameProjectDialog
          open={dialog.dialog === "rename"}
          onOpenChange={(open) => { if (!open) dialog.close() }}
          project={dialog.selectedProject}
          name={dialog.name}
          onNameChange={dialog.setName}
          onSubmit={() => dialog.close()}
        />

        <DeleteProjectDialog
          open={dialog.dialog === "delete"}
          onOpenChange={(open) => { if (!open) dialog.close() }}
          project={dialog.selectedProject}
          onSubmit={() => dialog.close()}
        />
      </div>
    </ProjectDialogProvider>
  )
}

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <EditorContent>{children}</EditorContent>
}
