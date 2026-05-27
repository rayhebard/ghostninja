"use client"

import { useCallback, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { CANVAS_TEMPLATES, getTemplateBounds, type CanvasTemplate } from "./starter-templates"
import type { CanvasNode } from "@/types/canvas"

interface StarterTemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (template: CanvasTemplate) => void
}

const PREVIEW_W = 280
const PREVIEW_H = 160
const PADDING = 16

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const bounds = useMemo(() => getTemplateBounds(template.nodes), [template.nodes])

  const scale = useMemo(() => {
    const sx = (PREVIEW_W - PADDING * 2) / bounds.width
    const sy = (PREVIEW_H - PADDING * 2) / bounds.height
    return Math.min(sx, sy, 1)
  }, [bounds])

  const offsetX = useMemo(
    () => (PREVIEW_W - (bounds.width * scale)) / 2 - bounds.x * scale,
    [bounds, scale],
  )
  const offsetY = useMemo(
    () => (PREVIEW_H - (bounds.height * scale)) / 2 - bounds.y * scale,
    [bounds, scale],
  )

  function centerOf(n: CanvasNode): { cx: number; cy: number } {
    const w = n.width ?? 120
    const h = n.height ?? 60
    return {
      cx: (n.position.x + w / 2) * scale + offsetX,
      cy: (n.position.y + h / 2) * scale + offsetY,
    }
  }

  return (
    <svg
      viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`}
      className="w-full rounded border border-border-default bg-base"
      style={{ aspectRatio: `${PREVIEW_W} / ${PREVIEW_H}` }}
    >
      <title>{template.name} preview</title>
      {/* Edges */}
      {template.edges.map((e) => {
        const src = template.nodes.find((n) => n.id === e.source)
        const tgt = template.nodes.find((n) => n.id === e.target)
        if (!src || !tgt) return null
        const { cx: x1, cy: y1 } = centerOf(src)
        const { cx: x2, cy: y2 } = centerOf(tgt)
        return (
          <line
            key={e.id}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--color-copy-muted)"
            strokeWidth={1.5}
          />
        )
      })}
      {/* Nodes */}
      {template.nodes.map((n) => {
        const w = (n.width ?? 120) * scale
        const h = (n.height ?? 60) * scale
        const x = n.position.x * scale + offsetX
        const y = n.position.y * scale + offsetY
        const rx = 4
        const fill = n.data.color
        const shape = n.data.shape

        return (
          <g key={n.id}>
            {shape === "circle" && (
              <circle cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) / 2} fill={fill} />
            )}
            {shape === "pill" && (
              <rect x={x} y={y} width={w} height={h} rx={h / 2} ry={h / 2} fill={fill} />
            )}
            {shape === "diamond" && (
              <polygon
                points={`${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`}
                fill={fill}
              />
            )}
            {shape === "hexagon" && (
              <polygon
                points={`${x + w * 0.25},${y} ${x + w * 0.75},${y} ${x + w},${y + h / 2} ${x + w * 0.75},${y + h} ${x + w * 0.25},${y + h} ${x},${y + h / 2}`}
                fill={fill}
              />
            )}
            {shape === "cylinder" && (
              <g>
                <rect x={x} y={y + h * 0.15} width={w} height={h * 0.7} fill={fill} />
                <ellipse cx={x + w / 2} cy={y + h * 0.15} rx={w / 2} ry={h * 0.12} fill={fill} />
                <ellipse cx={x + w / 2} cy={y + h * 0.85} rx={w / 2} ry={h * 0.12} fill={fill} />
              </g>
            )}
            {(shape === "rectangle" || (shape !== "circle" && shape !== "pill" && shape !== "diamond" && shape !== "hexagon" && shape !== "cylinder")) && (
              <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} />
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function StarterTemplateModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplateModalProps) {
  const handleImport = useCallback(
    (template: CanvasTemplate) => {
      onImport(template)
      onOpenChange(false)
    },
    [onImport, onOpenChange],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Starter Templates</DialogTitle>
          <DialogDescription>
            Choose a pre-built diagram to replace the current canvas.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CANVAS_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="flex flex-col gap-2 rounded-lg border border-border-default bg-surface p-3"
              >
                <TemplatePreview template={template} />
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-semibold text-copy-primary">
                    {template.name}
                  </h3>
                  <p className="text-xs text-copy-muted leading-relaxed">
                    {template.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleImport(template)}
                >
                  Import
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
