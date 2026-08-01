import { useCallback, useEffect, useRef, useState } from 'react'
import { JSONPath } from 'jsonpath-plus'
import { useQueryStore } from '../stores/queryStore'
import { useJsonStore } from '../stores/jsonStore'

export function useJsonPath() {
  const { expression, setResults, setError, addToHistory } = useQueryStore()
  const { rawInput } = useJsonStore()
  const [isLoading, setIsLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const evaluate = useCallback((expr: string) => {
    if (!expr.trim() || !rawInput.trim()) {
      setResults(null)
      return
    }

    setIsLoading(true)
    try {
      const data = JSON.parse(rawInput)
      try {
        const result = JSONPath({ path: expr, json: data })
        setResults(result)
        addToHistory(expr)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setIsLoading(false)
      }
    } catch {
      setError('Invalid JSON input')
      setIsLoading(false)
    }
  }, [rawInput, setResults, setError, addToHistory])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!expression.trim()) {
      setResults(null)
      return
    }

    debounceRef.current = setTimeout(() => evaluate(expression), 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [expression, rawInput, evaluate, setResults])

  return { isLoading, evaluate }
}
