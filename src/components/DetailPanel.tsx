import { useCallback, useState, useMemo } from 'react'
import { Copy, Hash, Type, ToggleLeft, CircleSlash, Braces, List, Table } from 'lucide-react'
import { useJsonStore } from '../stores/jsonStore'
import { useUIStore } from '../stores/uiStore'
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

function getTypeColor(type: JsonNodeType, isDark: boolean): string {
  switch (type) {
    case 'string': return isDark ? 'text-accent-green' : 'text-emerald-700'
    case 'number': return isDark ? 'text-accent-blue' : 'text-blue-700'
    case 'boolean': return isDark ? 'text-accent-peach' : 'text-orange-700'
    case 'null': return isDark ? 'text-text-faint' : 'text-gray-400'
    case 'object': return isDark ? 'text-accent-mauve' : 'text-purple-600'
    case 'array': return isDark ? 'text-accent-yellow' : 'text-yellow-600'
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

  const handleCopyPath = useCallback(() => {
    if (selectedNodeId) navigator.clipboard.writeText(selectedNodeId)
  }, [selectedNodeId])

  const handleCopyValue = useCallback(() => {
    if (valueStr) navigator.clipboard.writeText(valueStr)
  }, [valueStr])

  const border = isDark ? 'border-border' : 'border-border-light'
  const label = isDark ? 'text-text-faint' : 'text-gray-400'
  const copyBtn = isDark ? 'text-subtle hover:text-text-primary' : 'text-gray-400 hover:text-gray-600'

  if (!selectedNode) {
    return (
      <div className={`w-80 border-l p-4 flex items-center justify-center ${border}`}>
        <p className={`font-mono text-xs ${isDark ? 'text-text-faint' : 'text-gray-400'}`}>Click a node to inspect</p>
      </div>
    )
  }

  if (showTable && tableData) {
    return (
      <div className={`w-80 border-l flex flex-col overflow-hidden ${border}`}>
        <TableView data={tableData} onClose={() => setShowTable(false)} />
      </div>
    )
  }

  return (
    <div className={`w-80 border-l flex flex-col overflow-hidden ${border}`}>
      <div className={`p-3 border-b ${border}`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs ${label}`}>PATH</span>
          <button onClick={handleCopyPath} className={copyBtn} title="Copy path">
            <Copy size={12} />
          </button>
        </div>
        <p className={`font-mono text-xs break-all ${isDark ? 'text-text-primary' : 'text-gray-700'}`}>{selectedNodeId}</p>
      </div>

      <div className={`px-3 py-2 border-b flex items-center gap-2 ${border}`}>
        <span className={`text-xs ${label}`}>TYPE</span>
        <span className={`flex items-center gap-1 text-xs font-mono ${getTypeColor(selectedNode.type, isDark)}`}>
          {getTypeIcon(selectedNode.type)}
          {selectedNode.type}
          {selectedNode.type === 'object' && ` (${selectedNode.childCount} keys)`}
          {selectedNode.type === 'array' && ` (${selectedNode.childCount} items)`}
        </span>
      </div>

      {isArrayOfObjects && (
        <div className={`px-3 py-2 border-b ${border}`}>
          <button
            onClick={() => setShowTable(true)}
            className={`flex items-center gap-1.5 text-xs font-mono ${isDark ? 'text-accent-blue hover:text-accent-sky' : 'text-blue-600 hover:text-blue-500'}`}
          >
            <Table size={12} />
            View as Table
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className={`text-xs ${label}`}>VALUE</span>
          <button onClick={handleCopyValue} className={copyBtn} title="Copy value">
            <Copy size={12} />
          </button>
        </div>
        <pre className={`flex-1 overflow-auto px-3 pb-3 font-mono text-xs whitespace-pre-wrap break-all ${isDark ? 'text-text-secondary' : 'text-gray-700'}`}>
          {valueStr}
        </pre>
      </div>
    </div>
  )
}
