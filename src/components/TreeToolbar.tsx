import ChevronsDown from 'lucide-react/dist/esm/icons/chevrons-down'
import ChevronsUp from 'lucide-react/dist/esm/icons/chevrons-up'
import { useJsonStore } from '../stores/jsonStore'
import { Breadcrumbs } from './Breadcrumbs'

export function TreeToolbar() {
  const expandAll = useJsonStore((s) => s.expandAll)
  const collapseAll = useJsonStore((s) => s.collapseAll)

  const btnClass = 'text-faint hover:text-sub hover:bg-overlay/50'

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
      <Breadcrumbs />
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={expandAll}
          className={`rounded p-1.5 transition-colors ${btnClass}`}
          title="Expand all (Ctrl+E)"
        >
          <ChevronsDown size={14} />
        </button>
        <button
          onClick={collapseAll}
          className={`rounded p-1.5 transition-colors ${btnClass}`}
          title="Collapse all (Ctrl+Shift+E)"
        >
          <ChevronsUp size={14} />
        </button>
      </div>
    </div>
  )
}
