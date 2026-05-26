import type { Node, Edge } from "@xyflow/react"

export type CanvasShape = "rectangle" | "diamond" | "circle" | "pill" | "cylinder" | "hexagon"

export interface CanvasNodeData {
  label: string
  color: string
  shape: CanvasShape
  [key: string]: unknown
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">
export type CanvasEdge = Edge<Record<string, unknown>, "canvasEdge">
