import { describe, it, expect, beforeEach } from 'vitest'
import { useSearchStore } from '../../stores/searchStore'
import { act } from '@testing-library/react'

describe('searchStore', () => {
  beforeEach(() => {
    act(() => {
      useSearchStore.setState({
        query: '',
        matchIds: [],
        activeMatchIndex: 0,
      })
    })
  })

  describe('setQuery', () => {
    it('sets the query string', () => {
      act(() => useSearchStore.getState().setQuery('test'))
      expect(useSearchStore.getState().query).toBe('test')
    })

    it('resets activeMatchIndex when query changes', () => {
      act(() => useSearchStore.getState().setMatchIds(['a', 'b', 'c']))
      act(() => useSearchStore.getState().nextMatch())
      expect(useSearchStore.getState().activeMatchIndex).toBe(1)

      act(() => useSearchStore.getState().setQuery('new query'))
      expect(useSearchStore.getState().activeMatchIndex).toBe(0)
    })
  })

  describe('setMatchIds', () => {
    it('stores match IDs', () => {
      act(() => useSearchStore.getState().setMatchIds(['$.a', '$.b']))
      expect(useSearchStore.getState().matchIds).toEqual(['$.a', '$.b'])
    })

    it('resets activeMatchIndex', () => {
      act(() => useSearchStore.getState().setMatchIds(['$.a', '$.b']))
      act(() => useSearchStore.getState().nextMatch())
      act(() => useSearchStore.getState().setMatchIds(['$.x', '$.y', '$.z']))
      expect(useSearchStore.getState().activeMatchIndex).toBe(0)
    })
  })

  describe('nextMatch / prevMatch', () => {
    beforeEach(() => {
      act(() => useSearchStore.getState().setMatchIds(['$.a', '$.b', '$.c']))
    })

    it('nextMatch advances the index', () => {
      act(() => useSearchStore.getState().nextMatch())
      expect(useSearchStore.getState().activeMatchIndex).toBe(1)
    })

    it('nextMatch wraps around at the end', () => {
      act(() => useSearchStore.getState().nextMatch())
      act(() => useSearchStore.getState().nextMatch())
      act(() => useSearchStore.getState().nextMatch())
      expect(useSearchStore.getState().activeMatchIndex).toBe(0)
    })

    it('prevMatch goes backwards', () => {
      act(() => useSearchStore.getState().nextMatch())
      act(() => useSearchStore.getState().nextMatch())
      act(() => useSearchStore.getState().prevMatch())
      expect(useSearchStore.getState().activeMatchIndex).toBe(1)
    })

    it('prevMatch wraps around at the start', () => {
      act(() => useSearchStore.getState().prevMatch())
      expect(useSearchStore.getState().activeMatchIndex).toBe(2)
    })

    it('nextMatch returns 0 when matchIds is empty', () => {
      act(() => useSearchStore.getState().setMatchIds([]))
      act(() => useSearchStore.getState().nextMatch())
      expect(useSearchStore.getState().activeMatchIndex).toBe(0)
    })

    it('prevMatch returns 0 when matchIds is empty', () => {
      act(() => useSearchStore.getState().setMatchIds([]))
      act(() => useSearchStore.getState().prevMatch())
      expect(useSearchStore.getState().activeMatchIndex).toBe(0)
    })
  })

  describe('clearSearch', () => {
    it('resets all search state', () => {
      act(() => useSearchStore.getState().setQuery('test'))
      act(() => useSearchStore.getState().setMatchIds(['$.a', '$.b']))
      act(() => useSearchStore.getState().nextMatch())

      act(() => useSearchStore.getState().clearSearch())

      const state = useSearchStore.getState()
      expect(state.query).toBe('')
      expect(state.matchIds).toEqual([])
      expect(state.activeMatchIndex).toBe(0)
    })
  })
})
