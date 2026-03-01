import { useEffect } from 'react'
import { Toolbar } from './components/Toolbar'
import { JsonInput } from './components/JsonInput'
import { TreeView } from './components/TreeView'
import { DetailPanel } from './components/DetailPanel'
import { SearchBar } from './components/SearchBar'
import { TreeToolbar } from './components/TreeToolbar'
import { QueryPanel } from './components/QueryPanel'
import { DiffView } from './components/DiffView'
import { useUIStore } from './stores/uiStore'
import { useJsonStore } from './stores/jsonStore'
import { useShareUrl } from './hooks/useShareUrl'

function App() {
  const { loadFromUrl } = useShareUrl()

  useEffect(() => {
    loadFromUrl()
  }, [loadFromUrl])

  const theme = useUIStore((s) => s.theme)
  const mode = useUIStore((s) => s.mode)
  const parseResult = useJsonStore((s) => s.parseResult)
  const isParsing = useJsonStore((s) => s.isParsing)
  const isDark = theme === 'dark'

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      if (mod && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement
        searchInput?.focus()
      }

      if (mod && e.key === 'e' && !e.shiftKey) {
        e.preventDefault()
        useJsonStore.getState().expandAll()
      }

      if (mod && e.key === 'e' && e.shiftKey) {
        e.preventDefault()
        useJsonStore.getState().collapseAll()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={`h-screen flex flex-col noise-bg ${
      isDark
        ? 'bg-base text-text-primary'
        : 'bg-base-light text-text-light'
    }`}>
      <Toolbar />
      {mode === 'explore' && (
        <>
          <JsonInput />
          {isParsing ? (
            <main className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 border-t-transparent animate-spin ${isDark ? 'border-accent-blue' : 'border-blue-500'}`} />
                <p className={`font-mono text-xs tracking-wide ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`}>
                  PARSING
                </p>
              </div>
            </main>
          ) : parseResult ? (
            <>
              <TreeToolbar />
              <div className="flex flex-1 overflow-hidden">
                <TreeView />
                <DetailPanel />
              </div>
              <SearchBar />
            </>
          ) : (
            <main className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <p className={`font-mono text-[11px] tracking-[0.2em] uppercase ${isDark ? 'text-muted' : 'text-text-light-secondary'}`}>
                  Paste or upload JSON to begin
                </p>
              </div>
            </main>
          )}
        </>
      )}
      {mode === 'diff' && <DiffView />}
      {mode === 'query' && <QueryPanel />}
    </div>
  )
}

export default App
