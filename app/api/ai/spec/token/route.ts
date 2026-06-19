import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { auth as triggerAuth } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let runId: unknown;

  try {
    const body = await request.json();
    runId = body.runId;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof runId !== "string" || !runId) {
    return NextResponse.json({ error: "Run ID is required" }, { status: 400 });
  }

  try {
    const taskRun = await prisma.taskRun.findUnique({
      where: { runId },
    });

    if (!taskRun) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    if (taskRun.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const publicToken = await triggerAuth.createPublicToken({
      scopes: {
        read: {
          runs: [runId],
        },
      },
      expirationTime: "1h",
    });

    return NextResponse.json({ token: publicToken });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 },
    );
  }
}
