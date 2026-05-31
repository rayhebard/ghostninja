import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getProjectAccess } from "@/lib/project-access";
import { put, get } from "@vercel/blob";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const access = await getProjectAccess(id);
    if (!access.hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    if (!Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
      return NextResponse.json(
        { error: "Invalid canvas data: nodes and edges must be arrays" },
        { status: 400 }
      );
    }
    const canvasJson = JSON.stringify(body);

    const blob = await put(`canvases/${id}.json`, canvasJson, {
      contentType: "application/json",
      access: "private",
      allowOverwrite: true,
    });

    await prisma.project.update({
      where: { id },
      data: { canvasBlobUrl: blob.url },
    });

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save canvas" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const access = await getProjectAccess(id);
    if (!access.hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      select: { canvasBlobUrl: true },
    });

    if (!project?.canvasBlobUrl) {
      return NextResponse.json({ nodes: [], edges: [] });
    }

    const blobData = await get(project.canvasBlobUrl, { access: "private" });
    if (!blobData || blobData.statusCode === 304 || !blobData.stream) {
      return NextResponse.json({ nodes: [], edges: [] });
    }
    const reader = blobData.stream.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    const canvasState = JSON.parse(text);
    return NextResponse.json(canvasState);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load canvas" },
      { status: 500 }
    );
  }
}
