import type { CanvasNode, CanvasEdge } from "@/types/canvas"

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

export interface TemplatePreviewBounds {
  x: number
  y: number
  width: number
  height: number
}

export function getTemplateBounds(nodes: CanvasNode[]): TemplatePreviewBounds {
  if (nodes.length === 0) return { x: 0, y: 0, width: 0, height: 0 }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const n of nodes) {
    const w = n.width ?? 120
    const h = n.height ?? 60
    if (n.position.x < minX) minX = n.position.x
    if (n.position.y < minY) minY = n.position.y
    if (n.position.x + w > maxX) maxX = n.position.x + w
    if (n.position.y + h > maxY) maxY = n.position.y + h
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

function n(
  id: string,
  label: string,
  shape: CanvasNode["data"]["shape"],
  colorIdx: number,
  x: number,
  y: number,
  w = 140,
  h = 60,
): CanvasNode {
  const colors = [
    { color: "#1F1F1F", textColor: "#EDEDED" },
    { color: "#10233D", textColor: "#52A8FF" },
    { color: "#2E1938", textColor: "#BF7AF0" },
    { color: "#331B00", textColor: "#FF990A" },
    { color: "#3C1618", textColor: "#FF6166" },
    { color: "#3A1726", textColor: "#F75F8F" },
    { color: "#0F2E18", textColor: "#62C073" },
    { color: "#062822", textColor: "#0AC7B4" },
  ]
  const c = colors[colorIdx % colors.length]
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    data: { label, color: c.color, textColor: c.textColor, shape },
    width: w,
    height: h,
    selected: false,
  } as CanvasNode
}

function e(id: string, source: string, target: string, label = ""): CanvasEdge {
  return {
    id,
    type: "canvasEdge",
    source,
    target,
    data: { label },
    selected: false,
  } as CanvasEdge
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices System",
    description: "API gateway, services, message queue, and database nodes for a microservices architecture.",
    nodes: [
      n("gw", "API Gateway", "pill", 1, 0, 80),
      n("discovery", "Service Discovery", "diamond", 2, 0, 200),
      n("auth", "Auth Service", "rectangle", 3, 220, 0),
      n("users", "User Service", "rectangle", 6, 220, 100),
      n("orders", "Order Service", "rectangle", 3, 220, 200),
      n("payments", "Payment Service", "rectangle", 4, 220, 300),
      n("queue", "Message Queue", "cylinder", 7, 460, 150, 140, 70),
      n("db", "Database", "cylinder", 0, 460, 280, 140, 70),
    ],
    edges: [
      e("e1", "gw", "auth"),
      e("e2", "gw", "users"),
      e("e3", "gw", "orders"),
      e("e4", "gw", "discovery"),
      e("e5", "auth", "discovery"),
      e("e6", "users", "discovery"),
      e("e7", "orders", "discovery", "discovers"),
      e("e8", "users", "db"),
      e("e9", "orders", "db"),
      e("e10", "orders", "queue"),
      e("e11", "payments", "queue"),
    ],
  },
  {
    id: "ci-cd-pipeline",
    name: "CI/CD Pipeline",
    description: "Continuous integration and deployment pipeline from source to production.",
    nodes: [
      n("source", "Source Code", "rectangle", 6, 0, 100),
      n("build", "Build", "rectangle", 1, 190, 100),
      n("unit", "Unit Tests", "diamond", 3, 380, 40),
      n("integration", "Integration Tests", "diamond", 2, 380, 160),
      n("staging", "Deploy Staging", "pill", 7, 570, 100),
      n("staging-tests", "Staging Tests", "circle", 3, 760, 40),
      n("e2e", "E2E Tests", "circle", 4, 760, 160),
      n("production", "Deploy Production", "pill", 4, 950, 100),
    ],
    edges: [
      e("c1", "source", "build"),
      e("c2", "build", "unit"),
      e("c3", "build", "integration"),
      e("c4", "unit", "staging"),
      e("c5", "integration", "staging"),
      e("c6", "staging", "staging-tests"),
      e("c7", "staging", "e2e"),
      e("c8", "staging-tests", "production"),
      e("c9", "e2e", "production"),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "Event bus with producers, consumers, and processing pipeline.",
    nodes: [
      n("bus", "Event Bus", "hexagon", 7, 200, 100, 160, 80),
      n("orders", "Order Service", "rectangle", 1, 0, 30),
      n("inventory", "Inventory Service", "rectangle", 6, 0, 170),
      n("notifier", "Notification Service", "rectangle", 2, 460, 30),
      n("analytics", "Analytics Service", "circle", 6, 460, 170),
      n("email", "Email Service", "pill", 3, 680, 30),
      n("audit", "Audit Log", "cylinder", 0, 680, 170),
    ],
    edges: [
      e("d1", "orders", "bus", "order.placed"),
      e("d2", "inventory", "bus", "inventory.updated"),
      e("d3", "bus", "notifier", "notify"),
      e("d4", "bus", "analytics", "track"),
      e("d5", "notifier", "email"),
      e("d6", "notifier", "audit"),
    ],
  },
]
