"use client"

import { Component, type ReactNode, useCallback, useRef, useState, useEffect, createContext, useContext } from "react"
import { LiveObject, LiveMap } from "@liveblocks/core"
import { LiveblocksProvider, RoomProvider, ClientSideSuspense, useHistory, useUpdateMyPresence, useOthers } from "@liveblocks/react"
import { UserButton } from "@clerk/nextjs"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { LiveCursors } from "./live-cursors"
import "@liveblocks/react-flow/styles.css"
import { ReactFlow, ReactFlowProvider, Background, MiniMap, BackgroundVariant, useReactFlow, useStore, Handle, Position, NodeResizer, BaseEdge, getSmoothStepPath, EdgeLabelRenderer, Panel, type Node, type Edge, type EdgeProps } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { ShapePanel, getShapePayload } from "./shape-panel"
import { CollaboratorAvatars } from "./collaborator-avatars"
import type { CanvasNodeData, CanvasNode, CanvasEdge } from "@/types/canvas"
import { NODE_COLORS } from "@/types/canvas"
import type { CanvasTemplate } from "./starter-templates"
import { ZoomIn, ZoomOut, Maximize, Undo, Redo, Cloud, CloudOff, LoaderIcon } from "lucide-react"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useCanvasAutosave } from "@/hooks/use-canvas-autosave"

const NodeEditContext = createContext<{
  updateNodeLabel: (id: string, label: string) => void
  updateNodeColor: (id: string, color: string, textColor: string) => void
  updateEdgeLabel: (id: string, label: string) => void
}>({ updateNodeLabel: () => {}, updateNodeColor: () => {}, updateEdgeLabel: () => {} })

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
        className="nodrag nowheel !absolute !inset-0 resize-none bg-transparent text-sm text-center outline-none border-0 overflow-hidden leading-tight w-full h-full px-2 py-1"
        style={{ color: "inherit" }}
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

const HANDLE_STYLE: React.CSSProperties = { width: 8, height: 8, background: "#fff", border: "1.5px solid #18181c" }

function RectangleNode({ id, data, selected }: NodeComponentProps) {
  return (
    <div className="h-full relative border-2 rounded-md flex items-center justify-center px-3"
      style={{ borderColor: selected ? "var(--color-brand)" : "var(--color-copy-secondary)", backgroundColor: data.color, color: data.textColor }}>
      <NodeResizer isVisible={selected} minWidth={60} minHeight={40} color="var(--color-copy-muted)" lineClassName="!border-copy-muted" />
      <Handle id="top" type="target" position={Position.Top} style={HANDLE_STYLE} />
      <Handle id="left" type="target" position={Position.Left} style={HANDLE_STYLE} />
      <EditableLabel id={id} label={data.label} className="text-sm text-center" />
      <Handle id="right" type="source" position={Position.Right} style={HANDLE_STYLE} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={HANDLE_STYLE} />
    </div>
  )
}

function DiamondNode({ id, data, selected }: NodeComponentProps) {
  const stroke = selected ? "var(--color-brand)" : "var(--color-copy-secondary)"
  return (
    <div className="h-full relative flex items-center justify-center" style={{ color: data.textColor }}>
      <NodeResizer isVisible={selected} minWidth={60} minHeight={40} color="var(--color-copy-muted)" lineClassName="!border-copy-muted" />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: "none" }}>
        <polygon points="50,5 95,50 50,95 5,50" fill={data.color} stroke={stroke} strokeWidth="2" />
      </svg>
      <Handle id="top" type="target" position={Position.Top} style={HANDLE_STYLE} />
      <Handle id="left" type="target" position={Position.Left} style={HANDLE_STYLE} />
      <EditableLabel id={id} label={data.label} className="relative z-10 text-sm text-center px-2" />
      <Handle id="right" type="source" position={Position.Right} style={HANDLE_STYLE} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={HANDLE_STYLE} />
    </div>
  )
}

