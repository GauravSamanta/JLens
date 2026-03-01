import ChevronsDown from 'lucide-react/dist/esm/icons/chevrons-down'
import ChevronsUp from 'lucide-react/dist/esm/icons/chevrons-up'
import { useJsonStore } from '../stores/jsonStore'
import { useUIStore } from '../stores/uiStore'
import { Breadcrumbs } from './Breadcrumbs'

export function TreeToolbar() {
  const expandAll = useJsonStore((s) => s.expandAll)
  const collapseAll = useJsonStore((s) => s.collapseAll)
  const isDark = useUIStore((s) => s.theme) === 'dark'

  const btnClass = isDark
    ? 'text-text-faint hover:text-text-secondary hover:bg-overlay/50'
    : 'text-text-light-secondary hover:text-text-light hover:bg-gray-100'

  return (
    <div className={`flex items-center gap-2 px-4 py-1.5 border-b ${
      isDark ? 'border-border' : 'border-border-light'
    }`}>
      <Breadcrumbs />
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={expandAll}
          className={`rounded p-1 transition-colors ${btnClass}`}
          title="Expand all (Ctrl+E)"
        >
          <ChevronsDown size={14} />
        </button>
        <button
          onClick={collapseAll}
          className={`rounded p-1 transition-colors ${btnClass}`}
          title="Collapse all (Ctrl+Shift+E)"
        >
          <ChevronsUp size={14} />
        </button>
      </div>
    </div>
  )
}
