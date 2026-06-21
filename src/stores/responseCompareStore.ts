import { create } from 'zustand'
import type { RequestSpec } from '../core/request'

export type ResponseSideId = 'left' | 'right'

export interface ResponseSideState {
  input: string
  spec: RequestSpec | null
  warnings: string[]
  isLoading: boolean
  status: number | null
  statusText: string
  durationMs: number | null
  rawResponse: string
  parsedJson: unknown
  error: string | null
}

interface ResponseCompareState {
  left: ResponseSideState
  right: ResponseSideState
  setInput: (side: ResponseSideId, input: string) => void
  setParsedRequest: (side: ResponseSideId, spec: RequestSpec | null, warnings: string[]) => void
  setLoading: (side: ResponseSideId, isLoading: boolean) => void
  setSuccess: (
    side: ResponseSideId,
    result: Pick<ResponseSideState, 'status' | 'statusText' | 'durationMs' | 'rawResponse' | 'parsedJson'>
  ) => void
  setError: (side: ResponseSideId, error: string, warnings?: string[]) => void
  resetResults: () => void
}

const emptySide: ResponseSideState = {
  input: '',
  spec: null,
  warnings: [],
  isLoading: false,
  status: null,
  statusText: '',
  durationMs: null,
  rawResponse: '',
  parsedJson: null,
  error: null,
}

function updateSide(
  side: ResponseSideId,
  updater: (current: ResponseSideState) => ResponseSideState
) {
  return (state: ResponseCompareState) => ({
    [side]: updater(state[side]),
  }) as Pick<ResponseCompareState, ResponseSideId>
}

export const useResponseCompareStore = create<ResponseCompareState>((set) => ({
  left: { ...emptySide },
  right: { ...emptySide },

  setInput: (side, input) => set(updateSide(side, (current) => ({
    ...current,
    input,
  }))),

  setParsedRequest: (side, spec, warnings) => set(updateSide(side, (current) => ({
    ...current,
    spec,
    warnings,
    error: null,
  }))),

  setLoading: (side, isLoading) => set(updateSide(side, (current) => ({
    ...current,
    isLoading,
    error: isLoading ? null : current.error,
  }))),

  setSuccess: (side, result) => set(updateSide(side, (current) => ({
    ...current,
    ...result,
    isLoading: false,
    error: null,
  }))),

  setError: (side, error, warnings) => set(updateSide(side, (current) => ({
    ...current,
    isLoading: false,
    warnings: warnings ?? current.warnings,
    error,
    status: null,
    statusText: '',
    durationMs: null,
    rawResponse: '',
    parsedJson: null,
  }))),

  resetResults: () => set((state) => ({
    left: {
      ...state.left,
      isLoading: false,
      status: null,
      statusText: '',
      durationMs: null,
      rawResponse: '',
      parsedJson: null,
      error: null,
    },
    right: {
      ...state.right,
      isLoading: false,
      status: null,
      statusText: '',
      durationMs: null,
      rawResponse: '',
      parsedJson: null,
      error: null,
    },
  })),
}))
