import { create } from 'zustand'

export type AppMode = 'explore' | 'diff' | 'query'
export type DiffViewStyle = 'side-by-side' | 'inline'
export type RawViewFormat = 'pretty' | 'minified'
export type Theme = 'dark' | 'light'

interface UIState {
  mode: AppMode
  theme: Theme
  diffViewStyle: DiffViewStyle
  setMode: (mode: AppMode) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  rawViewFormat: RawViewFormat
  setDiffViewStyle: (style: DiffViewStyle) => void
  toggleRawViewFormat: () => void
  showShortcuts: boolean
  setShowShortcuts: (show: boolean) => void
  toggleShortcuts: () => void
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('jlens-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export const useUIStore = create<UIState>((set) => ({
  mode: 'explore',
  theme: getInitialTheme(),
  diffViewStyle: 'side-by-side',
  setMode: (mode) => set({ mode }),
  setTheme: (theme) => {
    localStorage.setItem('jlens-theme', theme)
    set({ theme })
  },
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('jlens-theme', next)
      return { theme: next }
    }),
  rawViewFormat: 'pretty',
  setDiffViewStyle: (diffViewStyle) => set({ diffViewStyle }),
  toggleRawViewFormat: () =>
    set((state) => ({
      rawViewFormat: state.rawViewFormat === 'pretty' ? 'minified' : 'pretty',
    })),
  showShortcuts: false,
  setShowShortcuts: (show) => set({ showShortcuts: show }),
  toggleShortcuts: () => set((s) => ({ showShortcuts: !s.showShortcuts })),
}))
