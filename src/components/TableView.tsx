import { useState, useMemo } from 'react'
import { ArrowUp, ArrowDown, X } from 'lucide-react'
import { useUIStore } from '../stores/uiStore'

interface TableViewProps {
  data: Record<string, unknown>[]
  onClose: () => void
}

export function TableView({ data, onClose }: TableViewProps) {
  const isDark = useUIStore((s) => s.theme) === 'dark'
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

  const border = isDark ? 'border-border' : 'border-border-light'

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center justify-between px-4 py-2 border-b ${border}`}>
        <span className={`text-[10px] font-medium tracking-widest uppercase ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`}>
          Table ({data.length} \u00d7 {columns.length})
        </span>
        <button onClick={onClose} className={isDark ? 'text-subtle hover:text-text-secondary' : 'text-gray-400 hover:text-gray-600'}>
          <X size={13} />
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse font-mono text-[11px]">
          <thead>
            <tr className={`border-b ${border}`}>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className={`text-left px-3 py-1.5 cursor-pointer select-none whitespace-nowrap ${
                    isDark ? 'text-text-faint hover:text-text-secondary' : 'text-text-light-secondary hover:text-text-light'
                  }`}
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
              <tr key={i} className={`border-b ${isDark ? 'border-border/50 hover:bg-overlay/20' : 'border-border-light/50 hover:bg-black/[0.015]'}`}>
                {columns.map((col) => (
                  <td key={col} className={`px-3 py-1 whitespace-nowrap max-w-xs truncate ${isDark ? 'text-text-secondary' : 'text-text-light'}`}>
                    {row[col] === undefined || row[col] === null ? (
                      <span className={`italic ${isDark ? 'text-subtle' : 'text-gray-300'}`}>\u2014</span>
                    ) : typeof row[col] === 'object' ? (
                      <span className={isDark ? 'text-text-faint' : 'text-gray-400'}>{JSON.stringify(row[col])}</span>
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
