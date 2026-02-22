import { useState } from 'react'
import { History, Trash2 } from 'lucide-react'
import { useQueryStore } from '../stores/queryStore'
import { useUIStore } from '../stores/uiStore'
import { useJsonPath } from '../hooks/useJsonPath'
import { JsonInput } from './JsonInput'
import { CopyButton } from './CopyButton'

export function QueryPanel() {
  const { expression, setExpression, results, error, history, clearHistory } = useQueryStore()
  const { isLoading } = useJsonPath()
  const isDark = useUIStore((s) => s.theme) === 'dark'
  const [showHistory, setShowHistory] = useState(false)

  const border = isDark ? 'border-border' : 'border-border-light'

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowHistory(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <JsonInput />

      <div className={`border-b px-5 py-2.5 ${border}`}>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-medium tracking-widest uppercase ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`}>
            Query
          </span>
          <div className="flex-1 relative">
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => history.length > 0 && setShowHistory(true)}
              placeholder="$.store.book[*].author"
              className={`w-full rounded-lg px-3 py-1.5 font-mono text-[13px] border focus:outline-none transition-colors ${
                isDark
                  ? 'bg-surface border-border text-text-primary placeholder-text-faint focus:border-accent-blue/40'
                  : 'bg-white border-border-light text-text-light placeholder-text-light-secondary focus:border-blue-400/50'
              }`}
            />
            {showHistory && history.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-1 border rounded-lg max-h-48 overflow-auto z-10 ${
                isDark ? 'bg-surface border-border' : 'bg-white border-border-light shadow-lg'
              }`}>
                <div className={`flex items-center justify-between px-3 py-1.5 border-b ${border}`}>
                  <span className={`text-[10px] tracking-widest uppercase ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`}>History</span>
                  <button
                    onClick={() => { clearHistory(); setShowHistory(false) }}
                    className={isDark ? 'text-subtle hover:text-text-secondary' : 'text-gray-400 hover:text-gray-600'}
                    title="Clear history"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setExpression(h)
                      setShowHistory(false)
                    }}
                    className={`w-full text-left px-3 py-1.5 font-mono text-[11px] transition-colors ${
                      isDark
                        ? 'text-text-faint hover:bg-overlay/50 hover:text-text-secondary'
                        : 'text-text-light-secondary hover:bg-black/[0.02] hover:text-text-light'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`transition-colors ${isDark ? 'text-subtle hover:text-text-secondary' : 'text-gray-400 hover:text-gray-600'} ${showHistory ? (isDark ? 'text-text-secondary' : 'text-text-light') : ''}`}
            title="Query history"
          >
            <History size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5">
        {isLoading && (
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full border border-t-transparent animate-spin ${isDark ? 'border-accent-blue' : 'border-blue-500'}`} />
            <p className={`font-mono text-xs ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`}>Evaluating\u2026</p>
          </div>
        )}
        {error && (
          <p className="text-accent-red font-mono text-[13px]">{error}</p>
        )}
        {results !== null && !error && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-[10px] font-medium tracking-widest uppercase ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`}>
                {Array.isArray(results) ? `${results.length} results` : '1 result'}
              </p>
              <CopyButton text={JSON.stringify(results, null, 2)} size={13} title="Copy results" />
            </div>
            <pre className={`font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-all ${isDark ? 'text-text-secondary' : 'text-text-light'}`}>
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
        {!results && !error && !isLoading && (
          <p className={`font-mono text-xs tracking-wide ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`}>
            Enter a JSONPath expression to query the loaded JSON
          </p>
        )}
      </div>
    </div>
  )
}
