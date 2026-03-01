import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useUIStore, type AppMode } from '../stores/uiStore'

interface Shortcut {
  keys: string[]
  description: string
}

const globalShortcuts: Shortcut[] = [
  { keys: ['Ctrl', 'K'], description: 'Focus search' },
  { keys: ['?'], description: 'Toggle shortcuts' },
]

const modeShortcuts: Record<AppMode, Shortcut[]> = {
  explore: [
    { keys: ['Ctrl', 'E'], description: 'Expand all nodes' },
    { keys: ['Ctrl', 'Shift', 'E'], description: 'Collapse all nodes' },
  ],
  diff: [],
  query: [],
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded bg-overlay/60 border border-border text-[10px] font-mono font-medium text-text-secondary">
      {children}
    </kbd>
  )
}

export function ShortcutsModal() {
  const { showShortcuts, setShowShortcuts, mode } = useUIStore()

  useEffect(() => {
    if (!showShortcuts) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowShortcuts(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showShortcuts, setShowShortcuts])

  if (!showShortcuts) return null

  const currentModeShortcuts = modeShortcuts[mode]
  const modeName = mode.charAt(0).toUpperCase() + mode.slice(1)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => setShowShortcuts(false)}
    >
      <div
        className="bg-mantle border border-border rounded-xl p-5 w-80 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Keyboard Shortcuts</h2>
          <button
            onClick={() => setShowShortcuts(false)}
            className="text-text-faint hover:text-text-secondary p-0.5"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-[10px] font-medium tracking-widest uppercase text-muted mb-2">Global</h3>
            <div className="space-y-2">
              {globalShortcuts.map((s) => (
                <div key={s.description} className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{s.description}</span>
                  <div className="flex items-center gap-0.5">
                    {s.keys.map((k) => <Kbd key={k}>{k}</Kbd>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {currentModeShortcuts.length > 0 && (
            <div>
              <h3 className="text-[10px] font-medium tracking-widest uppercase text-muted mb-2">{modeName}</h3>
              <div className="space-y-2">
                {currentModeShortcuts.map((s) => (
                  <div key={s.description} className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">{s.description}</span>
                    <div className="flex items-center gap-0.5">
                      {s.keys.map((k, i) => <Kbd key={`${k}-${i}`}>{k}</Kbd>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
