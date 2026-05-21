import { auth, currentUser } from "@clerk/nextjs/server"
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

async function getSharedProjects(userId: string): Promise<Project[]> {
  try {
    const user = await currentUser()
    const primaryEmail = user?.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    )?.emailAddress
    if (!primaryEmail) return []

    const records = await prisma.projectCollaborator.findMany({
      where: { email: primaryEmail },
      include: { project: true },
    })

    return records
      .filter((r) => r.project.ownerId !== userId)
      .map((r) => ({
        ...r.project,
        createdAt: r.project.createdAt.toISOString(),
        updatedAt: r.project.updatedAt.toISOString(),
      }))
  } catch {
    return []
  }
}

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  const projects = userId ? await getProjects(userId) : []
  const sharedProjects = userId ? await getSharedProjects(userId) : []

  return (
    <EditorClientLayout
      initialProjects={projects}
      initialSharedProjects={sharedProjects}
    >
      {children}
    </EditorClientLayout>
  )
}
