"use client"

import { useEffect } from "react"

interface KeyboardShortcutsParams {
  zoomIn: () => void
  zoomOut: () => void
  undo: () => void
  redo: () => void
  deleteSelected: () => void
}

export function useKeyboardShortcuts({ zoomIn, zoomOut, undo, redo, deleteSelected }: KeyboardShortcutsParams) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      const mod = e.metaKey || e.ctrlKey

      if (e.key === "+" || e.key === "=") {
        e.preventDefault()
        zoomIn()
        return
      }

      if (e.key === "-") {
        e.preventDefault()
        zoomOut()
        return
      }

      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      if ((mod && e.key === "z" && e.shiftKey) || (mod && e.key === "y")) {
        e.preventDefault()
        redo()
        return
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        deleteSelected()
        return
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [zoomIn, zoomOut, undo, redo, deleteSelected])
}
