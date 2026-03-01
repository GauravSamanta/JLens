import Search from 'lucide-react/dist/esm/icons/search'
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up'
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down'
import X from 'lucide-react/dist/esm/icons/x'
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

  const btnClass = 'text-faint hover:text-sub'

  return (
    <div className="flex items-center gap-2 border-t px-4 py-2 border-border bg-surface">
      <Search size={13} className="text-faint" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search keys & values…"
        className="flex-1 bg-transparent text-[13px] font-mono focus:outline-none text-text placeholder-faint"
        data-search-input
      />
      {query && (
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-mono tabular-nums text-faint">
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
