import Search from 'lucide-react/dist/esm/icons/search'
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up'
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down'
import X from 'lucide-react/dist/esm/icons/x'
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

  const btnClass = isDark
    ? 'text-text-faint hover:text-text-secondary'
    : 'text-text-light-secondary hover:text-text-light'

  return (
    <div className={`flex items-center gap-2 border-t px-5 py-2 ${isDark ? 'border-border bg-mantle' : 'border-border-light bg-surface-light'}`}>
      <Search size={13} className={isDark ? 'text-subtle' : 'text-gray-400'} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search keys & values…"
        className={`flex-1 bg-transparent text-[13px] font-mono focus:outline-none ${
          isDark ? 'text-text-primary placeholder-text-faint' : 'text-text-light placeholder-text-light-secondary'
        }`}
        data-search-input
      />
      {query && (
        <div className="flex items-center gap-1">
          <span className={`text-[11px] font-mono tabular-nums ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`}>
            {matchIds.length > 0
              ? `${activeMatchIndex + 1}/${matchIds.length}`
              : '0'}
          </span>
          <button onClick={prevMatch} className={btnClass} title="Previous"><ChevronUp size={13} /></button>
          <button onClick={nextMatch} className={btnClass} title="Next"><ChevronDown size={13} /></button>
          <button onClick={clearSearch} className={btnClass} title="Clear"><X size={13} /></button>
        </div>
      )}
    </div>
  )
}
