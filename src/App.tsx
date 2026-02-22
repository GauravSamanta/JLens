import { Toolbar } from './components/Toolbar'
import { useUIStore } from './stores/uiStore'

function App() {
  const theme = useUIStore((s) => s.theme)

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <Toolbar />
        <main className="p-4">
          <p className="text-gray-500 font-mono text-sm">Paste or upload JSON to get started.</p>
        </main>
      </div>
    </div>
  )
}

export default App
