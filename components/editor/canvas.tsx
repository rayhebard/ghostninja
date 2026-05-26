"use client"

import { Component, type ReactNode, useCallback, useRef, useState, useEffect, createContext, useContext } from "react"
import { LiveObject, LiveMap } from "@liveblocks/core"
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react"
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow"
import "@liveblocks/react-flow/styles.css"
import { ReactFlow, ReactFlowProvider, Background, MiniMap, BackgroundVariant, useReactFlow, Handle, Position, NodeResizer, type Node } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { ShapePanel, getShapePayload } from "./shape-panel"
import type { CanvasNodeData } from "@/types/canvas"

const NodeEditContext = createContext<{
  updateNodeLabel: (id: string, label: string) => void
}>({ updateNodeLabel: () => {} })

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

type NodeComponentProps = { id: string; data: CanvasNodeData; selected?: boolean }

function EditableLabel({ id, label, className }: { id: string; label: string; className?: string }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(label)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const { updateNodeLabel } = useContext(NodeEditContext)

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [editing])

  const save = useCallback(() => {
    if (value !== label) {
      updateNodeLabel(id, value)
    }
    setEditing(false)
  }, [id, value, label, updateNodeLabel])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setEditing(true)
    setValue(label)
  }, [label])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setValue(label)
        setEditing(false)
      }
    },
    [label],
  )

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          const v = e.target.value
          setValue(v)
          if (v !== label) {
            updateNodeLabel(id, v)
          }
        }}
        onBlur={save}
        onKeyDown={handleKeyDown}
        rows={1}
        className="nodrag nowheel !absolute !inset-0 resize-none bg-transparent text-copy-primary text-sm text-center outline-none border-0 overflow-hidden leading-tight w-full h-full px-2 py-1"
      />
    )
  }

  return (
    <span
      ref={labelRef}
      onDoubleClick={handleDoubleClick}
      className={`min-w-[3rem] min-h-[1.5rem] inline-flex items-center justify-center cursor-default ${className ?? ""}`}
    >
      {label || <span className="text-copy-faint select-none">Label</span>}
    </span>
  )
}

