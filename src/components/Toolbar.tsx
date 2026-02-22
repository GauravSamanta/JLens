import { Sun, Moon, Link2 } from 'lucide-react'
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
  const isDark = theme === 'dark'

  return (
    <header className={`flex items-center justify-between px-5 py-3 border-b ${
      isDark ? 'border-border bg-mantle' : 'border-border-light bg-surface-light'
    }`}>
      <div className="flex items-center gap-8">
        <h1 className="text-[15px] font-semibold tracking-tight select-none font-mono">
          <span className="text-accent-blue">J</span>
          <span className={isDark ? 'text-text-primary' : 'text-text-light'}>Lens</span>
        </h1>
        <nav className="flex gap-0.5">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`rounded-md px-3 py-1 text-xs font-medium tracking-wide transition-all duration-150 ${
                mode === m.id
                  ? isDark
                    ? 'bg-accent-blue/15 text-accent-blue'
                    : 'bg-blue-100 text-blue-700'
                  : isDark
                    ? 'text-text-faint hover:text-text-secondary hover:bg-overlay/50'
                    : 'text-text-light-secondary hover:text-text-light hover:bg-surface-light'
              }`}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-1">
        {canShare && (
          <button
            onClick={copyShareUrl}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-all duration-150 ${
              isDark
                ? 'text-text-faint hover:text-text-secondary hover:bg-overlay/50'
                : 'text-text-light-secondary hover:text-text-light hover:bg-surface-light'
            }`}
            title="Copy share link"
          >
            <Link2 size={14} />
            {showCopied && <span className="text-accent-green text-[10px] font-medium">Copied</span>}
          </button>
        )}
        <button
          onClick={toggleTheme}
          className={`rounded-md p-1.5 transition-all duration-150 ${
            isDark
              ? 'text-text-faint hover:text-accent-yellow hover:bg-overlay/50'
              : 'text-text-light-secondary hover:text-amber-600 hover:bg-surface-light'
          }`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  )
}
