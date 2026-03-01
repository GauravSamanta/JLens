import Sun from 'lucide-react/dist/esm/icons/sun'
import Moon from 'lucide-react/dist/esm/icons/moon'
import Link2 from 'lucide-react/dist/esm/icons/link-2'
import Minimize2 from 'lucide-react/dist/esm/icons/minimize-2'
import Maximize2 from 'lucide-react/dist/esm/icons/maximize-2'
import HelpCircle from 'lucide-react/dist/esm/icons/help-circle'
import { useUIStore, type AppMode } from '../stores/uiStore'
import { useShareUrl } from '../hooks/useShareUrl'

const modes: { id: AppMode; label: string }[] = [
  { id: 'explore', label: 'Explore' },
  { id: 'diff', label: 'Diff' },
  { id: 'query', label: 'Query' },
]

const copiedLabel = <span className="text-syntax-string text-[10px] font-medium">Copied</span>

export function Toolbar() {
  const { mode, setMode, theme, toggleTheme, rawViewFormat, toggleRawViewFormat, toggleShortcuts } = useUIStore()
  const { copyShareUrl, canShare, showCopied } = useShareUrl()

  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface">
      <div className="flex items-center gap-6">
        <h1 className="text-[15px] font-semibold tracking-tight select-none font-mono">
          <span className="text-accent">J</span>
          <span className="text-text">Lens</span>
        </h1>
        <nav className="flex gap-0.5">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all duration-150 ${
                mode === m.id
                  ? 'bg-accent/15 text-accent'
                  : 'text-faint hover:text-sub hover:bg-overlay/50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={toggleRawViewFormat}
          className="rounded-md p-1.5 transition-all duration-150 text-faint hover:text-sub hover:bg-overlay/50"
          aria-label={rawViewFormat === 'pretty' ? 'Minify' : 'Pretty print'}
          title={rawViewFormat === 'pretty' ? 'Minify' : 'Pretty print'}
        >
          {rawViewFormat === 'pretty' ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
        {canShare && (
          <button
            onClick={copyShareUrl}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-all duration-150 text-faint hover:text-sub hover:bg-overlay/50"
            title="Copy share link"
          >
            <Link2 size={14} />
            {showCopied && copiedLabel}
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="rounded-md p-1.5 transition-all duration-150 text-faint hover:text-syntax-number hover:bg-overlay/50"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button
          onClick={toggleShortcuts}
          className="rounded-md p-1.5 transition-all duration-150 text-faint hover:text-sub hover:bg-overlay/50"
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
        >
          <HelpCircle size={15} />
        </button>
      </div>
    </header>
  )
}
