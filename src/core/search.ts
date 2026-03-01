import type { ParseResult } from './types'

function parseQuery(query: string): { mode: 'all' | 'key' | 'value'; term: string } | null {
  const trimmed = query.trim()
  if (!trimmed) return null

  let mode: 'all' | 'key' | 'value' = 'all'
  let searchTerm = trimmed

  if (searchTerm.startsWith('key:')) {
    mode = 'key'
    searchTerm = searchTerm.slice(4)
  } else if (searchTerm.startsWith('value:')) {
    mode = 'value'
    searchTerm = searchTerm.slice(6)
  }

  if (!searchTerm) return null
  return { mode, term: searchTerm.toLowerCase() }
}

function isMatch(keyLower: string, valueLower: string, term: string, mode: 'all' | 'key' | 'value'): boolean {
  switch (mode) {
    case 'key': return keyLower.includes(term)
    case 'value': return valueLower.includes(term)
    case 'all': return keyLower.includes(term) || valueLower.includes(term)
  }
}

const CHUNK_SIZE = 5_000

export async function searchNodesAsync(
  parseResult: ParseResult,
  query: string,
  signal: AbortSignal,
): Promise<string[]> {
  const parsed = parseQuery(query)
  if (!parsed) return []

  const { mode, term } = parsed
  const matches: string[] = []
  let count = 0

  for (const [id, node] of parseResult.nodes) {
    if (signal.aborted) return []

    const keyLower = node.key.toLowerCase()
    const valueLower = node.value !== undefined ? String(node.value).toLowerCase() : ''

    if (isMatch(keyLower, valueLower, term, mode)) {
      matches.push(id)
    }

    count++
    if (count % CHUNK_SIZE === 0) {
      await new Promise<void>((r) => setTimeout(r, 0))
    }
  }

  return signal.aborted ? [] : matches
}

export function searchNodes(parseResult: ParseResult, query: string): string[] {
  const parsed = parseQuery(query)
  if (!parsed) return []

  const { mode, term } = parsed
  const matches: string[] = []

  for (const [id, node] of parseResult.nodes) {
    const keyLower = node.key.toLowerCase()
    const valueLower = node.value !== undefined ? String(node.value).toLowerCase() : ''

    if (isMatch(keyLower, valueLower, term, mode)) {
      matches.push(id)
    }
  }

  return matches
}
