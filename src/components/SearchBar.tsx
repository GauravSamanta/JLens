import { Search, ChevronUp, ChevronDown, X } from 'lucide-react'
import { useSearchStore } from '../stores/searchStore'
import { useJsonStore } from '../stores/jsonStore'
import { useUIStore } from '../stores/uiStore'
import { useSearch } from '../hooks/useSearch'
import { useEffect } from 'react'

export function SearchBar() {
  useSearch()

  const { query, setQuery, matchIds, activeMatchIndex, nextMatch, prevMatch, clearSearch } = useSearchStore()
  const { selectNode, expandToNode } = useJsonStore()
  const isDark = useUIStore((s) => s.theme) === 'dark'

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
    <div className={`flex items-center gap-2 border-t px-4 py-2 ${isDark ? 'border-border' : 'border-border-light'}`}>
      <Search size={14} className={`flex-shrink-0 ${isDark ? 'text-text-faint' : 'text-gray-400'}`} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search keys and values... (key: or value: prefix)"
        className={`flex-1 bg-transparent text-sm font-mono focus:outline-none ${
          isDark
            ? 'text-text-primary placeholder-text-faint'
            : 'text-gray-800 placeholder-gray-400'
        }`}
        data-search-input
      />
      {query && (
        <>
          <span className={`text-xs font-mono tabular-nums ${isDark ? 'text-text-faint' : 'text-gray-400'}`}>
            {matchIds.length > 0
              ? `${activeMatchIndex + 1} of ${matchIds.length}`
              : 'No matches'}
          </span>
          <button onClick={prevMatch} className={`${isDark ? 'text-text-faint hover:text-text-secondary' : 'text-gray-400 hover:text-gray-600'}`} title="Previous (Shift+Enter)">
            <ChevronUp size={14} />
          </button>
          <button onClick={nextMatch} className={`${isDark ? 'text-text-faint hover:text-text-secondary' : 'text-gray-400 hover:text-gray-600'}`} title="Next (Enter)">
            <ChevronDown size={14} />
          </button>
          <button onClick={clearSearch} className={`${isDark ? 'text-text-faint hover:text-text-secondary' : 'text-gray-400 hover:text-gray-600'}`} title="Clear (Esc)">
            <X size={14} />
          </button>
        </>
      )}
    </div>
  )
}
