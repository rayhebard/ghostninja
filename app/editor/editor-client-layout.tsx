"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { CreateProjectDialog } from "@/components/editor/create-project-dialog"
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog"
import {
  useProjectDialogState,
  ProjectDialogProvider,
} from "@/hooks/use-project-dialog"
import type { Project } from "@/hooks/use-project-dialog"

export function EditorClientLayout({
  children,
  initialProjects,
}: {
  children: React.ReactNode
  initialProjects: Project[]
}) {
  const pathname = usePathname()
  const isWorkspace = pathname !== "/editor" && pathname.startsWith("/editor/")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)
  const dialog = useProjectDialogState(initialProjects)

  return (
    <ProjectDialogProvider value={{ ...dialog, sidebarOpen: isSidebarOpen, toggleSidebar }}>
      <div className="flex-1 flex flex-col">
        {!isWorkspace && (
          <EditorNavbar />
        )}
        <div className={`flex flex-1 ${isWorkspace ? "" : "pt-12"}`}>
          <ProjectSidebar
            onClose={() => setIsSidebarOpen(false)}
          />
          <main className="flex-1">{children}</main>
        </div>

        <CreateProjectDialog
          open={dialog.dialog === "create"}
          onOpenChange={(open) => { if (!open) dialog.close() }}
          name={dialog.name}
          onNameChange={dialog.setName}
          onSubmit={dialog.createProject}
        />

        <RenameProjectDialog
          open={dialog.dialog === "rename"}
          onOpenChange={(open) => { if (!open) dialog.close() }}
          project={dialog.selectedProject}
          name={dialog.name}
          onNameChange={dialog.setName}
          onSubmit={dialog.renameProject}
        />

        <DeleteProjectDialog
          open={dialog.dialog === "delete"}
          onOpenChange={(open) => { if (!open) dialog.close() }}
          project={dialog.selectedProject}
          onSubmit={dialog.deleteProject}
        />
      </div>
    </ProjectDialogProvider>
  )
}
