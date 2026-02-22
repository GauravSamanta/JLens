import { useCallback, useState, useMemo } from 'react'
import { Copy, Hash, Type, ToggleLeft, CircleSlash, Braces, List, Table } from 'lucide-react'
import { useJsonStore } from '../stores/jsonStore'
import { TableView } from './TableView'
import type { JsonNodeType, ParseResult } from '../core/types'

function getTypeIcon(type: JsonNodeType) {
  switch (type) {
    case 'string': return <Type size={14} />
    case 'number': return <Hash size={14} />
    case 'boolean': return <ToggleLeft size={14} />
    case 'null': return <CircleSlash size={14} />
    case 'object': return <Braces size={14} />
    case 'array': return <List size={14} />
  }
}

function getTypeColor(type: JsonNodeType): string {
  switch (type) {
    case 'string': return 'text-emerald-400'
    case 'number': return 'text-blue-400'
    case 'boolean': return 'text-orange-400'
    case 'null': return 'text-gray-500'
    case 'object': return 'text-purple-400'
    case 'array': return 'text-yellow-400'
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

  const handleCopyPath = useCallback(() => {
    if (selectedNodeId) navigator.clipboard.writeText(selectedNodeId)
  }, [selectedNodeId])

  const handleCopyValue = useCallback(() => {
    if (valueStr) navigator.clipboard.writeText(valueStr)
  }, [valueStr])

  if (!selectedNode) {
    return (
      <div className="w-80 border-l border-gray-800 p-4 flex items-center justify-center">
        <p className="text-gray-600 font-mono text-xs">Click a node to inspect</p>
      </div>
    )
  }

  if (showTable && tableData) {
    return (
      <div className="w-80 border-l border-gray-800 flex flex-col overflow-hidden">
        <TableView data={tableData} onClose={() => setShowTable(false)} />
      </div>
    )
  }

  return (
    <div className="w-80 border-l border-gray-800 flex flex-col overflow-hidden">
      {/* Path */}
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">PATH</span>
          <button onClick={handleCopyPath} className="text-gray-600 hover:text-gray-300" title="Copy path">
            <Copy size={12} />
          </button>
        </div>
        <p className="font-mono text-xs text-gray-300 break-all">{selectedNodeId}</p>
      </div>

      {/* Type */}
      <div className="px-3 py-2 border-b border-gray-800 flex items-center gap-2">
        <span className="text-xs text-gray-500">TYPE</span>
        <span className={`flex items-center gap-1 text-xs font-mono ${getTypeColor(selectedNode.type)}`}>
          {getTypeIcon(selectedNode.type)}
          {selectedNode.type}
          {selectedNode.type === 'object' && ` (${selectedNode.childCount} keys)`}
          {selectedNode.type === 'array' && ` (${selectedNode.childCount} items)`}
        </span>
      </div>

      {/* View as Table button */}
      {isArrayOfObjects && (
        <div className="px-3 py-2 border-b border-gray-800">
          <button
            onClick={() => setShowTable(true)}
            className="flex items-center gap-1.5 text-xs font-mono text-blue-400 hover:text-blue-300"
          >
            <Table size={12} />
            View as Table
          </button>
        </div>
      )}

      {/* Value */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">VALUE</span>
          <button onClick={handleCopyValue} className="text-gray-600 hover:text-gray-300" title="Copy value">
            <Copy size={12} />
          </button>
        </div>
        <pre className="flex-1 overflow-auto px-3 pb-3 font-mono text-xs text-gray-300 whitespace-pre-wrap break-all">
          {valueStr}
        </pre>
      </div>
    </div>
  )
}
