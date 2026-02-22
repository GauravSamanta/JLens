import type { ParseResult } from './types'

export function searchNodes(parseResult: ParseResult, query: string): string[] {
  if (!query.trim()) return []

  let mode: 'all' | 'key' | 'value' = 'all'
  let searchTerm = query.trim()

  if (searchTerm.startsWith('key:')) {
    mode = 'key'
    searchTerm = searchTerm.slice(4)
  } else if (searchTerm.startsWith('value:')) {
    mode = 'value'
    searchTerm = searchTerm.slice(6)
  }

  if (!searchTerm) return []

  const lower = searchTerm.toLowerCase()
  const matches: string[] = []

  for (const [id, node] of parseResult.nodes) {
    const keyMatch = node.key.toLowerCase().includes(lower)
    const valueStr = node.value !== undefined ? String(node.value) : ''
    const valueMatch = valueStr.toLowerCase().includes(lower)

    if (mode === 'key' && keyMatch) matches.push(id)
    else if (mode === 'value' && valueMatch) matches.push(id)
    else if (mode === 'all' && (keyMatch || valueMatch)) matches.push(id)
  }

  return matches
}
