import { Search, ChevronUp, ChevronDown, X } from 'lucide-react'
import { useSearchStore } from '../stores/searchStore'
import { useJsonStore } from '../stores/jsonStore'
import { useSearch } from '../hooks/useSearch'
import { useEffect } from 'react'

export function SearchBar() {
  useSearch()

  const { query, setQuery, matchIds, activeMatchIndex, nextMatch, prevMatch, clearSearch } = useSearchStore()
  const { selectNode, expandToNode } = useJsonStore()

  useEffect(() => {
    if (matchIds.length > 0 && matchIds[activeMatchIndex]) {
      const nodeId = matchIds[activeMatchIndex]
      expandToNode(nodeId)
      selectNode(nodeId)
    }
  }, [activeMatchIndex, matchIds])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.shiftKey ? prevMatch() : nextMatch()
    }
    if (e.key === 'Escape') {
      clearSearch()
    }
  }

  return (
    <div className="flex items-center gap-2 border-t border-gray-800 px-4 py-2">
      <Search size={14} className="text-gray-500 flex-shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search keys and values... (key: or value: prefix)"
        className="flex-1 bg-transparent text-sm font-mono text-gray-200 placeholder-gray-600 focus:outline-none"
      />
      {query && (
        <>
          <span className="text-xs text-gray-500 font-mono tabular-nums">
            {matchIds.length > 0
              ? `${activeMatchIndex + 1} of ${matchIds.length}`
              : 'No matches'}
          </span>
          <button onClick={prevMatch} className="text-gray-500 hover:text-gray-300" title="Previous (Shift+Enter)">
            <ChevronUp size={14} />
          </button>
          <button onClick={nextMatch} className="text-gray-500 hover:text-gray-300" title="Next (Enter)">
            <ChevronDown size={14} />
          </button>
          <button onClick={clearSearch} className="text-gray-500 hover:text-gray-300" title="Clear (Esc)">
            <X size={14} />
          </button>
        </>
      )}
    </div>
  )
}
