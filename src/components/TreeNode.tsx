import { memo } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { useUIStore } from '../stores/uiStore'
import { CopyButton } from './CopyButton'
import type { JsonNode, JsonNodeType } from '../core/types'

interface TreeNodeProps {
  node: JsonNode
  isExpanded: boolean
  isSelected: boolean
  isMatch: boolean
  isActiveMatch: boolean
  onToggle: (nodeId: string) => void
  onSelect: (nodeId: string) => void
}

function valueColor(type: JsonNodeType, isDark: boolean): string {
  switch (type) {
    case 'string': return isDark ? 'text-accent-green' : 'text-emerald-700'
    case 'number': return isDark ? 'text-accent-blue' : 'text-blue-700'
    case 'boolean': return isDark ? 'text-accent-peach' : 'text-orange-700'
    case 'null': return isDark ? 'text-text-faint italic' : 'text-gray-400 italic'
    case 'object':
    case 'array': return isDark ? 'text-text-secondary' : 'text-gray-500'
    default: { const _exhaustive: never = type; return _exhaustive }
  }
}

function formatValue(node: JsonNode): string {
  if (node.type === 'string') {
    const str = node.value as string
    const truncated = str.length > 60 ? str.slice(0, 60) + '\u2026' : str
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
  const indent = node.depth * 18

  let rowBg: string
  if (isActiveMatch) rowBg = isDark ? 'bg-accent-yellow/15 ring-1 ring-inset ring-accent-yellow/25' : 'bg-yellow-100 ring-1 ring-inset ring-yellow-300/50'
  else if (isMatch) rowBg = isDark ? 'bg-accent-yellow/8' : 'bg-yellow-50'
  else if (isSelected) rowBg = isDark ? 'bg-accent-blue/8' : 'bg-blue-50/80'
  else rowBg = isDark ? 'hover:bg-overlay/25' : 'hover:bg-black/[0.02]'

  return (
    <div
      className={`flex items-center h-[28px] cursor-pointer group font-mono text-[13px] pr-4 transition-colors duration-75 overflow-hidden whitespace-nowrap ${rowBg}`}
      style={{ paddingLeft: `${indent + 12}px` }}
      onClick={() => onSelect(node.id)}
    >
      <span className="w-4 flex-shrink-0 flex items-center justify-center">
        {isContainer ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle(node.id)
            }}
            className={`transition-colors ${isDark ? 'text-subtle hover:text-text-secondary' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : null}
      </span>

      {node.key !== '$' && (
        <>
          <span className={isDark ? 'text-text-primary' : 'text-gray-700'}>{node.key}</span>
          <span className={`mx-1 ${isDark ? 'text-muted' : 'text-gray-300'}`}>:</span>
        </>
      )}

      {isContainer ? (
        isExpanded ? (
          <span className={isDark ? 'text-subtle' : 'text-gray-400'}>{node.type === 'array' ? '[' : '{'}</span>
        ) : (
          <span className={isDark ? 'text-text-faint' : 'text-gray-400'}>
            {node.type === 'array' ? `[${node.childCount}]` : `{${node.childCount}}`}
          </span>
        )
      ) : (
        <span className={`truncate ${valueColor(node.type, isDark)}`}>{formatValue(node)}</span>
      )}

      <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex-shrink-0">
        <CopyButton text={node.id} title={node.id} />
      </span>
    </div>
  )
})
