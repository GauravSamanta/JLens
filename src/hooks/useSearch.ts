import { useEffect, useRef } from 'react'
import { useSearchStore } from '../stores/searchStore'
import { useJsonStore } from '../stores/jsonStore'
import { searchNodes, searchNodesAsync } from '../core/search'

const ASYNC_THRESHOLD = 10_000

function debounceDelay(nodeCount: number): number {
  if (nodeCount < 500) return 0
  if (nodeCount < 5_000) return 50
  if (nodeCount < 50_000) return 150
  if (nodeCount < 200_000) return 300
  return 500
}

export function useSearch() {
  const { query, setMatchIds } = useSearchStore()
  const { parseResult } = useJsonStore()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    abortRef.current?.abort()

    if (!query.trim() || !parseResult) {
      setMatchIds([])
      return
    }

    const isLarge = parseResult.totalNodes > ASYNC_THRESHOLD
    const delay = debounceDelay(parseResult.totalNodes)

    debounceRef.current = setTimeout(() => {
      if (isLarge) {
        const controller = new AbortController()
        abortRef.current = controller
        searchNodesAsync(parseResult, query, controller.signal).then((matches) => {
          if (!controller.signal.aborted) {
            setMatchIds(matches)
          }
        })
      } else {
        setMatchIds(searchNodes(parseResult, query))
      }
    }, delay)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      abortRef.current?.abort()
    }
  }, [query, parseResult])
}
