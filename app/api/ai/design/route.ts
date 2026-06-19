import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { getProjectAccess } from "@/lib/project-access";
import type { designAgent } from "@/trigger/design-agent";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let prompt: unknown;
  let roomId: unknown;
  let projectId: unknown;

  try {
    const body = await request.json();
    prompt = body.prompt;
    roomId = body.roomId;
    projectId = body.projectId;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  if (typeof roomId !== "string" || !roomId) {
    return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
  }

  if (typeof projectId !== "string" || !projectId) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  const access = await getProjectAccess(projectId);
  if (!access.hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const handle = await tasks.trigger<typeof designAgent>("design-agent", {
      prompt: prompt.trim(),
      roomId,
      projectId,
      userId,
    });

    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId,
        userId,
      },
    });

    return NextResponse.json({ runId: handle.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to trigger design task" },
      { status: 500 }
    );
  }
}
