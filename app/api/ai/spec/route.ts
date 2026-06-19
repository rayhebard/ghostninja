import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { getProjectAccess } from "@/lib/project-access";
import type { generateSpec } from "@/trigger/generate-spec";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let roomId: unknown;
  let chatHistory: unknown;
  let nodes: unknown;
  let edges: unknown;

  try {
    const body = await request.json();
    roomId = body.roomId;
    chatHistory = body.chatHistory;
    nodes = body.nodes;
    edges = body.edges;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof roomId !== "string" || !roomId) {
    return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
  }

  const access = await getProjectAccess(roomId);
  if (!access.hasAccess || !access.project) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const projectId = access.project.id;

  try {
    const handle = await tasks.trigger<typeof generateSpec>("generate-spec", {
      projectId,
      roomId,
      chatHistory: Array.isArray(chatHistory) ? chatHistory : [],
      nodes: Array.isArray(nodes) ? nodes : [],
      edges: Array.isArray(edges) ? edges : [],
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
      { error: "Failed to trigger spec generation task" },
      { status: 500 },
    );
  }
}
