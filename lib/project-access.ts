import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export interface ProjectAccess {
  userId: string | null
  email: string | null
  project: {
    id: string
    ownerId: string
    name: string
    description: string | null
    status: string
    createdAt: Date
    updatedAt: Date
  } | null
  hasAccess: boolean
}

export async function getProjectAccess(roomId: string): Promise<ProjectAccess> {
  const session = await auth()
  if (!session.userId) {
    return { userId: null, email: null, project: null, hasAccess: false }
  }

  const user = await currentUser()
  const primaryEmail =
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? null

  const project = await prisma.project.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      ownerId: true,
      name: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!project) {
    return {
      userId: session.userId,
      email: primaryEmail,
      project: null,
      hasAccess: false,
    }
  }

  if (project.ownerId === session.userId) {
    return { userId: session.userId, email: primaryEmail, project, hasAccess: true }
  }

  if (primaryEmail) {
    const collaborator = await prisma.projectCollaborator.findUnique({
      where: {
        projectId_email: { projectId: roomId, email: primaryEmail },
      },
    })
    if (collaborator) {
      return { userId: session.userId, email: primaryEmail, project, hasAccess: true }
    }
  }

  return { userId: session.userId, email: primaryEmail, project, hasAccess: false }
}
