"use client"

import { useState, useCallback, createContext, useContext } from "react"

export interface Project {
  id: string
  name: string
  slug: string
  owned: boolean
}

export type DialogType = "create" | "rename" | "delete" | null

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export const mockProjects: Project[] = [
  { id: "p1", name: "Microservices Architecture", slug: "microservices-architecture", owned: true },
  { id: "p2", name: "API Gateway Design", slug: "api-gateway-design", owned: true },
]

export const mockSharedProjects: Project[] = [
  { id: "p3", name: "Team Infrastructure", slug: "team-infrastructure", owned: false },
]

interface ProjectDialogContextValue {
  dialog: DialogType
  selectedProject: Project | null
  name: string
  setName: (name: string) => void
  openCreate: () => void
  openRename: (project: Project) => void
  openDelete: (project: Project) => void
  close: () => void
}

const ProjectDialogContext = createContext<ProjectDialogContextValue | null>(null)

export function useProjectDialogContext() {
  const ctx = useContext(ProjectDialogContext)
  if (!ctx) throw new Error("useProjectDialogContext must be used within ProjectDialogProvider")
  return ctx
}

export function useProjectDialogState() {
  const [dialog, setDialog] = useState<DialogType>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [name, setName] = useState("")

  const openCreate = useCallback(() => {
    setSelectedProject(null)
    setName("")
    setDialog("create")
  }, [])

  const openRename = useCallback((project: Project) => {
    setSelectedProject(project)
    setName(project.name)
    setDialog("rename")
  }, [])

  const openDelete = useCallback((project: Project) => {
    setSelectedProject(project)
    setName("")
    setDialog("delete")
  }, [])

  const close = useCallback(() => {
    setDialog(null)
    setSelectedProject(null)
    setName("")
  }, [])

  return {
    dialog,
    selectedProject,
    name,
    setName,
    openCreate,
    openRename,
    openDelete,
    close,
  }
}

export function ProjectDialogProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: ProjectDialogContextValue
}) {
  return (
    <ProjectDialogContext.Provider value={value}>
      {children}
    </ProjectDialogContext.Provider>
  )
}
