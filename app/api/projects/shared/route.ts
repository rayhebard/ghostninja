import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = await currentUser()
    const primaryEmail = user?.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    )?.emailAddress
    if (!primaryEmail) {
      return NextResponse.json([])
    }

    const records = await prisma.projectCollaborator.findMany({
      where: { email: primaryEmail },
      include: { project: true },
    })

    const projects = records
      .filter((r) => r.project.ownerId !== userId)
      .map((r) => ({
        ...r.project,
        createdAt: r.project.createdAt.toISOString(),
        updatedAt: r.project.updatedAt.toISOString(),
      }))

    return NextResponse.json(projects)
  } catch (err) {
    console.error("Failed to fetch shared projects:", err)
    return NextResponse.json(
      { error: "Failed to fetch shared projects" },
      { status: 500 },
    )
  }
}
