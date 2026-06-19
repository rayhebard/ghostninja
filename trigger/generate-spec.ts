import { task, logger } from "@trigger.dev/sdk/v3";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const ChatMessageSchema = z.object({
  role: z.string(),
  content: z.string(),
});

const InputNodeSchema = z.object({
  id: z.string(),
  data: z.object({
    label: z.string(),
    shape: z.string().optional(),
  }).passthrough(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
}).passthrough();

const InputEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  data: z.object({
    label: z.string().optional(),
  }).passthrough().optional(),
}).passthrough();

const SpecInputSchema = z.object({
  projectId: z.string().min(1),
  roomId: z.string().min(1),
  chatHistory: z.array(ChatMessageSchema).default([]),
  nodes: z.array(InputNodeSchema).default([]),
  edges: z.array(InputEdgeSchema).default([]),
});

export const generateSpec = task({
  id: "generate-spec",
  run: async (payload: z.infer<typeof SpecInputSchema>) => {
    const parsed = SpecInputSchema.parse(payload);
    const { nodes, edges, chatHistory } = parsed;

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY) {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
    }

    logger.info("Generating spec", {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      chatLength: chatHistory.length,
    });

    const nodeDescriptions = nodes.map((n) => {
      const shape = n.data.shape ?? "rectangle";
      return `- ${n.id}: "${n.data.label}" (${shape}) at (${n.position?.x ?? 0}, ${n.position?.y ?? 0})`;
    }).join("\n");

    const edgeDescriptions = edges.map((e) => {
      const label = e.data?.label ? ` [${e.data.label}]` : "";
      return `- ${e.source} → ${e.target}${label}`;
    }).join("\n");

    const chatContext = chatHistory.length > 0
      ? `\n\n## Chat History\n\n${chatHistory.map((m) => `**${m.role}**: ${m.content}`).join("\n")}`
      : "";

    const systemPrompt = [
      "You are a technical spec writer. Given a system architecture diagram and optional chat context, produce a complete technical specification in Markdown.",
      "",
      "Include the following sections where applicable:",
      "1. **Overview** — what this system does",
      "2. **Architecture** — describe each component's role using the diagram labels",
      "3. **Data Flow** — describe how data moves between components based on edges",
      "4. **Key Design Decisions** — infer architectural choices from the topology",
      "5. **Recommendations** — suggest improvements or considerations",
      "",
      "Format the output as clean, well-structured Markdown. Use proper headings, lists, and code blocks where appropriate.",
      "Do not include a preamble or conclusion outside the spec structure.",
    ].join("\n");

    const userPrompt = [
      "Generate a technical specification for the system described below.",
      "",
      "## Diagram Nodes",
      nodeDescriptions || "(no nodes defined)",
      "",
      "## Diagram Edges",
      edgeDescriptions || "(no edges defined)",
      chatContext,
    ].join("\n");

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const spec = result.text;

    const specRecord = await prisma.projectSpec.create({
      data: {
        projectId: parsed.projectId,
      },
    });

    const blobPath = `specs/${parsed.projectId}/${specRecord.id}.md`;
    const blob = await put(blobPath, spec, {
      contentType: "text/markdown",
      access: "private",
    });

    await prisma.projectSpec.update({
      where: { id: specRecord.id },
      data: { filePath: blob.url },
    });

    logger.info("Spec generation complete", {
      length: spec.length,
      roomId: parsed.roomId,
      specId: specRecord.id,
    });

    return { spec, specId: specRecord.id, blobUrl: blob.url, status: "complete" };
  },
});
