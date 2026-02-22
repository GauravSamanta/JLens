import { useState, useMemo } from 'react'
import { Hash, Type, ToggleLeft, CircleSlash, Braces, List, Table } from 'lucide-react'
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
  }
}

function getTypeColor(type: JsonNodeType, isDark: boolean): string {
  switch (type) {
    case 'string': return isDark ? 'text-accent-green' : 'text-emerald-700'
    case 'number': return isDark ? 'text-accent-blue' : 'text-blue-700'
    case 'boolean': return isDark ? 'text-accent-peach' : 'text-orange-700'
    case 'null': return isDark ? 'text-text-faint' : 'text-gray-400'
    case 'object': return isDark ? 'text-accent-mauve' : 'text-purple-700'
    case 'array': return isDark ? 'text-accent-yellow' : 'text-amber-700'
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
  const isDark = useUIStore((s) => s.theme) === 'dark'
  const [showTable, setShowTable] = useState(false)

  const selectedNode = parseResult && selectedNodeId ? parseResult.nodes.get(selectedNodeId) : null

  const fullValue = selectedNode && parseResult && selectedNodeId
    ? reconstructValue(selectedNodeId, parseResult)
    : null
  const valueStr = selectedNode
    ? selectedNode.type === 'object' || selectedNode.type === 'array'
      ? JSON.stringify(fullValue, null, 2)
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

  const border = isDark ? 'border-border' : 'border-border-light'
  const label = isDark ? 'text-muted' : 'text-text-light-secondary'

  if (!selectedNode) {
    return (
      <div className={`w-72 border-l flex items-center justify-center ${border} ${isDark ? 'bg-mantle' : 'bg-surface-light'}`}>
        <p className={`font-mono text-[11px] tracking-wide ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`}>
          Select a node
        </p>
      </div>
    )
  }

  if (showTable && tableData) {
    return (
      <div className={`w-72 border-l flex flex-col overflow-hidden ${border} ${isDark ? 'bg-mantle' : 'bg-surface-light'}`}>
        <TableView data={tableData} onClose={() => setShowTable(false)} />
      </div>
    )
  }

  return (
    <div className={`w-72 border-l flex flex-col overflow-hidden ${border} ${isDark ? 'bg-mantle' : 'bg-surface-light'}`}>
      <div className={`px-4 py-2.5 border-b ${border}`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[10px] font-medium tracking-widest uppercase ${label}`}>Path</span>
          <CopyButton text={selectedNodeId ?? ''} title="Copy path" />
        </div>
        <p className={`font-mono text-[11px] break-all leading-relaxed ${isDark ? 'text-text-secondary' : 'text-text-light'}`}>{selectedNodeId}</p>
      </div>

      <div className={`px-4 py-2 border-b flex items-center gap-2 ${border}`}>
        <span className={`text-[10px] font-medium tracking-widest uppercase ${label}`}>Type</span>
        <span className={`flex items-center gap-1 text-[11px] font-mono ${getTypeColor(selectedNode.type, isDark)}`}>
          {getTypeIcon(selectedNode.type)}
          {selectedNode.type}
          {selectedNode.type === 'object' && ` (${selectedNode.childCount})`}
          {selectedNode.type === 'array' && ` (${selectedNode.childCount})`}
        </span>
      </div>

      {isArrayOfObjects && (
        <div className={`px-4 py-2 border-b ${border}`}>
          <button
            onClick={() => setShowTable(true)}
            className={`flex items-center gap-1.5 text-[11px] font-mono ${isDark ? 'text-accent-blue hover:text-accent-sky' : 'text-blue-600 hover:text-blue-700'}`}
          >
            <Table size={11} />
            View as Table
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-2 flex items-center justify-between">
          <span className={`text-[10px] font-medium tracking-widest uppercase ${label}`}>Value</span>
          <CopyButton text={valueStr} title="Copy value" />
        </div>
        <pre className={`flex-1 overflow-auto px-4 pb-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap break-all ${isDark ? 'text-text-secondary' : 'text-text-light'}`}>
          {valueStr}
        </pre>
      </div>
    </div>
  )
}
