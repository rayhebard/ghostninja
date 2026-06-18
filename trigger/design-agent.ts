import { task, logger } from "@trigger.dev/sdk/v3";
import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { Liveblocks } from "@liveblocks/node";
import { mutateFlow } from "@liveblocks/react-flow/node";

const LIVEBLOCKS_API = "https://api.liveblocks.io/v2";
const AGENT_USER_ID = "ai-design-agent";

function liveblocksSecret(): string {
  const key = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!key) throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
  return key;
}

const liveblocks = new Liveblocks({ secret: liveblocksSecret() });

function lbHeaders() {
  return {
    Authorization: `Bearer ${liveblocksSecret()}`,
    "Content-Type": "application/json",
  };
}

async function setAiPresence(roomId: string, status: string, ttl = 120) {
  await fetch(`${LIVEBLOCKS_API}/rooms/${roomId}/presence`, {
    method: "POST",
    headers: lbHeaders(),
    body: JSON.stringify({
      userId: AGENT_USER_ID,
      data: { status, cursor: null, isThinking: status !== "complete" },
      userInfo: {
        name: "AI Architect",
        avatar: "",
        color: "#6457f9",
      },
      ttl,
    }),
  }).catch((e) => logger.warn("Presence update failed", { error: String(e) }));
}

const CanvasNodeSchema = z.object({
  id: z.string().min(1),
  type: z.literal("canvasNode"),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.object({
    label: z.string(),
    color: z.string(),
    textColor: z.string(),
    shape: z.enum([
      "rectangle",
      "diamond",
      "circle",
      "pill",
      "cylinder",
      "hexagon",
    ]),
  }),
  width: z.number().optional().default(150),
  height: z.number().optional().default(60),
});

const CanvasEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  type: z.literal("canvasEdge"),
  data: z
    .object({
      label: z.string().optional(),
    })
    .optional()
    .default({}),
});

const DesignSchema = z.object({
  nodes: z.array(CanvasNodeSchema),
  edges: z.array(CanvasEdgeSchema),
}).refine(
  (data) => {
    // Allow empty edges only if there's 0 or 1 node
    if (data.edges.length === 0 && data.nodes.length > 1) {
      return false;
    }
    return true;
  },
  {
    message: "Designs with multiple nodes must include edges connecting them",
    path: ["edges"],
  }
);

export const designAgent = task({
  id: "design-agent",
  run: async (payload: {
    prompt: string;
    roomId: string;
    projectId: string;
    userId: string;
  }) => {
    const { prompt, roomId } = payload;

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY) {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
    }

    await setAiPresence(roomId, "Analyzing your prompt…");

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      output: Output.object({
        name: "Design",
        schema: DesignSchema,
      }),
      system: [
        "You are an AI system designer that generates node-and-edge diagrams for a collaborative canvas.",
        "",
        "CRITICAL INSTRUCTION: Every design with more than one node MUST include edges connecting them. A diagram is useless without connections — nodes alone do not describe an architecture. Always include edges unless the design has exactly one node.",
        "",
        "=== EDGE RULES ===",
        '- type MUST be "canvasEdge"',
        "- source and target MUST be valid node IDs from your nodes array",
        "- Each edge needs a unique id (e.g. \"e1\", \"e2\")",
        "- data.label is optional but recommended to describe the relationship (e.g. \"HTTP\", \"gRPC\", \"events\", \"SQL\", \"pub/sub\")",
        "- Every pair of nodes that logically communicate or depend on each other MUST be connected by an edge",
        "- Do NOT produce disconnected node clusters — every node should be reachable from others via edges",
        "",
        "=== CORRECT EXAMPLE ===",
        'Input: "design a microservice architecture with api gateway, auth, and database"',
        "Output:",
        '{',
        '  "nodes": [',
        '    { "id": "api-gateway", "type": "canvasNode", "position": { "x": 0, "y": 50 }, "data": { "label": "API Gateway", "color": "#10233D", "textColor": "#52A8FF", "shape": "pill" }, "width": 150, "height": 60 },',
        '    { "id": "auth-service", "type": "canvasNode", "position": { "x": 350, "y": 0 }, "data": { "label": "Auth Service", "color": "#0F2E18", "textColor": "#62C073", "shape": "rectangle" }, "width": 150, "height": 60 },',
        '    { "id": "db", "type": "canvasNode", "position": { "x": 350, "y": 100 }, "data": { "label": "Database", "color": "#331B00", "textColor": "#FF990A", "shape": "cylinder" }, "width": 150, "height": 60 }',
        '  ],',
        '  "edges": [',
        '    { "id": "e1", "source": "api-gateway", "target": "auth-service", "type": "canvasEdge", "data": { "label": "HTTP" } },',
        '    { "id": "e2", "source": "auth-service", "target": "db", "type": "canvasEdge", "data": { "label": "SQL" } }',
        '  ]',
        '}',
        "In the example above, every node is connected. The edges show clear relationships between components.",
        "",
        "=== BAD EXAMPLE (what NOT to do) ===",
        "If your output has 3+ nodes but edges is empty or omitted, the design is WRONG. Disconnected nodes do not describe a working system.",
        "",
        "=== NODE SHAPES ===",
        "- rectangle — general-purpose node",
        "- diamond — decision / gateway",
        "- circle — event / endpoint",
        "- pill — service / process",
        "- cylinder — database / storage",
        "- hexagon — external system / boundary",
        "",
        "=== COLORS (fill + text) ===",
        '- "#1F1F1F" / "#EDEDED" — Neutral dark (default)',
        '- "#10233D" / "#52A8FF" — Blue',
        '- "#2E1938" / "#BF7AF0" — Purple',
        '- "#331B00" / "#FF990A" — Orange',
        '- "#3C1618" / "#FF6166" — Red',
        '- "#3A1726" / "#F75F8F" — Pink',
        '- "#0F2E18" / "#62C073" — Green',
        '- "#062822" / "#0AC7B4" — Teal',
        "",
        "=== LAYOUT RULES ===",
        "- Place related services close together, separated by ~200px horizontally and ~150px vertically",
        "- Use left-to-right or top-to-bottom flow direction",
        "- Add labels that clearly describe each component",
        "- Use appropriate shapes",
      ].join("\n"),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const design = result.output;

    logger.info("Design generated", {
      nodeCount: design.nodes.length,
      edgeCount: design.edges.length,
    });

    if (design.nodes.length === 0 && design.edges.length === 0) {
      await setAiPresence(roomId, "Could not generate a design from that prompt", 10);
      return { status: "no_design_generated" };
    }

    await setAiPresence(roomId, "Applying design to canvas…");

    await mutateFlow(
      {
        client: liveblocks,
        roomId,
        nodes: { sync: { canvasNode: { data: true } } },
        edges: { sync: { canvasEdge: { data: true } } },
      },
      (flow) => {
        flow.addNodes(design.nodes as any);
        flow.addEdges(design.edges as any);
      },
    );

    await setAiPresence(roomId, "Design applied", 5);

    logger.info("Design generation complete", { roomId });

    return {
      status: "complete",
      nodesGenerated: design.nodes.length,
      edgesGenerated: design.edges.length,
    };
  },
});
