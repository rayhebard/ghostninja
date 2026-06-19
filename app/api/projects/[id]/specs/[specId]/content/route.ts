import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getProjectAccess } from "@/lib/project-access";
import { get } from "@vercel/blob";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; specId: string }> }
) {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId, specId } = await params;

    const access = await getProjectAccess(projectId);
    if (!access.hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const spec = await prisma.projectSpec.findUnique({
      where: { id: specId },
    });

    if (!spec || spec.projectId !== projectId) {
      return NextResponse.json({ error: "Spec not found" }, { status: 404 });
    }

    if (!spec.filePath) {
      return NextResponse.json({ error: "Spec content not yet uploaded" }, { status: 503 });
    }

    const blobData = await get(spec.filePath, { access: "private" });
    if (!blobData || blobData.statusCode === 304 || !blobData.stream) {
      return NextResponse.json({ error: "Spec content not found" }, { status: 404 });
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

    return NextResponse.json({ content: text });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to get spec content" },
      { status: 500 }
    );
  }
}
