import { memo } from 'react'
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right'
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down'
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

function valueColor(type: JsonNodeType): string {
  switch (type) {
    case 'string': return 'text-syntax-string'
    case 'number': return 'text-accent'
    case 'boolean': return 'text-syntax-number'
    case 'null': return 'text-faint italic'
    case 'object':
    case 'array': return 'text-sub'
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
  const isContainer = node.type === 'object' || node.type === 'array'
  const indent = node.depth * 18

  let rowBg: string
  if (isActiveMatch) rowBg = 'bg-syntax-number/15 ring-1 ring-inset ring-syntax-number/25'
  else if (isMatch) rowBg = 'bg-syntax-number/8'
  else if (isSelected) rowBg = 'bg-accent/10'
  else rowBg = 'hover:bg-overlay/25'

  return (
    <div
      className={`flex items-center h-[28px] cursor-pointer group font-mono text-[13px] leading-none pr-4 transition-colors duration-75 overflow-hidden whitespace-nowrap ${rowBg}`}
      style={{ paddingLeft: `${indent + 14}px` }}
      onClick={() => onSelect(node.id)}
    >
      <span className="w-4 flex-shrink-0 flex items-center justify-center">
        {isContainer ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle(node.id)
            }}
            className="transition-colors text-faint hover:text-sub"
          >
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : null}
      </span>

      {node.key !== '$' && (
        <>
          <span className="text-text">{node.key}</span>
          <span className="mx-1 text-faint">:</span>
        </>
      )}

      {isContainer ? (
        isExpanded ? (
          <span className="text-faint">{node.type === 'array' ? '[' : '{'}</span>
        ) : (
          <span className="text-faint">
            {node.type === 'array' ? `[${node.childCount}]` : `{${node.childCount}}`}
          </span>
        )
      ) : (
        <span className={`truncate ${valueColor(node.type)}`}>{formatValue(node)}</span>
      )}

      <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex-shrink-0">
        <CopyButton text={node.id} title={node.id} />
      </span>
    </div>
  )
})
