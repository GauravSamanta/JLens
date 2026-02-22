import { memo, useCallback } from 'react'
import { ChevronRight, ChevronDown, Copy } from 'lucide-react'
import { useUIStore } from '../stores/uiStore'
import type { JsonNode } from '../core/types'

interface TreeNodeProps {
  node: JsonNode
  isExpanded: boolean
  isSelected: boolean
  isMatch: boolean
  isActiveMatch: boolean
  onToggle: (nodeId: string) => void
  onSelect: (nodeId: string) => void
}

function valueColor(type: string, isDark: boolean): string {
  switch (type) {
    case 'string': return isDark ? 'text-emerald-400' : 'text-emerald-600'
    case 'number': return isDark ? 'text-blue-400' : 'text-blue-600'
    case 'boolean': return isDark ? 'text-orange-400' : 'text-orange-600'
    case 'null': return isDark ? 'text-gray-500 italic' : 'text-gray-400 italic'
    default: return isDark ? 'text-gray-400' : 'text-gray-500'
  }
}

function formatValue(node: JsonNode): string {
  if (node.type === 'string') {
    const str = node.value as string
    const truncated = str.length > 120 ? str.slice(0, 120) + '...' : str
    return `"${truncated}"`
  }
  if (node.type === 'null') return 'null'
  if (node.type === 'boolean') return String(node.value)
  if (node.type === 'number') return String(node.value)
  return ''
}

export const TreeNodeRow = memo(function TreeNodeRow({ node, isExpanded, isSelected, isMatch, isActiveMatch, onToggle, onSelect }: TreeNodeProps) {
  const isDark = useUIStore((s) => s.theme) === 'dark'
  const isContainer = node.type === 'object' || node.type === 'array'
  const indent = node.depth * 20

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(node.id)
  }, [node.id])

  let rowStyle: string
  if (isActiveMatch) rowStyle = 'bg-yellow-900/40 ring-1 ring-yellow-500/30'
  else if (isMatch) rowStyle = 'bg-yellow-900/20'
  else if (isSelected) rowStyle = isDark ? 'bg-gray-800/60' : 'bg-blue-50'
  else rowStyle = isDark ? 'hover:bg-gray-800/30' : 'hover:bg-gray-100'

  return (
    <div
      className={`flex items-center h-7 cursor-pointer group font-mono text-sm pr-4 ${rowStyle}`}
      style={{ paddingLeft: `${indent + 8}px` }}
      onClick={() => onSelect(node.id)}
    >
      <span className="w-5 flex-shrink-0 flex items-center justify-center">
        {isContainer ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle(node.id)
            }}
            className={isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : null}
      </span>

      {node.key !== '$' && (
        <>
          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{node.key}</span>
          <span className={`mx-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>:</span>
        </>
      )}

      {isContainer ? (
        isExpanded ? (
          <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{node.type === 'array' ? '[' : '{'}</span>
        ) : (
          <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
            {node.type === 'array' ? `[${node.childCount} items]` : `{${node.childCount} keys}`}
          </span>
        )
      ) : (
        <span className={valueColor(node.type, isDark)}>{formatValue(node)}</span>
      )}

      <button
        onClick={handleCopy}
        className={`ml-auto opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
        title={`Copy path: ${node.id}`}
      >
        <Copy size={12} />
      </button>
    </div>
  )
})
