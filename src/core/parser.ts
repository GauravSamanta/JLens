import type { JsonNode, JsonNodeType, ParseResult } from './types'

function getType(value: unknown): JsonNodeType {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value as JsonNodeType
}

export function parseJson(data: unknown): ParseResult {
  const nodes = new Map<string, JsonNode>()
  let maxDepth = 0

  function walk(
    value: unknown,
    id: string,
    key: string,
    depth: number,
    parentId: string | null,
    index: number,
  ): void {
    const type = getType(value)
    maxDepth = Math.max(maxDepth, depth)

    const node: JsonNode = {
      id,
      key,
      value: type === 'object' || type === 'array' ? undefined : value,
      type,
      depth,
      parentId,
      childIds: [],
      childCount: 0,
      index,
    }

    nodes.set(id, node)

    if (type === 'object' && value !== null) {
      const entries = Object.entries(value as Record<string, unknown>)
      node.childCount = entries.length
      entries.forEach(([k, v], i) => {
        const childId = `${id}.${k}`
        node.childIds.push(childId)
        walk(v, childId, k, depth + 1, id, i)
      })
    } else if (type === 'array') {
      const arr = value as unknown[]
      node.childCount = arr.length
      arr.forEach((item, i) => {
        const childId = `${id}[${i}]`
        node.childIds.push(childId)
        walk(item, childId, `[${i}]`, depth + 1, id, i)
      })
    }
  }

  walk(data, '$', '$', 0, null, 0)

  return { nodes, rootId: '$', totalNodes: nodes.size, maxDepth }
}