function RectangleNode({ id, data, selected }: NodeComponentProps) {
  return (
    <div className="h-full relative border-2 rounded-md bg-surface flex items-center justify-center px-3"
      style={{ borderColor: selected ? "var(--color-brand)" : "var(--color-copy-secondary)" }}>
      <NodeResizer isVisible={selected} minWidth={60} minHeight={40} color="var(--color-copy-muted)" lineClassName="!border-copy-muted" />
      <Handle type="target" position={Position.Top} />
      <EditableLabel id={id} label={data.label} className="text-copy-primary text-sm text-center" />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function DiamondNode({ id, data, selected }: NodeComponentProps) {
  const stroke = selected ? "var(--color-brand)" : "var(--color-copy-secondary)"
  return (
    <div className="h-full relative flex items-center justify-center">
      <NodeResizer isVisible={selected} minWidth={60} minHeight={40} color="var(--color-copy-muted)" lineClassName="!border-copy-muted" />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: "none" }}>
        <polygon points="50,5 95,50 50,95 5,50" fill="var(--color-surface)" stroke={stroke} strokeWidth="2" />
      </svg>
      <Handle type="target" position={Position.Top} />
      <EditableLabel id={id} label={data.label} className="relative z-10 text-copy-primary text-sm text-center px-2" />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function CircleNode({ id, data, selected }: NodeComponentProps) {
  return (
    <div className="h-full relative rounded-full bg-surface border-2 flex items-center justify-center px-3"
      style={{ borderColor: selected ? "var(--color-brand)" : "var(--color-copy-secondary)" }}>
      <NodeResizer isVisible={selected} minWidth={60} minHeight={40} color="var(--color-copy-muted)" lineClassName="!border-copy-muted" />
      <Handle type="target" position={Position.Top} />
      <EditableLabel id={id} label={data.label} className="text-copy-primary text-sm text-center" />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function PillNode({ id, data, selected }: NodeComponentProps) {
  return (
    <div className="h-full relative rounded-full bg-surface border-2 flex items-center justify-center px-5"
      style={{ borderColor: selected ? "var(--color-brand)" : "var(--color-copy-secondary)" }}>
      <NodeResizer isVisible={selected} minWidth={60} minHeight={40} color="var(--color-copy-muted)" lineClassName="!border-copy-muted" />
      <Handle type="target" position={Position.Top} />
      <EditableLabel id={id} label={data.label} className="text-copy-primary text-sm text-center" />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function CylinderNode({ id, data, selected }: NodeComponentProps) {
  const stroke = selected ? "var(--color-brand)" : "var(--color-copy-secondary)"
  return (
    <div className="h-full relative flex items-center justify-center">
      <NodeResizer isVisible={selected} minWidth={60} minHeight={40} color="var(--color-copy-muted)" lineClassName="!border-copy-muted" />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: "none" }}>
        <rect x="10" y="15" width="80" height="70" fill="var(--color-surface)" />
        <ellipse cx="50" cy="85" rx="40" ry="10" fill="var(--color-surface)" stroke={stroke} strokeWidth="2" />
        <ellipse cx="50" cy="15" rx="40" ry="10" fill="var(--color-surface)" stroke={stroke} strokeWidth="2" />
        <line x1="10" y1="15" x2="10" y2="85" stroke={stroke} strokeWidth="2" />
        <line x1="90" y1="15" x2="90" y2="85" stroke={stroke} strokeWidth="2" />
      </svg>
      <Handle type="target" position={Position.Top} />
      <EditableLabel id={id} label={data.label} className="relative z-10 text-copy-primary text-sm text-center px-2" />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function HexagonNode({ id, data, selected }: NodeComponentProps) {
  const stroke = selected ? "var(--color-brand)" : "var(--color-copy-secondary)"
  return (
    <div className="h-full relative flex items-center justify-center">
      <NodeResizer isVisible={selected} minWidth={60} minHeight={40} color="var(--color-copy-muted)" lineClassName="!border-copy-muted" />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: "none" }}>
        <polygon points="25,5 75,5 95,50 75,95 25,95 5,50" fill="var(--color-surface)" stroke={stroke} strokeWidth="2" />
      </svg>
      <Handle type="target" position={Position.Top} />
      <EditableLabel id={id} label={data.label} className="relative z-10 text-copy-primary text-sm text-center px-2" />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function CanvasNode({ id, data, selected }: { id: string; data: CanvasNodeData; selected?: boolean }) {
  switch (data.shape) {
    case "diamond":
      return <DiamondNode id={id} data={data} selected={selected} />
    case "circle":
      return <CircleNode id={id} data={data} selected={selected} />
    case "pill":
      return <PillNode id={id} data={data} selected={selected} />
    case "cylinder":
      return <CylinderNode id={id} data={data} selected={selected} />
    case "hexagon":
      return <HexagonNode id={id} data={data} selected={selected} />
    default:
      return <RectangleNode id={id} data={data} selected={selected} />
  }
}

const nodeTypes = { canvasNode: CanvasNode }

function FlowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useLiveblocksFlow({ suspense: true })
  const reactFlow = useReactFlow()
  const counterRef = useRef(0)

  const updateNodeLabel = useCallback(
    (id: string, label: string) => {
      const node = reactFlow.getNode(id)
      if (node) {
        onNodesChange([{ type: "replace", id, item: { ...node, data: { ...node.data, label } } }])
      }
    },
    [reactFlow, onNodesChange],
  )

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
    <NodeEditContext.Provider value={{ updateNodeLabel }}>
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
      <Cursors />
      <ShapePanel />
    </ReactFlow>
    </NodeEditContext.Provider>
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
          initialStorage={{
            flow: new LiveObject({ nodes: new LiveMap(), edges: new LiveMap() }),
          }}
        >
          <ClientSideSuspense fallback={<Loading />}>
            <CanvasInner />
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </ErrorBoundary>
  )
}
