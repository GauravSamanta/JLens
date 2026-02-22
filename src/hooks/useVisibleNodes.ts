import { useMemo } from 'react'
import type { ParseResult } from '../core/types'

export function useVisibleNodes(parseResult: ParseResult | null, expandedNodes: Set<string>): string[] {
  return useMemo(() => {
    if (!parseResult) return []
    const visible: string[] = []

    function walk(nodeId: string) {
      const node = parseResult!.nodes.get(nodeId)
      if (!node) return
      visible.push(nodeId)
      if ((node.type === 'object' || node.type === 'array') && expandedNodes.has(nodeId)) {
        node.childIds.forEach(walk)
      }
    }

    walk(parseResult.rootId)
    return visible
  }, [parseResult, expandedNodes])
}
