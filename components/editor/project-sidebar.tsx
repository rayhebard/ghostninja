"use client"

import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-12 bottom-0 z-40",
        "w-64",
        "bg-surface border-r border-border-default",
        "flex flex-col",
        "shadow-2xl",
        "transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
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
            <TabsContent value="my-projects">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-copy-muted">No projects yet.</p>
                <p className="text-xs text-copy-faint mt-1">
                  Create your first project to get started.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="shared">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-copy-muted">No shared projects.</p>
                <p className="text-xs text-copy-faint mt-1">
                  Projects shared with you will appear here.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="p-3 border-t border-border-default">
        <Button className="w-full gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  )
}
