import { NextResponse } from "next/server"
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

async function getCollaborators(projectId: string) {
  const records = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  })
  return records
}

async function enrichWithClerk(
  records: { id: string; email: string; createdAt: Date }[],
) {
  const client = await clerkClient()
  const enriched = await Promise.all(
    records.map(async (r) => {
      try {
        const { data: users } = await client.users.getUserList({
          emailAddress: [r.email],
          limit: 1,
        })
        const user = users[0]
        if (user) {
          return {
            id: r.id,
            email: r.email,
            name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
            imageUrl: user.imageUrl,
            createdAt: r.createdAt.toISOString(),
          }
        }
      } catch {
        // fall through to email-only
      }
      return {
        id: r.id,
        email: r.email,
        name: null,
        imageUrl: null,
        createdAt: r.createdAt.toISOString(),
      }
    }),
  )
  return enriched
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const isOwner = project.ownerId === userId
  let hasAccess = isOwner

  if (!hasAccess) {
    const user = await currentUser()
    const primaryEmail = user?.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    )?.emailAddress
    if (primaryEmail) {
      const collaborator = await prisma.projectCollaborator.findUnique({
        where: { projectId_email: { projectId: id, email: primaryEmail } },
      })
      hasAccess = !!collaborator
    }
  }

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const records = await getCollaborators(id)
  const enriched = await enrichWithClerk(records)

  // Include owner in the list
  const client = await clerkClient()
  let ownerEntry: {
    id: string
    email: string | null
    name: string | null
    imageUrl: string | null
    role: "owner"
    createdAt: string
  } = {
    id: project.ownerId,
    email: null,
    name: null,
    imageUrl: null,
    role: "owner",
    createdAt: project.createdAt.toISOString(),
  }
  try {
    const ownerUser = await client.users.getUser(project.ownerId)
    const primaryEmail = ownerUser.emailAddresses.find(
      (e) => e.id === ownerUser.primaryEmailAddressId,
    )
    ownerEntry = {
      ...ownerEntry,
      email: primaryEmail?.emailAddress ?? null,
      name: [ownerUser.firstName, ownerUser.lastName].filter(Boolean).join(" ") || null,
      imageUrl: ownerUser.imageUrl,
    }
  } catch {
    // fall through to minimal owner entry
  }

  const collaboratorsWithOwner = [
    ownerEntry,
    ...enriched.map((c) => ({ ...c, role: "collaborator" as const })),
  ]

  return NextResponse.json({ collaborators: collaboratorsWithOwner, isOwner })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let email: string
  try {
    const body = await request.json()
    email = body.email
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const currentClerkUser = await currentUser()
  const currentEmail = currentClerkUser?.emailAddresses.find(
    (e) => e.id === currentClerkUser.primaryEmailAddressId,
  )?.emailAddress

  if (currentEmail && normalizedEmail === currentEmail.toLowerCase()) {
    return NextResponse.json({ error: "Cannot invite yourself" }, { status: 400 })
  }

  const existing = await prisma.projectCollaborator.findUnique({
    where: { projectId_email: { projectId: id, email: normalizedEmail } },
  })
  if (existing) {
    return NextResponse.json({ error: "Already a collaborator" }, { status: 409 })
  }

  const collaborator = await prisma.projectCollaborator.create({
    data: { projectId: id, email: normalizedEmail },
  })

  try {
    const client = await clerkClient()
    const url = new URL(request.url)
    await client.invitations.createInvitation({
      emailAddress: normalizedEmail,
      redirectUrl: `${url.origin}/editor/${id}`,
    })
  } catch {
    // Invitation email is best-effort; collaborator record is already saved
  }

  const enriched = await enrichWithClerk([collaborator])

  return NextResponse.json(enriched[0], { status: 201 })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "Email query parameter is required" }, { status: 400 })
  }

  const collaborator = await prisma.projectCollaborator.findUnique({
    where: { projectId_email: { projectId: id, email } },
  })
  if (!collaborator) {
    return NextResponse.json({ error: "Collaborator not found" }, { status: 404 })
  }

  await prisma.projectCollaborator.delete({
    where: { id: collaborator.id },
  })

  return NextResponse.json({ success: true })
}
