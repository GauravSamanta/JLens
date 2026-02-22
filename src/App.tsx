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

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="h-screen bg-gray-950 text-gray-100 flex flex-col">
        <Toolbar />
        {mode === 'explore' && (
          <>
            <JsonInput />
            {parseResult ? (
              <>
                <div className="flex flex-1 overflow-hidden">
                  <TreeView />
                  <DetailPanel />
                </div>
                <SearchBar />
              </>
            ) : (
              <main className="flex-1 flex items-center justify-center">
                <p className="text-gray-600 font-mono text-sm">No JSON loaded.</p>
              </main>
            )}
          </>
        )}
        {mode === 'diff' && <DiffView />}
        {mode === 'query' && <QueryPanel />}
      </div>
    </div>
  )
}

export default App
