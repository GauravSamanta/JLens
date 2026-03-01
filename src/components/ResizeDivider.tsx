import { useCallback, useRef } from 'react'
import { useUIStore } from '../stores/uiStore'

export function ResizeDivider() {
  const isDark = useUIStore((s) => s.theme) === 'dark'
  const setEditorHeight = useUIStore((s) => s.setEditorHeight)
  const dragging = useRef(false)
  const startY = useRef(0)
  const startHeight = useRef(0)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    dragging.current = true
    startY.current = e.clientY
    startHeight.current = useUIStore.getState().editorHeight

    const handlePointerMove = (ev: PointerEvent) => {
      if (!dragging.current) return
      const delta = ev.clientY - startY.current
      const maxHeight = window.innerHeight * 0.7
      const newHeight = Math.max(100, Math.min(maxHeight, startHeight.current + delta))
      setEditorHeight(newHeight)
    }

    const handlePointerUp = () => {
      dragging.current = false
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
  }, [setEditorHeight])

  return (
    <div
      onPointerDown={handlePointerDown}
      className={`h-1 cursor-row-resize flex-shrink-0 transition-colors duration-75 ${
        isDark
          ? 'bg-border hover:bg-accent-blue/30'
          : 'bg-border-light hover:bg-blue-300/30'
      }`}
    />
  )
}
