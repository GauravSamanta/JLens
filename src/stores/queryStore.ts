import { create } from 'zustand'

interface QueryState {
  expression: string
  results: unknown | null
  error: string | null
  history: string[]
  setExpression: (expression: string) => void
  setResults: (results: unknown | null) => void
  setError: (error: string | null) => void
  addToHistory: (expression: string) => void
  clearHistory: () => void
}

const MAX_HISTORY = 50

function loadHistory(): string[] {
  try {
    const stored = localStorage.getItem('jlens-query-history')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export const useQueryStore = create<QueryState>((set) => ({
  expression: '',
  results: null,
  error: null,
  history: loadHistory(),

  setExpression: (expression) => set({ expression }),
  setResults: (results) => set({ results, error: null }),
  setError: (error) => set({ error, results: null }),

  addToHistory: (expression) =>
    set((state) => {
      const filtered = state.history.filter((h) => h !== expression)
      const next = [expression, ...filtered].slice(0, MAX_HISTORY)
      localStorage.setItem('jlens-query-history', JSON.stringify(next))
      return { history: next }
    }),

  clearHistory: () => {
    localStorage.removeItem('jlens-query-history')
    set({ history: [] })
  },
}))
