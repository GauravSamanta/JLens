import { useState } from 'react'
import { History, Trash2 } from 'lucide-react'
import { useQueryStore } from '../stores/queryStore'
import { useJsonPath } from '../hooks/useJsonPath'
import { JsonInput } from './JsonInput'

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

      {/* Query input */}
      <div className="border-b border-gray-800 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-mono">QUERY</span>
          <div className="flex-1 relative">
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => history.length > 0 && setShowHistory(true)}
              placeholder="$.store.book[*].author"
              className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1.5 font-mono text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
            {showHistory && history.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-800 rounded max-h-48 overflow-auto z-10">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800">
                  <span className="text-xs text-gray-500">History</span>
                  <button
                    onClick={() => { clearHistory(); setShowHistory(false) }}
                    className="text-gray-600 hover:text-gray-300"
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
                    className="w-full text-left px-3 py-1.5 font-mono text-xs text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`text-gray-500 hover:text-gray-300 ${showHistory ? 'text-gray-300' : ''}`}
            title="Query history"
          >
            <History size={16} />
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading && (
          <p className="text-gray-500 font-mono text-sm">Evaluating...</p>
        )}
        {error && (
          <p className="text-red-400 font-mono text-sm">{error}</p>
        )}
        {results !== null && !error && (
          <div>
            <p className="text-xs text-gray-500 font-mono mb-2">
              {Array.isArray(results) ? `${results.length} results` : '1 result'}
            </p>
            <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap break-all">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
        {!results && !error && !isLoading && (
          <p className="text-gray-600 font-mono text-sm">
            Enter a JSONPath expression to query the loaded JSON.
          </p>
        )}
      </div>
    </div>
  )
}
