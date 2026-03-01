import { useMemo, useRef, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { useJsonStore } from '../stores/jsonStore'
import { useUIStore } from '../stores/uiStore'
import type { ParseResult } from '../core/types'

function buildBreadcrumbs(nodeId: string, parseResult: ParseResult): { id: string; label: string }[] {
  const segments: { id: string; label: string }[] = []
  let current: string | null = nodeId

  while (current) {
    const node = parseResult.nodes.get(current)
    if (!node) break
    segments.unshift({ id: current, label: node.key })
    current = node.parentId
  }

  return segments
}

export function Breadcrumbs() {
  const parseResult = useJsonStore((s) => s.parseResult)
  const selectedNodeId = useJsonStore((s) => s.selectedNodeId)
  const selectNode = useJsonStore((s) => s.selectNode)
  const expandToNode = useJsonStore((s) => s.expandToNode)
  const isDark = useUIStore((s) => s.theme) === 'dark'
  const scrollRef = useRef<HTMLDivElement>(null)

  const segments = useMemo(() => {
    if (!parseResult || !selectedNodeId) return []
    return buildBreadcrumbs(selectedNodeId, parseResult)
  }, [parseResult, selectedNodeId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [segments])

  if (segments.length === 0) return null

  const handleClick = (nodeId: string) => {
    expandToNode(nodeId)
    selectNode(nodeId)
  }

  return (
    <div
      ref={scrollRef}
      className="flex items-center gap-0.5 overflow-x-auto scrollbar-none min-w-0 flex-1 mask-fade-left"
    >
      {segments.map((seg, i) => (
        <span key={seg.id} className="flex items-center gap-0.5 shrink-0">
          {i > 0 && (
            <ChevronRight
              size={10}
              className={isDark ? 'text-subtle' : 'text-gray-300'}
            />
          )}
          <button
            onClick={() => handleClick(seg.id)}
            className={`font-mono text-[11px] px-1 py-0.5 rounded transition-colors ${
              i === segments.length - 1
                ? isDark ? 'text-accent-blue' : 'text-blue-600'
                : isDark
                  ? 'text-text-faint hover:text-text-secondary hover:bg-overlay/50'
                  : 'text-text-light-secondary hover:text-text-light hover:bg-gray-100'
            }`}
          >
            {seg.label}
          </button>
        </span>
      ))}
    </div>
  )
}