function CircleNode({ id, data, selected }: NodeComponentProps) {
  return (
    <div className="h-full relative rounded-full border-2 flex items-center justify-center px-3"
      style={{ borderColor: selected ? "var(--color-brand)" : "var(--color-copy-secondary)", backgroundColor: data.color, color: data.textColor }}>
      <NodeResizer isVisible={selected} minWidth={60} minHeight={40} color="var(--color-copy-muted)" lineClassName="!border-copy-muted" />
      <Handle id="top" type="target" position={Position.Top} style={HANDLE_STYLE} />
      <Handle id="left" type="target" position={Position.Left} style={HANDLE_STYLE} />
      <EditableLabel id={id} label={data.label} className="text-sm text-center" />
      <Handle id="right" type="source" position={Position.Right} style={HANDLE_STYLE} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={HANDLE_STYLE} />
    </div>
  )
}

function PillNode({ id, data, selected }: NodeComponentProps) {
  return (
    <div className="h-full relative rounded-full border-2 flex items-center justify-center px-5"
      style={{ borderColor: selected ? "var(--color-brand)" : "var(--color-copy-secondary)", backgroundColor: data.color, color: data.textColor }}>
      <NodeResizer isVisible={selected} minWidth={60} minHeight={40} color="var(--color-copy-muted)" lineClassName="!border-copy-muted" />
      <Handle id="top" type="target" position={Position.Top} style={HANDLE_STYLE} />
      <Handle id="left" type="target" position={Position.Left} style={HANDLE_STYLE} />
      <EditableLabel id={id} label={data.label} className="text-sm text-center" />
      <Handle id="right" type="source" position={Position.Right} style={HANDLE_STYLE} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={HANDLE_STYLE} />
    </div>
  )
}

function CylinderNode({ id, data, selected }: NodeComponentProps) {
  const stroke = selected ? "var(--color-brand)" : "var(--color-copy-secondary)"
  return (
    <div className="h-full relative flex items-center justify-center" style={{ color: data.textColor }}>
      <NodeResizer isVisible={selected} minWidth={60} minHeight={40} color="var(--color-copy-muted)" lineClassName="!border-copy-muted" />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: "none" }}>
        <rect x="10" y="15" width="80" height="70" fill={data.color} />
        <ellipse cx="50" cy="85" rx="40" ry="10" fill={data.color} stroke={stroke} strokeWidth="2" />
        <ellipse cx="50" cy="15" rx="40" ry="10" fill={data.color} stroke={stroke} strokeWidth="2" />
        <line x1="10" y1="15" x2="10" y2="85" stroke={stroke} strokeWidth="2" />
        <line x1="90" y1="15" x2="90" y2="85" stroke={stroke} strokeWidth="2" />
      </svg>
      <Handle id="top" type="target" position={Position.Top} style={HANDLE_STYLE} />
      <Handle id="left" type="target" position={Position.Left} style={HANDLE_STYLE} />
      <EditableLabel id={id} label={data.label} className="relative z-10 text-sm text-center px-2" />
      <Handle id="right" type="source" position={Position.Right} style={HANDLE_STYLE} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={HANDLE_STYLE} />
    </div>
  )
}

function HexagonNode({ id, data, selected }: NodeComponentProps) {
  const stroke = selected ? "var(--color-brand)" : "var(--color-copy-secondary)"
  return (
    <div className="h-full relative flex items-center justify-center" style={{ color: data.textColor }}>
      <NodeResizer isVisible={selected} minWidth={60} minHeight={40} color="var(--color-copy-muted)" lineClassName="!border-copy-muted" />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: "none" }}>
        <polygon points="25,5 75,5 95,50 75,95 25,95 5,50" fill={data.color} stroke={stroke} strokeWidth="2" />
      </svg>
      <Handle id="top" type="target" position={Position.Top} style={HANDLE_STYLE} />
      <Handle id="left" type="target" position={Position.Left} style={HANDLE_STYLE} />
      <EditableLabel id={id} label={data.label} className="relative z-10 text-sm text-center px-2" />
      <Handle id="right" type="source" position={Position.Right} style={HANDLE_STYLE} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={HANDLE_STYLE} />
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

function CanvasEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: EdgeProps<CanvasEdge>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(data?.label ?? "")
  const { updateEdgeLabel } = useContext(NodeEditContext)

  useEffect(() => {
    if (!editing) {
      setValue(data?.label ?? "")
    }
  }, [data?.label, editing])

  const startEditing = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setValue(data?.label ?? "")
    setEditing(true)
  }, [data?.label])

  const save = useCallback(() => {
    const trimmed = value.trim()
    if (trimmed !== (data?.label ?? "")) {
      updateEdgeLabel(id, trimmed)
    }
    setEditing(false)
  }, [id, value, data?.label, updateEdgeLabel])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      save()
    } else if (e.key === "Escape") {
      setValue(data?.label ?? "")
      setEditing(false)
    }
  }, [save, data?.label])

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        interactionWidth={20}
        markerEnd={selected ? "url(#arrow-selected)" : "url(#arrow)"}
        style={{
          stroke: selected ? "var(--color-brand)" : "var(--color-copy-muted)",
          strokeWidth: 1.5,
          transition: "stroke 150ms",
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nowheel absolute flex items-center justify-center"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {editing ? (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={save}
              onKeyDown={handleKeyDown}
              autoFocus
              size={value.length || 1}
              className="nodrag nowheel rounded border border-border-default bg-elevated px-1.5 py-0.5 text-xs text-center text-copy-primary outline-none"
            />
          ) : (
            <div
              onDoubleClick={startEditing}
              className="cursor-pointer rounded-full border border-border-default bg-elevated px-2 py-0.5 text-xs leading-tight transition-colors"
              style={{
                color: selected ? "var(--color-copy-primary)" : "var(--color-copy-muted)",
                borderColor: selected ? "var(--color-brand)" : "var(--color-border-default)",
              }}
            >
              {data?.label || (
                <span className="text-copy-faint select-none">Label</span>
              )}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

const edgeTypes = { canvasEdge: CanvasEdgeComponent }

function ColorToolbar() {
  const { updateNodeColor } = useContext(NodeEditContext)
  const selectedNode = useStore(
    useCallback((s) => {
      const n = s.nodes.find(n => n.selected)
      if (!n?.width || !n?.height) return null
      return n
    }, []),
  )
  const transform = useStore(useCallback((s) => s.transform, []))

  if (!selectedNode) return null

  const [tx, ty, zoom] = transform
  const cx = (selectedNode.position.x + selectedNode.width! / 2) * zoom + tx
  const cy = selectedNode.position.y * zoom + ty
  const currentFill = selectedNode.data.color

  const TOOLBAR_HEIGHT = 36
  const GAP = 10
  const TOOLBAR_WIDTH = 196

  return (
    <div
      className="nodrag nowheel absolute z-50 flex items-center gap-1 rounded-lg border border-border-default bg-elevated px-2 py-1.5 shadow-lg"
      style={{
        left: cx - TOOLBAR_WIDTH / 2,
        top: cy - TOOLBAR_HEIGHT - GAP,
      }}
    >
      {NODE_COLORS.map(({ fill, text, label }) => (
        <button
          key={fill}
          title={label}
          onClick={() => updateNodeColor(selectedNode.id, fill, text)}
          className="h-5 w-5 rounded-full transition-all duration-100"
          style={{
            backgroundColor: fill,
            outline: currentFill === fill ? `2px solid ${text}` : undefined,
            outlineOffset: 2,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 0 6px 1px ${text}`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none"
          }}
        />
      ))}
    </div>
  )
}

function FlowCanvas({ projectId, onRegister }: { projectId: string; onRegister?: (fn: ((template: CanvasTemplate) => void) | null) => void }) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true })
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>()
  const counterRef = useRef(0)
  const { undo, redo, canUndo, canRedo } = useHistory()
  const { status, saveNow } = useCanvasAutosave(projectId, nodes, edges)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    if (nodes.length > 0 || edges.length > 0) {
      loadedRef.current = true
      return
    }

    const loadSaved = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/canvas`)
        if (!res.ok) {
          loadedRef.current = true
          return
        }
        const data = await res.json()
        if (data.nodes?.length || data.edges?.length) {
          if (data.nodes?.length) {
            onNodesChange(data.nodes.map((n: Node) => ({ type: "add" as const, item: n })))
          }
          if (data.edges?.length) {
            onEdgesChange(data.edges.map((e: Edge) => ({ type: "add" as const, item: e })))
          }
          window.requestAnimationFrame(() => {
            reactFlow.fitView({ duration: 200 })
          })
        }
      } catch {
        // silent — room has no saved state
      }
      loadedRef.current = true
    }

    loadSaved()
  }, [])

  const zoomIn = useCallback(() => reactFlow.zoomIn({ duration: 200 }), [reactFlow])
  const zoomOut = useCallback(() => reactFlow.zoomOut({ duration: 200 }), [reactFlow])
  const fitView = useCallback(() => reactFlow.fitView({ duration: 200 }), [reactFlow])

  const deleteSelected = useCallback(() => {
    const nodesToDelete = reactFlow.getNodes().filter(n => n.selected)
    const edgesToDelete = reactFlow.getEdges().filter(e => e.selected)
    if (nodesToDelete.length > 0 || edgesToDelete.length > 0) {
      onDelete({ nodes: nodesToDelete, edges: edgesToDelete })
    }
  }, [reactFlow, onDelete])

  useKeyboardShortcuts({ zoomIn, zoomOut, undo, redo, deleteSelected })

  const updateMyPresence = useUpdateMyPresence()
  const cursorRef = useRef<number | null>(null)

  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (cursorRef.current != null) return
      cursorRef.current = window.requestAnimationFrame(() => {
        cursorRef.current = null
        const pos = reactFlow.screenToFlowPosition({ x: e.clientX, y: e.clientY })
        updateMyPresence({ cursor: { x: pos.x, y: pos.y } })
      })
    },
    [reactFlow, updateMyPresence],
  )

  const onMouseLeave: React.MouseEventHandler<HTMLDivElement> = useCallback(() => {
    if (cursorRef.current != null) {
      window.cancelAnimationFrame(cursorRef.current)
      cursorRef.current = null
    }
    updateMyPresence({ cursor: null })
  }, [updateMyPresence])

  const updateNodeLabel = useCallback(
    (id: string, label: string) => {
      const node = reactFlow.getNode(id)
      if (node) {
        onNodesChange([{ type: "replace", id, item: { ...node, data: { ...node.data, label } } }])
      }
    },
    [reactFlow, onNodesChange],
  )

  const updateNodeColor = useCallback(
    (id: string, color: string, textColor: string) => {
      const node = reactFlow.getNode(id)
      if (node) {
        onNodesChange([{ type: "replace", id, item: { ...node, data: { ...node.data, color, textColor } } }])
      }
    },
    [reactFlow, onNodesChange],
  )

  const updateEdgeLabel = useCallback(
    (id: string, label: string) => {
      const edge = reactFlow.getEdge(id)
      if (edge) {
        onEdgesChange([{ type: "replace", id, item: { ...edge, type: "canvasEdge", data: { ...edge.data, label } } }])
      }
    },
    [reactFlow, onEdgesChange],
  )

  const importTemplate = useCallback(
    (template: CanvasTemplate) => {
      const currentNodes = reactFlow.getNodes()
      const currentEdges = reactFlow.getEdges()
      if (currentNodes.length > 0) {
        onNodesChange(currentNodes.map(n => ({ type: "remove" as const, id: n.id })))
      }
      if (currentEdges.length > 0) {
        onEdgesChange(currentEdges.map(e => ({ type: "remove" as const, id: e.id })))
      }
      onNodesChange(
        template.nodes.map(n => ({ type: "add" as const, item: n }))
      )
      onEdgesChange(
        template.edges.map(e => ({ type: "add" as const, item: e }))
      )
      window.requestAnimationFrame(() => {
        reactFlow.fitView({ duration: 200 })
      })
    },
    [reactFlow, onNodesChange, onEdgesChange],
  )

  useEffect(() => {
    onRegister?.(importTemplate)
    return () => onRegister?.(null)
  }, [importTemplate, onRegister])

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
          color: "#1F1F1F",
          textColor: "#EDEDED",
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
    <NodeEditContext.Provider value={{ updateNodeLabel, updateNodeColor, updateEdgeLabel }}>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDelete={onDelete}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      isValidConnection={() => true}
      fitView
      colorMode="dark"
      defaultEdgeOptions={{ type: "canvasEdge", data: {} }}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
    >
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-copy-muted)" />
          </marker>
          <marker id="arrow-selected" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-brand)" />
          </marker>
        </defs>
      </svg>
      <style>{`
        .react-flow__handle { opacity: 0; transition: opacity 150ms; }
        .react-flow__node:hover .react-flow__handle,
        .react-flow__node.selected .react-flow__handle { opacity: 1; }
      `}</style>
      <Panel position="bottom-center" style={{ bottom: 56 }}>
        <div className="flex items-center gap-1 rounded-full border border-border-default bg-surface px-2 py-1.5 shadow-lg">
          <span
            className="flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-full"
            style={{
              color:
                status === "idle" ? "var(--color-copy-muted)" :
                status === "saving" ? "var(--color-state-warning)" :
                status === "saved" ? "var(--color-state-success)" :
                "var(--color-state-error)",
            }}
          >
            {status === "saving" && <LoaderIcon className="h-3 w-3 animate-spin" />}
            {status === "saved" && <Cloud className="h-3 w-3" />}
            {status === "error" && <CloudOff className="h-3 w-3" />}
            {status === "idle" && <Cloud className="h-3 w-3 opacity-50" />}
            <span className="text-[10px] font-medium mr-0.5">{status}</span>
            <button
              onClick={saveNow}
              title="Save now"
              className="flex items-center justify-center rounded-full p-0.5 text-copy-muted transition-colors hover:text-copy-primary"
            >
              <Cloud className="h-2.5 w-2.5" />
            </button>
          </span>
          <div className="mx-1 h-4 w-px bg-border-default" />
          <button
            onClick={zoomOut}
            title="Zoom out"
            className="flex items-center justify-center rounded-full p-1.5 text-copy-secondary transition-colors hover:bg-subtle hover:text-copy-primary"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={fitView}
            title="Fit view"
            className="flex items-center justify-center rounded-full p-1.5 text-copy-secondary transition-colors hover:bg-subtle hover:text-copy-primary"
          >
            <Maximize className="h-4 w-4" />
          </button>
          <button
            onClick={zoomIn}
            title="Zoom in"
            className="flex items-center justify-center rounded-full p-1.5 text-copy-secondary transition-colors hover:bg-subtle hover:text-copy-primary"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="mx-1 h-4 w-px bg-border-default" />
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo"
            className="flex items-center justify-center rounded-full p-1.5 text-copy-secondary transition-colors hover:bg-subtle hover:text-copy-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-copy-secondary"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo"
            className="flex items-center justify-center rounded-full p-1.5 text-copy-secondary transition-colors hover:bg-subtle hover:text-copy-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-copy-secondary"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>
      </Panel>
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
      <MiniMap
        position="bottom-left"
        style={{ background: "var(--color-surface)" }}
      />
      <LiveCursors />
      <ColorToolbar />
      <Panel position="top-right" className="!mt-2 !mr-2">
        <div className="flex items-center">
          <CollaboratorAvatars />
          <UserButton />
        </div>
      </Panel>
      <ShapePanel />
    </ReactFlow>
    </NodeEditContext.Provider>
  )
}

function CanvasInner({ projectId, onRegister }: { projectId: string; onRegister?: (fn: ((template: CanvasTemplate) => void) | null) => void }) {
  return (
    <div className="flex-1">
      <ReactFlowProvider>
        <FlowCanvas projectId={projectId} onRegister={onRegister} />
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
  projectId: string
  onRegisterImportTemplate?: (fn: ((template: CanvasTemplate) => void) | null) => void
}

export function Canvas({ roomId, projectId, onRegisterImportTemplate }: CanvasProps) {
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
            <CanvasInner projectId={projectId} onRegister={onRegisterImportTemplate} />
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </ErrorBoundary>
  )
}
