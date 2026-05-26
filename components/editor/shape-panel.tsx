"use client";

import { Square, Diamond, Circle, Pill, Cylinder, Hexagon, type LucideIcon } from "lucide-react"
import { Panel } from "@xyflow/react"

interface ShapeItem {
  shape: string
  label: string
  icon: LucideIcon
  width: number
  height: number
}

const SHAPES: ShapeItem[] = [
  { shape: "rectangle", label: "Rectangle", icon: Square, width: 160, height: 80 },
  { shape: "diamond", label: "Diamond", icon: Diamond, width: 120, height: 120 },
  { shape: "circle", label: "Circle", icon: Circle, width: 100, height: 100 },
  { shape: "pill", label: "Pill", icon: Pill, width: 160, height: 80 },
  { shape: "cylinder", label: "Cylinder", icon: Cylinder, width: 120, height: 100 },
  { shape: "hexagon", label: "Hexagon", icon: Hexagon, width: 120, height: 100 },
]

const SHAPE_DRAG_TYPE = "application/x-canvas-shape"

interface DragPayload {
  shape: string
  width: number
  height: number
}

export function getShapePayload(data: DataTransfer): DragPayload | null {
  const raw = data.getData(SHAPE_DRAG_TYPE)
  if (!raw) return null
  try {
    return JSON.parse(raw) as DragPayload
  } catch {
    return null
  }
}

function createDragGhost(shape: string, width: number, height: number): HTMLElement {
  const el = document.createElement("div")
  el.style.cssText = `width:${width}px;height:${height}px;position:fixed;top:-9999px;left:-9999px;pointer-events:none;`

  const stroke = "var(--color-copy-secondary)"
  const fill = "var(--color-surface)"
  const S = 100
  const i = 2

  if (shape === "rectangle") {
    el.style.cssText += `border:2px solid ${stroke};border-radius:6px;background:${fill};`
  } else if (shape === "circle") {
    el.style.cssText += `border:2px solid ${stroke};border-radius:999px;background:${fill};`
  } else if (shape === "pill") {
    el.style.cssText += `border:2px solid ${stroke};border-radius:999px;background:${fill};`
  } else if (shape === "diamond") {
    el.innerHTML = `<svg viewBox="0 0 ${S} ${S}" style="width:100%;height:100%"><polygon points="50,${i} ${S-i},50 50,${S-i} ${i},50" fill="${fill}" stroke="${stroke}" stroke-width="2"/></svg>`
  } else if (shape === "hexagon") {
    el.innerHTML = `<svg viewBox="0 0 ${S} ${S}" style="width:100%;height:100%"><polygon points="25,${i} 75,${i} ${S-i},50 75,${S-i} 25,${S-i} ${i},50" fill="${fill}" stroke="${stroke}" stroke-width="2"/></svg>`
  } else if (shape === "cylinder") {
    el.innerHTML = `<svg viewBox="0 0 ${S} ${S}" style="width:100%;height:100%"><rect x="10" y="15" width="80" height="70" fill="${fill}"/><ellipse cx="50" cy="85" rx="40" ry="10" fill="${fill}" stroke="${stroke}" stroke-width="2"/><ellipse cx="50" cy="15" rx="40" ry="10" fill="${fill}" stroke="${stroke}" stroke-width="2"/><line x1="10" y1="15" x2="10" y2="85" stroke="${stroke}" stroke-width="2"/><line x1="90" y1="15" x2="90" y2="85" stroke="${stroke}" stroke-width="2"/></svg>`
  }

  return el
}

export function ShapePanel() {
  return (
    <Panel position="bottom-center">
      <div className="flex items-center gap-1 rounded-full border border-border-default bg-surface px-2 py-1.5 shadow-lg">
        {SHAPES.map(({ shape, label, icon: Icon, width, height }) => (
          <button
            key={shape}
            draggable
            title={label}
            onDragStart={(e) => {
              e.dataTransfer.setData(
                SHAPE_DRAG_TYPE,
                JSON.stringify({ shape, width, height }),
              )
              e.dataTransfer.effectAllowed = "copy"

              const ghost = createDragGhost(shape, width, height)
              document.body.appendChild(ghost)
              e.dataTransfer.setDragImage(ghost, width / 2, height / 2)
              requestAnimationFrame(() => document.body.removeChild(ghost))
            }}
            className="flex items-center justify-center rounded-full p-2 text-copy-secondary hover:text-copy-primary hover:bg-subtle transition-colors"
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>
    </Panel>
  )
}
