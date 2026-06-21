import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useResponseCompareStore } from '../../stores/responseCompareStore'

describe('responseCompareStore', () => {
  beforeEach(() => {
    act(() => {
      useResponseCompareStore.setState({
        left: {
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
        },
        right: {
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
        },
      })
    })
  })

  it('updates request input independently per side', () => {
    act(() => {
      useResponseCompareStore.getState().setInput('left', 'https://a.example.com')
      useResponseCompareStore.getState().setInput('right', 'https://b.example.com')
    })

    expect(useResponseCompareStore.getState().left.input).toBe('https://a.example.com')
    expect(useResponseCompareStore.getState().right.input).toBe('https://b.example.com')
  })

  it('stores successful response metadata', () => {
    act(() => {
      useResponseCompareStore.getState().setSuccess('left', {
        status: 200,
        statusText: 'OK',
        durationMs: 12,
        rawResponse: '{"ok":true}',
        parsedJson: { ok: true },
      })
    })

    const left = useResponseCompareStore.getState().left
    expect(left.status).toBe(200)
    expect(left.error).toBeNull()
    expect(left.parsedJson).toEqual({ ok: true })
  })

  it('clears result fields when a side fails', () => {
    act(() => {
      useResponseCompareStore.getState().setSuccess('right', {
        status: 200,
        statusText: 'OK',
        durationMs: 10,
        rawResponse: '{"ok":true}',
        parsedJson: { ok: true },
      })
      useResponseCompareStore.getState().setError('right', 'Request failed.')
    })

    const right = useResponseCompareStore.getState().right
    expect(right.error).toBe('Request failed.')
    expect(right.status).toBeNull()
    expect(right.rawResponse).toBe('')
  })
})
