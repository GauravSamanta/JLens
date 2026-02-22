import { useMemo } from 'react'
import { useJsonStore } from '../stores/jsonStore'
import { diffJson } from '../core/diff'
import type { DiffResult } from '../core/diff-types'

export function useDiff(): DiffResult | null {
  const { rawInputLeft, rawInputRight } = useJsonStore()

  return useMemo(() => {
    if (!rawInputLeft.trim() || !rawInputRight.trim()) return null
    try {
      const left = JSON.parse(rawInputLeft)
      const right = JSON.parse(rawInputRight)
      return diffJson(left, right)
    } catch {
      return null
    }
  }, [rawInputLeft, rawInputRight])
}
