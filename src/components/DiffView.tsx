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

function diffColorLight(kind: string): string {
  switch (kind) {
    case 'added': return 'bg-green-50 text-green-800'
    case 'removed': return 'bg-red-50 text-red-800'
    case 'modified': return 'bg-yellow-50 text-yellow-800'
    default: return 'text-gray-500'
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

function InlineDiffView({ entries, isDark }: { entries: DiffEntry[]; isDark: boolean }) {
  const changedEntries = entries.filter((e) => e.kind !== 'unchanged')
  const colorFn = isDark ? diffColor : diffColorLight

  return (
    <div className="font-mono text-sm">
      {changedEntries.length === 0 ? (
        <p className={`p-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No differences found.</p>
      ) : (
        changedEntries.map((entry, i) => (
          <div key={i} className={`flex gap-2 px-4 py-1 ${colorFn(entry.kind)}`}>
            <span className="w-4 flex-shrink-0 text-center">{diffPrefix(entry.kind)}</span>
            <span className={`min-w-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{entry.path}</span>
            <span className="ml-auto flex-shrink-0">{formatEntryValue(entry)}</span>
          </div>
        ))
      )}
    </div>
  )
}

function SideBySideDiffView({ entries, isDark }: { entries: DiffEntry[]; isDark: boolean }) {
  const changedEntries = entries.filter((e) => e.kind !== 'unchanged')
  const colorFn = isDark ? diffColor : diffColorLight
  const border = isDark ? 'border-gray-800' : 'border-gray-200'

  return (
    <div className="flex font-mono text-sm">
      <div className={`flex-1 border-r ${border}`}>
        {changedEntries.length === 0 ? (
          <p className={`p-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No differences.</p>
        ) : (
          changedEntries.map((entry, i) => (
            <div
              key={i}
              className={`px-4 py-1 ${entry.kind === 'removed' || entry.kind === 'modified' ? colorFn(entry.kind) : (isDark ? 'text-gray-600' : 'text-gray-400')}`}
            >
              <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{entry.path}: </span>
              {entry.kind === 'added' ? (
                <span className={`italic ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>—</span>
              ) : (
                <span>{JSON.stringify(entry.leftValue)}</span>
              )}
            </div>
          ))
        )}
      </div>
      <div className="flex-1">
        {changedEntries.length === 0 ? (
          <p className={`p-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No differences.</p>
        ) : (
          changedEntries.map((entry, i) => (
            <div
              key={i}
              className={`px-4 py-1 ${entry.kind === 'added' || entry.kind === 'modified' ? colorFn(entry.kind) : (isDark ? 'text-gray-600' : 'text-gray-400')}`}
            >
              <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{entry.path}: </span>
              {entry.kind === 'removed' ? (
                <span className={`italic ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>—</span>
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
  const isDark = useUIStore((s) => s.theme) === 'dark'
  const diffResult = useDiff()

  const border = isDark ? 'border-gray-800' : 'border-gray-200'

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <DiffInput />

      {diffResult && (
        <>
          <div className={`flex items-center gap-4 px-4 py-2 border-b ${border}`}>
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
                className={`px-2 py-1 text-xs rounded ${
                  diffViewStyle === 'inline'
                    ? (isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800')
                    : (isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')
                }`}
              >
                Inline
              </button>
              <button
                onClick={() => setDiffViewStyle('side-by-side')}
                className={`px-2 py-1 text-xs rounded ${
                  diffViewStyle === 'side-by-side'
                    ? (isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800')
                    : (isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')
                }`}
              >
                Side by Side
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {diffViewStyle === 'inline' ? (
              <InlineDiffView entries={diffResult.entries} isDark={isDark} />
            ) : (
              <SideBySideDiffView entries={diffResult.entries} isDark={isDark} />
            )}
          </div>
        </>
      )}

      {!diffResult && (
        <div className="flex-1 flex items-center justify-center">
          <p className={`font-mono text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            Paste JSON in both panels to compare.
          </p>
        </div>
      )}
    </div>
  )
}
