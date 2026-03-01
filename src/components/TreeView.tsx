import { useRef, useMemo, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useJsonStore } from '../stores/jsonStore'
import { useSearchStore } from '../stores/searchStore'
import { useVisibleNodes } from '../hooks/useVisibleNodes'
import { TreeNodeRow } from './TreeNode'

export function TreeView() {
  const { parseResult, expandedNodes, selectedNodeId, toggleNode, selectNode } = useJsonStore()
  const { matchIds, activeMatchIndex } = useSearchStore()
  const visibleNodeIds = useVisibleNodes(parseResult, expandedNodes)
  const parentRef = useRef<HTMLDivElement>(null)
  const matchSet = useMemo(() => new Set(matchIds), [matchIds])
  const activeMatchId = matchIds[activeMatchIndex] ?? null

  const virtualizer = useVirtualizer({
    count: visibleNodeIds.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 20,
  })

  useEffect(() => {
    if (!activeMatchId) return
    const index = visibleNodeIds.indexOf(activeMatchId)
    if (index !== -1) {
      virtualizer.scrollToIndex(index, { align: 'center' })
    }
  }, [activeMatchId, visibleNodeIds, virtualizer])

  if (!parseResult) return null

  return (
    <div ref={parentRef} className="flex-1 overflow-auto" style={{ contain: 'strict', overscrollBehavior: 'contain' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
          contain: 'layout style',
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
                isMatch={matchSet.has(nodeId)}
                isActiveMatch={activeMatchId === nodeId}
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
