import { redirect } from "next/navigation"
import { getProjectAccess } from "@/lib/project-access"
import { AccessDenied } from "@/components/editor/access-denied"
import { WorkspaceShell } from "@/components/editor/workspace-shell"

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = await params
  const { userId, project, hasAccess } = await getProjectAccess(roomId)

  if (!userId) {
    redirect("/sign-in")
  }

  if (!project || !hasAccess) {
    return <AccessDenied />
  }

  return (
    <WorkspaceShell
      projectName={project.name}
      projectId={project.id}
      isOwner={project.ownerId === userId}
    />
  )
}
