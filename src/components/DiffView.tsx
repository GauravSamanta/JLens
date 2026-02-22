import { useUIStore } from '../stores/uiStore'
import { useDiff } from '../hooks/useDiff'
import { DiffInput } from './DiffInput'
import type { DiffEntry } from '../core/diff-types'

function diffColor(kind: string): string {
  switch (kind) {
    case 'added': return 'bg-green-900/30 text-green-300'
    case 'removed': return 'bg-red-900/30 text-red-300'
    case 'modified': return 'bg-yellow-900/30 text-yellow-300'
    default: return 'text-gray-400'
  }
}

function diffPrefix(kind: string): string {
  switch (kind) {
    case 'added': return '+'
    case 'removed': return '-'
    case 'modified': return '~'
    default: return ' '
  }
}

function formatEntryValue(entry: DiffEntry): string {
  if (entry.kind === 'added') return JSON.stringify(entry.rightValue)
  if (entry.kind === 'removed') return JSON.stringify(entry.leftValue)
  if (entry.kind === 'modified') return `${JSON.stringify(entry.leftValue)} → ${JSON.stringify(entry.rightValue)}`
  return JSON.stringify(entry.leftValue)
}

function InlineDiffView({ entries }: { entries: DiffEntry[] }) {
  const changedEntries = entries.filter((e) => e.kind !== 'unchanged')

  return (
    <div className="font-mono text-sm">
      {changedEntries.length === 0 ? (
        <p className="text-gray-500 p-4">No differences found.</p>
      ) : (
        changedEntries.map((entry, i) => (
          <div key={i} className={`flex gap-2 px-4 py-1 ${diffColor(entry.kind)}`}>
            <span className="w-4 flex-shrink-0 text-center">{diffPrefix(entry.kind)}</span>
            <span className="text-gray-400 min-w-0">{entry.path}</span>
            <span className="ml-auto flex-shrink-0">{formatEntryValue(entry)}</span>
          </div>
        ))
      )}
    </div>
  )
}

function SideBySideDiffView({ entries }: { entries: DiffEntry[] }) {
  const changedEntries = entries.filter((e) => e.kind !== 'unchanged')

  return (
    <div className="flex font-mono text-sm">
      {/* Left */}
      <div className="flex-1 border-r border-gray-800">
        {changedEntries.length === 0 ? (
          <p className="text-gray-500 p-4">No differences.</p>
        ) : (
          changedEntries.map((entry, i) => (
            <div
              key={i}
              className={`px-4 py-1 ${entry.kind === 'removed' || entry.kind === 'modified' ? diffColor(entry.kind) : 'text-gray-600'}`}
            >
              <span className="text-gray-500">{entry.path}: </span>
              {entry.kind === 'added' ? (
                <span className="text-gray-600 italic">—</span>
              ) : (
                <span>{JSON.stringify(entry.leftValue)}</span>
              )}
            </div>
          ))
        )}
      </div>
      {/* Right */}
      <div className="flex-1">
        {changedEntries.length === 0 ? (
          <p className="text-gray-500 p-4">No differences.</p>
        ) : (
          changedEntries.map((entry, i) => (
            <div
              key={i}
              className={`px-4 py-1 ${entry.kind === 'added' || entry.kind === 'modified' ? diffColor(entry.kind) : 'text-gray-600'}`}
            >
              <span className="text-gray-500">{entry.path}: </span>
              {entry.kind === 'removed' ? (
                <span className="text-gray-600 italic">—</span>
              ) : (
                <span>{JSON.stringify(entry.rightValue)}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function DiffView() {
  const { diffViewStyle, setDiffViewStyle } = useUIStore()
  const diffResult = useDiff()

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <DiffInput />

      {diffResult && (
        <>
          {/* Summary bar */}
          <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-800">
            <span className="text-xs font-mono">
              <span className="text-green-400">{diffResult.added} added</span>
              {', '}
              <span className="text-red-400">{diffResult.removed} removed</span>
              {', '}
              <span className="text-yellow-400">{diffResult.modified} modified</span>
            </span>
            <div className="ml-auto flex gap-1">
              <button
                onClick={() => setDiffViewStyle('inline')}
                className={`px-2 py-1 text-xs rounded ${diffViewStyle === 'inline' ? 'bg-gray-700 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Inline
              </button>
              <button
                onClick={() => setDiffViewStyle('side-by-side')}
                className={`px-2 py-1 text-xs rounded ${diffViewStyle === 'side-by-side' ? 'bg-gray-700 text-gray-200' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Side by Side
              </button>
            </div>
          </div>

          {/* Diff content */}
          <div className="flex-1 overflow-auto">
            {diffViewStyle === 'inline' ? (
              <InlineDiffView entries={diffResult.entries} />
            ) : (
              <SideBySideDiffView entries={diffResult.entries} />
            )}
          </div>
        </>
      )}

      {!diffResult && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 font-mono text-sm">Paste JSON in both panels to compare.</p>
        </div>
      )}
    </div>
  )
}
