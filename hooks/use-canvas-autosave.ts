"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Node, Edge } from "@xyflow/react"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

export function useCanvasAutosave(
  projectId: string,
  nodes: Node[],
  edges: Edge[],
) {
  const [status, setStatus] = useState<SaveStatus>("idle")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)
  const skipInitialRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const doSave = useCallback(
    async (nodes: Node[], edges: Edge[]) => {
      setStatus("saving")
      try {
        const res = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes, edges }),
        })
        if (!res.ok) {
          throw new Error(`Save failed: ${res.status}`)
        }
        if (mountedRef.current) {
          setStatus("saved")
        }
      } catch {
        if (mountedRef.current) {
          setStatus("error")
        }
      }
    },
    [projectId],
  )

  useEffect(() => {
    if (skipInitialRef.current) {
      skipInitialRef.current = false
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      doSave(nodes, edges)
    }, 2000)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [nodes.length, edges.length, nodes, edges, doSave])

  const saveNow = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    doSave(nodes, edges)
  }, [nodes, edges, doSave])

  return { status, saveNow }
}
