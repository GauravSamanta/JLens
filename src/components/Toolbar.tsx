import { Sun, Moon, HelpCircle, Link2 } from 'lucide-react'
import { useUIStore, type AppMode } from '../stores/uiStore'
import { useShareUrl } from '../hooks/useShareUrl'

const modes: { id: AppMode; label: string }[] = [
  { id: 'explore', label: 'Explore' },
  { id: 'diff', label: 'Diff' },
  { id: 'query', label: 'Query' },
]

export function Toolbar() {
  const { mode, setMode, theme, toggleTheme } = useUIStore()
  const { copyShareUrl, canShare, showCopied } = useShareUrl()

  return (
    <header className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-blue-400">J</span><span className="text-gray-100">Lens</span>
        </h1>
        <nav className="flex gap-1">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === m.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        {canShare && (
          <button
            onClick={copyShareUrl}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
            title="Copy share link"
          >
            <Link2 size={16} />
            {showCopied && <span className="text-xs text-green-400">Copied!</span>}
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
          aria-label="Help"
        >
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  )
}
