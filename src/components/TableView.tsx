import { useState, useMemo } from 'react'
import ArrowUp from 'lucide-react/dist/esm/icons/arrow-up'
import ArrowDown from 'lucide-react/dist/esm/icons/arrow-down'
import X from 'lucide-react/dist/esm/icons/x'

interface TableViewProps {
  data: Record<string, unknown>[]
  onClose: () => void
}

export function TableView({ data, onClose }: TableViewProps) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const columns = useMemo(() => {
    const keys = new Set<string>()
    data.forEach((row) => Object.keys(row).forEach((k) => keys.add(k)))
    return Array.from(keys)
  }, [data])

  const sortedData = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal === bVal) return 0
      if (aVal === undefined || aVal === null) return 1
      if (bVal === undefined || bVal === null) return -1
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-[10px] font-medium tracking-widest uppercase text-faint">
          Table ({data.length} \u00d7 {columns.length})
        </span>
        <button onClick={onClose} className="text-faint hover:text-sub">
          <X size={13} />
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse font-mono text-[11px]">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="text-left px-3 py-1.5 cursor-pointer select-none whitespace-nowrap text-faint hover:text-sub"
                >
                  <span className="flex items-center gap-1">
                    {col}
                    {sortKey === col && (sortDir === 'asc' ? <ArrowUp size={9} /> : <ArrowDown size={9} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-overlay/20">
                {columns.map((col) => (
                  <td key={col} className="px-3 py-1 whitespace-nowrap max-w-xs truncate text-sub">
                    {row[col] === undefined || row[col] === null ? (
                      <span className="italic text-faint">\u2014</span>
                    ) : typeof row[col] === 'object' ? (
                      <span className="text-faint">{JSON.stringify(row[col])}</span>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
