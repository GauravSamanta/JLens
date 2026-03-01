import { useState } from 'react'
import History from 'lucide-react/dist/esm/icons/history'
import Trash2 from 'lucide-react/dist/esm/icons/trash-2'
import { useQueryStore } from '../stores/queryStore'
import { useJsonPath } from '../hooks/useJsonPath'
import { JsonInput } from './JsonInput'
import { CopyButton } from './CopyButton'

export function QueryPanel() {
  const { expression, setExpression, results, error, history, clearHistory } = useQueryStore()
  const { isLoading } = useJsonPath()
  const [showHistory, setShowHistory] = useState(false)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowHistory(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <JsonInput />

      <div className="border-b px-4 py-2.5 border-border">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium tracking-wider uppercase text-faint">
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
              className="w-full rounded-lg px-3 py-1.5 font-mono text-[13px] border focus:outline-none transition-colors bg-surface border-border text-text placeholder-faint focus:border-accent/40"
            />
            {showHistory && history.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg max-h-48 overflow-auto z-10 bg-surface border-border">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
                  <span className="text-[10px] tracking-wider uppercase text-faint">History</span>
                  <button
                    onClick={() => { clearHistory(); setShowHistory(false) }}
                    className="text-faint hover:text-sub"
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
                    className="w-full text-left px-3 py-1.5 font-mono text-[11px] transition-colors text-faint hover:bg-overlay/50 hover:text-sub"
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`transition-colors text-faint hover:text-sub ${showHistory ? 'text-sub' : ''}`}
            title="Query history"
          >
            <History size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-t-transparent animate-spin border-accent" />
            <p className="font-mono text-xs text-faint">Evaluating…</p>
          </div>
        )}
        {error && (
          <p className="text-error font-mono text-[13px]">{error}</p>
        )}
        {results !== null && !error && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-medium tracking-wider uppercase text-faint">
                {Array.isArray(results) ? `${results.length} results` : '1 result'}
              </p>
              <CopyButton text={JSON.stringify(results, null, 2)} size={13} title="Copy results" />
            </div>
            <pre className="font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-all text-sub">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
        {!results && !error && !isLoading && (
          <p className="font-mono text-xs tracking-wide text-faint">
            Enter a JSONPath expression to query the loaded JSON
          </p>
        )}
      </div>
    </div>
  )
}
