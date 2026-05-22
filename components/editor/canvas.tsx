"use client"

import { Component, type ReactNode, useCallback, useRef } from "react"
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { ReactFlow, ReactFlowProvider, Background, MiniMap, BackgroundVariant, useReactFlow, Handle, Position, type Node } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { ShapePanel, getShapePayload } from "./shape-panel"
import type { CanvasNodeData } from "@/types/canvas"

class ErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

type NodeComponentProps = { data: CanvasNodeData; selected?: boolean }

function RectangleNode({ data, selected }: NodeComponentProps) {
  return (
    <div className="h-full border-2 rounded-md bg-surface flex items-center justify-center px-3"
      style={{ borderColor: selected ? "var(--color-brand)" : "var(--color-copy-secondary)" }}>
      <Handle type="target" position={Position.Top} />
      <span className="text-copy-primary text-sm text-center">{data.label}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function DiamondNode({ data, selected }: NodeComponentProps) {
  const stroke = selected ? "var(--color-brand)" : "var(--color-copy-secondary)"
  return (
    <div className="h-full relative flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="50,5 95,50 50,95 5,50" fill="var(--color-surface)" stroke={stroke} strokeWidth="2" />
      </svg>
      <Handle type="target" position={Position.Top} />
      <span className="relative z-10 text-copy-primary text-sm text-center px-2">{data.label}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function CircleNode({ data, selected }: NodeComponentProps) {
  return (
    <div className="h-full rounded-full bg-surface border-2 flex items-center justify-center px-3"
      style={{ borderColor: selected ? "var(--color-brand)" : "var(--color-copy-secondary)" }}>
      <Handle type="target" position={Position.Top} />
      <span className="text-copy-primary text-sm text-center">{data.label}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function PillNode({ data, selected }: NodeComponentProps) {
  return (
    <div className="h-full rounded-full bg-surface border-2 flex items-center justify-center px-5"
      style={{ borderColor: selected ? "var(--color-brand)" : "var(--color-copy-secondary)" }}>
      <Handle type="target" position={Position.Top} />
      <span className="text-copy-primary text-sm text-center">{data.label}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function CylinderNode({ data, selected }: NodeComponentProps) {
  const stroke = selected ? "var(--color-brand)" : "var(--color-copy-secondary)"
  return (
    <div className="h-full relative flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect x="10" y="15" width="80" height="70" fill="var(--color-surface)" />
        <ellipse cx="50" cy="85" rx="40" ry="10" fill="var(--color-surface)" stroke={stroke} strokeWidth="2" />
        <ellipse cx="50" cy="15" rx="40" ry="10" fill="var(--color-surface)" stroke={stroke} strokeWidth="2" />
        <line x1="10" y1="15" x2="10" y2="85" stroke={stroke} strokeWidth="2" />
        <line x1="90" y1="15" x2="90" y2="85" stroke={stroke} strokeWidth="2" />
      </svg>
      <Handle type="target" position={Position.Top} />
      <span className="relative z-10 text-copy-primary text-sm text-center px-2">{data.label}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function HexagonNode({ data, selected }: NodeComponentProps) {
  const stroke = selected ? "var(--color-brand)" : "var(--color-copy-secondary)"
  return (
    <div className="h-full relative flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="25,5 75,5 95,50 75,95 25,95 5,50" fill="var(--color-surface)" stroke={stroke} strokeWidth="2" />
      </svg>
      <Handle type="target" position={Position.Top} />
      <span className="relative z-10 text-copy-primary text-sm text-center px-2">{data.label}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function CanvasNode({ data, selected }: { data: CanvasNodeData; selected?: boolean }) {
  switch (data.shape) {
    case "diamond":
      return <DiamondNode data={data} selected={selected} />
    case "circle":
      return <CircleNode data={data} selected={selected} />
    case "pill":
      return <PillNode data={data} selected={selected} />
    case "cylinder":
      return <CylinderNode data={data} selected={selected} />
    case "hexagon":
      return <HexagonNode data={data} selected={selected} />
    default:
      return <RectangleNode data={data} selected={selected} />
  }
}

const nodeTypes = { canvasNode: CanvasNode }

function FlowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useLiveblocksFlow({ suspense: true })
  const reactFlow = useReactFlow()
  const counterRef = useRef(0)

  const onDragOver: React.DragEventHandler<HTMLDivElement> = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }, [])

  const onDrop: React.DragEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault()
      const payload = getShapePayload(e.dataTransfer)
      if (!payload) return

      const position = reactFlow.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      })

      const id = `${payload.shape}-${Date.now()}-${counterRef.current++}`
      const newNode: Node<CanvasNodeData, "canvasNode"> = {
        id,
        type: "canvasNode",
        position,
        data: {
          label: "",
          color: "var(--color-brand)",
          shape: payload.shape as CanvasNodeData["shape"],
        },
        width: payload.width,
        height: payload.height,
      }

      onNodesChange([{ type: "add", item: newNode }])
    },
    [reactFlow, onNodesChange],
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDrop={onDrop}
      onDragOver={onDragOver}
      isValidConnection={() => true}
      fitView
      colorMode="dark"
      defaultEdgeOptions={{ animated: true }}
      nodeTypes={nodeTypes}
    >
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
      <MiniMap
        position="bottom-left"
        style={{ background: "var(--color-surface)" }}
      />
      <ShapePanel />
    </ReactFlow>
  )
}

function CanvasInner() {
  return (
    <div className="flex-1">
      <ReactFlowProvider>
        <FlowCanvas />
      </ReactFlowProvider>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center bg-base">
      <p className="text-sm text-copy-faint">Connecting to canvas…</p>
    </div>
  )
}

function ErrorFallback() {
  return (
    <div className="flex-1 flex items-center justify-center bg-base">
      <p className="text-sm text-state-error">Failed to connect. Please try again.</p>
    </div>
  )
}

interface CanvasProps {
  roomId: string
}

export function Canvas({ roomId }: CanvasProps) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{ cursor: null, isThinking: false }}
        >
          <ClientSideSuspense fallback={<Loading />}>
            <CanvasInner />
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </ErrorBoundary>
  )
}
