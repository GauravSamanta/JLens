import { create } from 'zustand'

interface SearchState {
  query: string
  matchIds: string[]
  activeMatchIndex: number
  setQuery: (query: string) => void
  setMatchIds: (ids: string[]) => void
  nextMatch: () => void
  prevMatch: () => void
  clearSearch: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  matchIds: [],
  activeMatchIndex: 0,

  setQuery: (query) => set({ query, activeMatchIndex: 0 }),
  setMatchIds: (matchIds) => set({ matchIds, activeMatchIndex: 0 }),

  nextMatch: () =>
    set((state) => ({
      activeMatchIndex:
        state.matchIds.length > 0 ? (state.activeMatchIndex + 1) % state.matchIds.length : 0,
    })),

  prevMatch: () =>
    set((state) => ({
      activeMatchIndex:
        state.matchIds.length > 0
          ? (state.activeMatchIndex - 1 + state.matchIds.length) % state.matchIds.length
          : 0,
    })),

  clearSearch: () => set({ query: '', matchIds: [], activeMatchIndex: 0 }),
}))
