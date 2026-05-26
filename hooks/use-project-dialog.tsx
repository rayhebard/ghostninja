"use client"

import { useState, useCallback, useEffect, createContext, useContext } from "react"
import { useRouter, usePathname } from "next/navigation"

export interface Project {
  id: string
  ownerId: string
  name: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export type DialogType = "create" | "rename" | "delete" | null

export function toSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  return slug || "untitled"
}

interface ProjectDialogContextValue {
  projects: Project[]
  sharedProjects: Project[]
  loading: boolean
  dialog: DialogType
  selectedProject: Project | null
  name: string
  setName: (name: string) => void
  openCreate: () => void
  openRename: (project: Project) => void
  openDelete: (project: Project) => void
  close: () => void
  createProject: () => Promise<void>
  renameProject: () => Promise<void>
  deleteProject: () => Promise<void>
  sidebarOpen: boolean
  toggleSidebar: () => void
}

const ProjectDialogContext = createContext<ProjectDialogContextValue | null>(null)

export function useProjectDialogContext() {
  const ctx = useContext(ProjectDialogContext)
  if (!ctx) throw new Error("useProjectDialogContext must be used within ProjectDialogProvider")
  return ctx
}

async function apiCreateProject(name: string, description: string | null): Promise<Project | null> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  })
  if (!res.ok) return null
  return res.json()
}

async function apiRenameProject(id: string, name: string): Promise<Project | null> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) return null
  return res.json()
}

async function apiDeleteProject(id: string): Promise<boolean> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  })
  return res.ok
}

export function useProjectDialogState(
  initialProjects: Project[] = [],
) {
  const router = useRouter()
  const pathname = usePathname()
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [sharedProjects, setSharedProjects] = useState<Project[]>([])
  const [loading, _setLoading] = useState(false)
  const [dialog, setDialog] = useState<DialogType>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [name, setName] = useState("")

  useEffect(() => {
    _setLoading(true)
    fetch("/api/projects/shared")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setSharedProjects(Array.isArray(data) ? data : [])
        _setLoading(false)
      })
      .catch(() => {
        setSharedProjects([])
        _setLoading(false)
      })
  }, [])

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

  const createProject = useCallback(async () => {
    const project = await apiCreateProject(name, null)
    if (project) {
      setProjects((prev) => [project, ...prev])
      close()
      router.push(`/editor/${project.id}`)
    }
  }, [name, close, router])

  const renameProject = useCallback(async () => {
    if (!selectedProject) return
    const updated = await apiRenameProject(selectedProject.id, name)
    if (updated) {
      setProjects((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      )
    }
    close()
    router.refresh()
  }, [selectedProject, name, close, router])

  const deleteProject = useCallback(async () => {
    if (!selectedProject) return
    const ok = await apiDeleteProject(selectedProject.id)
    if (ok) {
      setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id))
      if (pathname === `/editor/${selectedProject.id}`) {
        router.push("/editor")
      } else {
        router.refresh()
      }
    }
    close()
  }, [selectedProject, close, pathname, router])

  return {
    projects,
    sharedProjects,
    loading,
    dialog,
    selectedProject,
    name,
    setName,
    openCreate,
    openRename,
    openDelete,
    close,
    createProject,
    renameProject,
    deleteProject,
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
