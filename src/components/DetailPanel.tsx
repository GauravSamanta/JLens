import { useState, useMemo } from 'react'
import Hash from 'lucide-react/dist/esm/icons/hash'
import Type from 'lucide-react/dist/esm/icons/type'
import ToggleLeft from 'lucide-react/dist/esm/icons/toggle-left'
import CircleSlash from 'lucide-react/dist/esm/icons/circle-slash'
import Braces from 'lucide-react/dist/esm/icons/braces'
import List from 'lucide-react/dist/esm/icons/list'
import Table from 'lucide-react/dist/esm/icons/table'
import { useJsonStore } from '../stores/jsonStore'
import { useUIStore } from '../stores/uiStore'
import { TableView } from './TableView'
import { CopyButton } from './CopyButton'
import type { JsonNodeType, ParseResult } from '../core/types'

function getTypeIcon(type: JsonNodeType) {
  switch (type) {
    case 'string': return <Type size={12} />
    case 'number': return <Hash size={12} />
    case 'boolean': return <ToggleLeft size={12} />
    case 'null': return <CircleSlash size={12} />
    case 'object': return <Braces size={12} />
    case 'array': return <List size={12} />
    default: { const _exhaustive: never = type; return _exhaustive }
  }
}

function getTypeColor(type: JsonNodeType): string {
  switch (type) {
    case 'string': return 'text-syntax-string'
    case 'number': return 'text-accent'
    case 'boolean': return 'text-syntax-number'
    case 'null': return 'text-faint'
    case 'object': return 'text-syntax-bool'
    case 'array': return 'text-syntax-number'
    default: { const _exhaustive: never = type; return _exhaustive }
  }
}

function reconstructValue(nodeId: string, parseResult: ParseResult): unknown {
  const node = parseResult.nodes.get(nodeId)
  if (!node) return undefined
  if (node.type !== 'object' && node.type !== 'array') return node.value

  if (node.type === 'array') {
    return node.childIds.map((childId) => reconstructValue(childId, parseResult))
  }

  const obj: Record<string, unknown> = {}
  for (const childId of node.childIds) {
    const childNode = parseResult.nodes.get(childId)
    if (childNode) {
      obj[childNode.key] = reconstructValue(childId, parseResult)
    }
  }
  return obj
}

export function DetailPanel() {
  const parseResult = useJsonStore((s) => s.parseResult)
  const selectedNodeId = useJsonStore((s) => s.selectedNodeId)
  const rawViewFormat = useUIStore((s) => s.rawViewFormat)
  const [showTable, setShowTable] = useState(false)

  const selectedNode = parseResult && selectedNodeId ? parseResult.nodes.get(selectedNodeId) : null

  const fullValue = selectedNode && parseResult && selectedNodeId
    ? reconstructValue(selectedNodeId, parseResult)
    : null
  const valueStr = selectedNode
    ? selectedNode.type === 'object' || selectedNode.type === 'array'
      ? rawViewFormat === 'pretty'
        ? JSON.stringify(fullValue, null, 2)
        : JSON.stringify(fullValue)
      : String(selectedNode.value)
    : ''

  const isArrayOfObjects = useMemo(() => {
    if (!selectedNode || !parseResult || selectedNode.type !== 'array' || selectedNode.childCount === 0) return false
    const objectChildren = selectedNode.childIds.filter((id) => {
      const child = parseResult.nodes.get(id)
      return child?.type === 'object'
    })
    return objectChildren.length / selectedNode.childCount >= 0.5
  }, [selectedNode, parseResult])

  const tableData = useMemo(() => {
    if (!isArrayOfObjects || !Array.isArray(fullValue)) return null
    return fullValue.filter((item): item is Record<string, unknown> =>
      item !== null && typeof item === 'object' && !Array.isArray(item)
    )
  }, [isArrayOfObjects, fullValue])

  if (!selectedNode) {
    return (
      <div className="w-72 border-l flex items-center justify-center border-border bg-surface">
        <p className="font-mono text-[11px] tracking-wide text-faint">
          Select a node
        </p>
      </div>
    )
  }

  if (showTable && tableData) {
    return (
      <div className="w-72 border-l flex flex-col overflow-hidden border-border bg-surface">
        <TableView data={tableData} onClose={() => setShowTable(false)} />
      </div>
    )
  }

  return (
    <div className="w-72 border-l flex flex-col overflow-hidden border-border bg-surface">
      <div className="px-4 py-2.5 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium tracking-wider uppercase text-faint">Path</span>
          <CopyButton text={selectedNodeId ?? ''} title="Copy path" />
        </div>
        <p className="font-mono text-[11px] break-all leading-relaxed text-sub">{selectedNodeId}</p>
      </div>

      <div className="px-4 py-2.5 border-b flex items-center gap-2 border-border">
        <span className="text-[10px] font-medium tracking-wider uppercase text-faint">Type</span>
        <span className={`flex items-center gap-1 text-[11px] font-mono ${getTypeColor(selectedNode.type)}`}>
          {getTypeIcon(selectedNode.type)}
          {selectedNode.type}
          {selectedNode.type === 'object' && ` (${selectedNode.childCount})`}
          {selectedNode.type === 'array' && ` (${selectedNode.childCount})`}
        </span>
      </div>

      {isArrayOfObjects && (
        <div className="px-4 py-2.5 border-b border-border">
          <button
            onClick={() => setShowTable(true)}
            className="flex items-center gap-1.5 text-[11px] font-mono text-accent hover:text-accent"
          >
            <Table size={11} />
            View as Table
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <span className="text-[10px] font-medium tracking-wider uppercase text-faint">Value</span>
          <CopyButton text={valueStr} title="Copy value" />
        </div>
        <pre className="flex-1 overflow-auto px-4 pb-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap break-all text-sub">
          {valueStr}
        </pre>
      </div>
    </div>
  )
}
