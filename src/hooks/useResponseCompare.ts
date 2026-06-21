import { useCallback, useMemo } from 'react'
import { parseRequestInput, type RequestSpec } from '../core/request'
import { diffJsonStructure } from '../core/structure-diff'
import { tryParseWithRepair } from '../core/repair'
import { useResponseCompareStore, type ResponseSideId, type ResponseSideState } from '../stores/responseCompareStore'

function parseResponseJson(rawResponse: string): { data: unknown; warning?: string } {
  try {
    return { data: JSON.parse(rawResponse) }
  } catch {
    const repaired = tryParseWithRepair(rawResponse)
    if (repaired.error) throw new Error(repaired.error.message)
    return {
      data: repaired.data,
      warning: repaired.wasRepaired ? 'Response JSON was repaired before comparison.' : undefined,
    }
  }
}

async function fetchJsonResponse(spec: RequestSpec): Promise<{
  status: number
  statusText: string
  durationMs: number
  rawResponse: string
  parsedJson: unknown
  warning?: string
}> {
  const started = performance.now()
  const response = await fetch(spec.url, {
    method: spec.method,
    headers: spec.headers,
    body: spec.body === undefined || spec.method === 'GET' || spec.method === 'HEAD'
      ? undefined
      : spec.body,
  })
  const rawResponse = await response.text()
  const durationMs = Math.round(performance.now() - started)
  const parsed = parseResponseJson(rawResponse)

  return {
    status: response.status,
    statusText: response.statusText,
    durationMs,
    rawResponse,
    parsedJson: parsed.data,
    warning: parsed.warning,
  }
}

export function useResponseCompare() {
  const left = useResponseCompareStore((state) => state.left)
  const right = useResponseCompareStore((state) => state.right)
  const setParsedRequest = useResponseCompareStore((state) => state.setParsedRequest)
  const setLoading = useResponseCompareStore((state) => state.setLoading)
  const setSuccess = useResponseCompareStore((state) => state.setSuccess)
  const setError = useResponseCompareStore((state) => state.setError)
  const resetResults = useResponseCompareStore((state) => state.resetResults)

  const diffResult = useMemo(() => {
    if (!left.rawResponse || !right.rawResponse || left.error || right.error) return null
    return diffJsonStructure(left.parsedJson, right.parsedJson)
  }, [left.error, left.parsedJson, left.rawResponse, right.error, right.parsedJson, right.rawResponse])

  const runSide = useCallback(async (side: ResponseSideId, sideState: ResponseSideState) => {
    const parsedInput = parseRequestInput(sideState.input)
    setParsedRequest(side, parsedInput.spec, parsedInput.warnings)

    if (!parsedInput.spec) {
      setError(side, parsedInput.error ?? 'Could not parse request.', parsedInput.warnings)
      return
    }

    setLoading(side, true)

    try {
      const result = await fetchJsonResponse(parsedInput.spec)
      setSuccess(side, {
        status: result.status,
        statusText: result.statusText,
        durationMs: result.durationMs,
        rawResponse: result.rawResponse,
        parsedJson: result.parsedJson,
      })
      if (result.warning) {
        const warnings = [...parsedInput.warnings, result.warning]
        setParsedRequest(side, parsedInput.spec, warnings)
      }
    } catch (error) {
      setError(side, error instanceof Error ? error.message : 'Request failed.', parsedInput.warnings)
    }
  }, [setError, setLoading, setParsedRequest, setSuccess])

  const fetchAndCompare = useCallback(async () => {
    resetResults()
    await Promise.all([
      runSide('left', useResponseCompareStore.getState().left),
      runSide('right', useResponseCompareStore.getState().right),
    ])
  }, [resetResults, runSide])

  return {
    left,
    right,
    diffResult,
    fetchAndCompare,
    isLoading: left.isLoading || right.isLoading,
  }
}
