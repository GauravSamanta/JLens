import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useQueryStore } from '../../stores/queryStore'
import { act } from '@testing-library/react'

describe('queryStore', () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {})

    act(() => {
      useQueryStore.setState({
        expression: '',
        results: null,
        error: null,
        history: [],
      })
    })
  })

  describe('setExpression', () => {
    it('sets the expression', () => {
      act(() => useQueryStore.getState().setExpression('$.store'))
      expect(useQueryStore.getState().expression).toBe('$.store')
    })
  })

  describe('setResults', () => {
    it('sets results and clears error', () => {
      act(() => useQueryStore.getState().setError('some error'))
      act(() => useQueryStore.getState().setResults([1, 2, 3]))

      const state = useQueryStore.getState()
      expect(state.results).toEqual([1, 2, 3])
      expect(state.error).toBeNull()
    })

    it('can set results to null', () => {
      act(() => useQueryStore.getState().setResults([1]))
      act(() => useQueryStore.getState().setResults(null))
      expect(useQueryStore.getState().results).toBeNull()
    })
  })

  describe('setError', () => {
    it('sets error and clears results', () => {
      act(() => useQueryStore.getState().setResults([1, 2]))
      act(() => useQueryStore.getState().setError('Invalid expression'))

      const state = useQueryStore.getState()
      expect(state.error).toBe('Invalid expression')
      expect(state.results).toBeNull()
    })
  })

  describe('addToHistory', () => {
    it('adds expression to history', () => {
      act(() => useQueryStore.getState().addToHistory('$.a'))
      expect(useQueryStore.getState().history).toEqual(['$.a'])
    })

    it('puts newest expression first', () => {
      act(() => useQueryStore.getState().addToHistory('$.a'))
      act(() => useQueryStore.getState().addToHistory('$.b'))
      expect(useQueryStore.getState().history).toEqual(['$.b', '$.a'])
    })

    it('deduplicates: moves existing entry to top', () => {
      act(() => useQueryStore.getState().addToHistory('$.a'))
      act(() => useQueryStore.getState().addToHistory('$.b'))
      act(() => useQueryStore.getState().addToHistory('$.a'))

      expect(useQueryStore.getState().history).toEqual(['$.a', '$.b'])
    })

    it('limits history to 50 entries', () => {
      for (let i = 0; i < 60; i++) {
        act(() => useQueryStore.getState().addToHistory(`$.item${i}`))
      }
      expect(useQueryStore.getState().history.length).toBe(50)
      expect(useQueryStore.getState().history[0]).toBe('$.item59')
    })

    it('persists history to localStorage', () => {
      act(() => useQueryStore.getState().addToHistory('$.test'))
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'jlens-query-history',
        expect.any(String)
      )
    })
  })

  describe('clearHistory', () => {
    it('clears all history', () => {
      act(() => useQueryStore.getState().addToHistory('$.a'))
      act(() => useQueryStore.getState().addToHistory('$.b'))
      act(() => useQueryStore.getState().clearHistory())

      expect(useQueryStore.getState().history).toEqual([])
    })

    it('removes history from localStorage', () => {
      act(() => useQueryStore.getState().clearHistory())
      expect(localStorage.removeItem).toHaveBeenCalledWith('jlens-query-history')
    })
  })
})
