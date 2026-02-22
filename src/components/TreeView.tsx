import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useJsonStore } from '../stores/jsonStore'
import { useVisibleNodes } from '../hooks/useVisibleNodes'
import { TreeNodeRow } from './TreeNode'

export function TreeView() {
  const { parseResult, expandedNodes, selectedNodeId, toggleNode, selectNode } = useJsonStore()
  const visibleNodeIds = useVisibleNodes(parseResult, expandedNodes)
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: visibleNodeIds.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 20,
  })

  if (!parseResult) return null

  return (
    <div ref={parentRef} className="flex-1 overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const nodeId = visibleNodeIds[virtualRow.index]
          const node = parseResult.nodes.get(nodeId)
          if (!node) return null

          return (
            <div
              key={nodeId}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <TreeNodeRow
                node={node}
                isExpanded={expandedNodes.has(nodeId)}
                isSelected={selectedNodeId === nodeId}
                onToggle={toggleNode}
                onSelect={selectNode}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
