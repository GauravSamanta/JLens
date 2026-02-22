import { memo, useCallback } from 'react'
import { ChevronRight, ChevronDown, Copy } from 'lucide-react'
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

function valueColor(type: string): string {
  switch (type) {
    case 'string': return 'text-emerald-400'
    case 'number': return 'text-blue-400'
    case 'boolean': return 'text-orange-400'
    case 'null': return 'text-gray-500 italic'
    default: return 'text-gray-400'
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
  const isContainer = node.type === 'object' || node.type === 'array'
  const indent = node.depth * 20

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(node.id)
  }, [node.id])

  let rowStyle: string
  if (isActiveMatch) rowStyle = 'bg-yellow-900/40 ring-1 ring-yellow-500/30'
  else if (isMatch) rowStyle = 'bg-yellow-900/20'
  else if (isSelected) rowStyle = 'bg-gray-800/60'
  else rowStyle = 'hover:bg-gray-800/30'

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
            className="text-gray-500 hover:text-gray-300"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : null}
      </span>

      {node.key !== '$' && (
        <>
          <span className="text-gray-300">{node.key}</span>
          <span className="text-gray-600 mx-1">:</span>
        </>
      )}

      {isContainer ? (
        isExpanded ? (
          <span className="text-gray-500">{node.type === 'array' ? '[' : '{'}</span>
        ) : (
          <span className="text-gray-500">
            {node.type === 'array' ? `[${node.childCount} items]` : `{${node.childCount} keys}`}
          </span>
        )
      ) : (
        <span className={valueColor(node.type)}>{formatValue(node)}</span>
      )}

      <button
        onClick={handleCopy}
        className="ml-auto opacity-0 group-hover:opacity-100 text-gray-600 hover:text-gray-300 transition-opacity"
        title={`Copy path: ${node.id}`}
      >
        <Copy size={12} />
      </button>
    </div>
  )
})
