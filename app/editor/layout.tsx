"use client"

import { useState } from "react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
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
    </div>
  )
}
