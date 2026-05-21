import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { EditorClientLayout } from "./editor-client-layout"
import type { Project } from "@/hooks/use-project-dialog"

async function getProjects(userId: string): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  })
  return projects.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))
}

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  const projects = userId ? await getProjects(userId) : []

  return (
    <EditorClientLayout
      initialProjects={projects}
    >
      {children}
    </EditorClientLayout>
  )
}
