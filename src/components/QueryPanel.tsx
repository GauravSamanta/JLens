import { useState } from 'react'
import { History, Trash2 } from 'lucide-react'
import { useQueryStore } from '../stores/queryStore'
import { useUIStore } from '../stores/uiStore'
import { useJsonPath } from '../hooks/useJsonPath'
import { JsonInput } from './JsonInput'

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

      <div className={`border-b px-4 py-2 ${border}`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono ${isDark ? 'text-text-faint' : 'text-gray-400'}`}>QUERY</span>
          <div className="flex-1 relative">
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => history.length > 0 && setShowHistory(true)}
              placeholder="$.store.book[*].author"
              className={`w-full rounded px-3 py-1.5 font-mono text-sm border focus:outline-none ${
                isDark
                  ? 'bg-surface border-border text-text-primary placeholder-text-faint focus:border-overlay'
                  : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400 focus:border-gray-400'
              }`}
            />
            {showHistory && history.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-1 border rounded max-h-48 overflow-auto z-10 ${
                isDark ? 'bg-surface border-border' : 'bg-white border-gray-200 shadow-lg'
              }`}>
                <div className={`flex items-center justify-between px-3 py-1.5 border-b ${border}`}>
                  <span className={`text-xs ${isDark ? 'text-text-faint' : 'text-gray-400'}`}>History</span>
                  <button
                    onClick={() => { clearHistory(); setShowHistory(false) }}
                    className={isDark ? 'text-subtle hover:text-text-secondary' : 'text-gray-400 hover:text-gray-600'}
                    title="Clear history"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setExpression(h)
                      setShowHistory(false)
                    }}
                    className={`w-full text-left px-3 py-1.5 font-mono text-xs ${
                      isDark
                        ? 'text-text-secondary hover:bg-overlay hover:text-text-primary'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
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
            className={`${isDark ? 'text-text-faint hover:text-text-secondary' : 'text-gray-400 hover:text-gray-600'} ${showHistory ? (isDark ? 'text-text-secondary' : 'text-gray-600') : ''}`}
            title="Query history"
          >
            <History size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading && (
          <p className={`font-mono text-sm ${isDark ? 'text-text-faint' : 'text-gray-400'}`}>Evaluating...</p>
        )}
        {error && (
          <p className="text-accent-red font-mono text-sm">{error}</p>
        )}
        {results !== null && !error && (
          <div>
            <p className={`text-xs font-mono mb-2 ${isDark ? 'text-text-faint' : 'text-gray-400'}`}>
              {Array.isArray(results) ? `${results.length} results` : '1 result'}
            </p>
            <pre className={`font-mono text-sm whitespace-pre-wrap break-all ${isDark ? 'text-text-secondary' : 'text-gray-700'}`}>
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
        {!results && !error && !isLoading && (
          <p className={`font-mono text-sm ${isDark ? 'text-text-faint' : 'text-gray-400'}`}>
            Enter a JSONPath expression to query the loaded JSON.
          </p>
        )}
      </div>
    </div>
  )
}
