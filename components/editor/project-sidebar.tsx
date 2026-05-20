"use client"

import { X, Plus, EllipsisVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  mockProjects,
  mockSharedProjects,
  useProjectDialogContext,
} from "@/hooks/use-project-dialog"
import { useState, useId, useRef, useCallback, useEffect } from "react"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

function ProjectItem({
  name,
  owned,
  onRename,
  onDelete,
}: {
  name: string
  owned: boolean
  onRename: () => void
  onDelete: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const closeAndFocusTrigger = useCallback(() => {
    setMenuOpen(false)
    triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (menuOpen) {
      const firstItem = menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')
      firstItem?.focus()
    }
  }, [menuOpen])

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    const items = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')
    if (!items || items.length === 0) return

    const currentIndex = Array.from(items).findIndex((item) => item === document.activeElement)

    switch (e.key) {
      case "Escape": {
        closeAndFocusTrigger()
        break
      }
      case "ArrowDown": {
        e.preventDefault()
        const nextIndex = (currentIndex + 1) % items.length
        items[nextIndex].focus()
        break
      }
      case "ArrowUp": {
        e.preventDefault()
        const prevIndex = (currentIndex - 1 + items.length) % items.length
        items[prevIndex].focus()
        break
      }
    }
  }

  return (
    <div className="group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-subtle cursor-pointer">
      <span className="text-sm text-copy-primary truncate">{name}</span>
      {owned && (
        <div className="relative">
          <button
            ref={triggerRef}
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen((prev) => !prev)
            }}
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-1 rounded-md hover:bg-elevated transition-opacity"
            aria-label="Project actions"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-haspopup="true"
          >
            <EllipsisVertical className="h-3.5 w-3.5 text-copy-muted" />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div
                ref={menuRef}
                id={menuId}
                role="menu"
                onKeyDown={handleMenuKeyDown}
                className="absolute right-0 top-full mt-1 z-20 w-36 bg-elevated border border-border-default rounded-xl shadow-lg py-1"
              >
                <button
                  role="menuitem"
                  tabIndex={-1}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-copy-primary hover:bg-subtle"
                  onClick={() => {
                    setMenuOpen(false)
                    onRename()
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Rename
                </button>
                <button
                  role="menuitem"
                  tabIndex={-1}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-state-error hover:bg-subtle"
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete()
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  const { openCreate, openRename, openDelete } = useProjectDialogContext()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        aria-hidden={!isOpen}
        inert={isOpen ? undefined : true}
        tabIndex={isOpen ? 0 : -1}
        className={cn(
          "fixed left-0 top-12 bottom-0 z-40",
          "w-64",
          "bg-surface border-r border-border-default",
          "flex flex-col",
          "shadow-2xl",
          "transition-transform duration-200 ease-in-out",
          isOpen
            ? "translate-x-0 visible pointer-events-auto"
            : "-translate-x-full invisible pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between px-4 h-12 border-b border-border-default">
          <h2 className="text-sm font-semibold text-copy-primary">Projects</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="px-3 pt-3">
            <Tabs defaultValue="my-projects">
              <TabsList className="w-full">
                <TabsTrigger value="my-projects" className="flex-1">
                  My Projects
                </TabsTrigger>
                <TabsTrigger value="shared" className="flex-1">
                  Shared
                </TabsTrigger>
              </TabsList>
              <TabsContent value="my-projects" className="mt-2 space-y-0.5">
                {mockProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-copy-muted">No projects yet.</p>
                    <p className="text-xs text-copy-faint mt-1">
                      Create your first project to get started.
                    </p>
                  </div>
                ) : (
                  mockProjects.map((p) => (
                    <ProjectItem
                      key={p.id}
                      name={p.name}
                      owned={p.owned}
                      onRename={() => openRename(p)}
                      onDelete={() => openDelete(p)}
                    />
                  ))
                )}
              </TabsContent>
              <TabsContent value="shared" className="mt-2 space-y-0.5">
                {mockSharedProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-copy-muted">No shared projects.</p>
                    <p className="text-xs text-copy-faint mt-1">
                      Projects shared with you will appear here.
                    </p>
                  </div>
                ) : (
                  mockSharedProjects.map((p) => (
                    <ProjectItem
                      key={p.id}
                      name={p.name}
                      owned={p.owned}
                      onRename={() => openRename(p)}
                      onDelete={() => openDelete(p)}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="p-3 border-t border-border-default">
          <Button className="w-full gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}
