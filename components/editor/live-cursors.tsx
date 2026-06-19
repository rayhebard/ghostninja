"use client"

import { useOthersConnectionIds, useOther } from "@liveblocks/react/suspense"
import { useReactFlow } from "@xyflow/react"

function CursorPointer({
  connectionId,
}: {
  connectionId: number
}) {
  const other = useOther(connectionId, (other) => ({
    cursor: other.presence.cursor,
    name: other.info?.name || "Anonymous",
    color: other.info?.color || "#666",
    thinking: other.presence.isThinking,
  }))
  const reactFlow = useReactFlow()

  if (!other.cursor) return null

  const { x, y } = other.cursor
  const flowPosition = reactFlow.flowToScreenPosition({ x, y })
  
  const color = other.color
  const name = other.name

  return (
    <div
      style={{
        position: "fixed",
        left: `${flowPosition.x}px`,
        top: `${flowPosition.y}px`,
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {/* Colored pointer */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        style={{
          filter: `drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))`,
        }}
      >
        <path
          d="M 2 2 L 2 16 L 5 13 L 8 20 L 11 19 L 8 12 L 13 12 Z"
          fill={color}
          stroke="white"
          strokeWidth="0.5"
        />
      </svg>

      {/* Name badge */}
      <div
        style={{
          position: "absolute",
          top: "18px",
          left: "8px",
          backgroundColor: color,
          color: "white",
          padding: "2px 6px",
          borderRadius: "3px",
          fontSize: "11px",
          fontWeight: "600",
          whiteSpace: "nowrap",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {other.thinking && (
          <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        )}
        {name}
      </div>
    </div>
  )
}

export function LiveCursors() {
  const connectionIds = useOthersConnectionIds()

  return (
    <>
      {connectionIds.map((connectionId) => (
        <CursorPointer key={connectionId} connectionId={connectionId} />
      ))}
    </>
  )
}
