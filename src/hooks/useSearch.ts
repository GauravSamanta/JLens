import { useEffect, useRef } from 'react'
import { useSearchStore } from '../stores/searchStore'
import { useJsonStore } from '../stores/jsonStore'
import { searchNodes } from '../core/search'

export function useSearch() {
  const { query, setMatchIds } = useSearchStore()
  const { parseResult, expandToNode } = useJsonStore()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim() || !parseResult) {
      setMatchIds([])
      return
    }

    const delay = parseResult.totalNodes > 10_000 ? 300 : 50
    debounceRef.current = setTimeout(() => {
      const matches = searchNodes(parseResult, query)
      setMatchIds(matches)
      matches.forEach((id) => expandToNode(id))
    }, delay)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, parseResult])
}
