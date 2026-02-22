import { Toolbar } from './components/Toolbar'
import { JsonInput } from './components/JsonInput'
import { useUIStore } from './stores/uiStore'
import { useJsonStore } from './stores/jsonStore'

function App() {
  const theme = useUIStore((s) => s.theme)
  const mode = useUIStore((s) => s.mode)
  const parseResult = useJsonStore((s) => s.parseResult)

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
        <Toolbar />
        {mode === 'explore' && (
          <>
            <JsonInput />
            <main className="flex-1 p-4">
              {parseResult ? (
                <p className="text-gray-500 font-mono text-sm">
                  Tree view will render here. {parseResult.totalNodes} nodes parsed.
                </p>
              ) : (
                <p className="text-gray-600 font-mono text-sm">
                  No JSON loaded.
                </p>
              )}
            </main>
          </>
        )}
        {mode === 'diff' && (
          <main className="flex-1 p-4">
            <p className="text-gray-500 font-mono text-sm">Diff view coming soon.</p>
          </main>
        )}
        {mode === 'query' && (
          <main className="flex-1 p-4">
            <p className="text-gray-500 font-mono text-sm">Query panel coming soon.</p>
          </main>
        )}
      </div>
    </div>
  )
}

export default App
