import { useEffect } from 'react'
import { Toolbar } from './components/Toolbar'
import { JsonInput } from './components/JsonInput'
import { TreeView } from './components/TreeView'
import { DetailPanel } from './components/DetailPanel'
import { SearchBar } from './components/SearchBar'
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
    <div className={`h-screen flex flex-col ${
      isDark
        ? 'bg-gray-950 text-gray-100'
        : 'bg-white text-gray-900'
    }`}>
      <Toolbar />
      {mode === 'explore' && (
        <>
          <JsonInput />
          {isParsing ? (
            <main className="flex-1 flex items-center justify-center">
              <p className={`font-mono text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Parsing large JSON...
              </p>
            </main>
          ) : parseResult ? (
            <>
              <div className="flex flex-1 overflow-hidden">
                <TreeView />
                <DetailPanel />
              </div>
              <SearchBar />
            </>
          ) : (
            <main className="flex-1 flex items-center justify-center">
              <p className={`font-mono text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                No JSON loaded.
              </p>
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
