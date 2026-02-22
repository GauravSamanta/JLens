import { useUIStore } from '../stores/uiStore'
import { useDiff } from '../hooks/useDiff'
import { DiffInput } from './DiffInput'
import type { DiffEntry } from '../core/diff-types'

function diffColor(kind: string, isDark: boolean): string {
  if (isDark) {
    switch (kind) {
      case 'added': return 'bg-accent-green/10 text-accent-green'
      case 'removed': return 'bg-accent-red/10 text-accent-red'
      case 'modified': return 'bg-accent-yellow/10 text-accent-yellow'
      default: return 'text-text-faint'
    }
  }
  switch (kind) {
    case 'added': return 'bg-green-50 text-green-800'
    case 'removed': return 'bg-red-50 text-red-800'
    case 'modified': return 'bg-amber-50 text-amber-800'
    default: return 'text-gray-500'
  }
}

function diffPrefix(kind: string): string {
  switch (kind) {
    case 'added': return '+'
    case 'removed': return '\u2212'
    case 'modified': return '~'
    default: return ' '
  }
}

function formatEntryValue(entry: DiffEntry): string {
  if (entry.kind === 'added') return JSON.stringify(entry.rightValue)
  if (entry.kind === 'removed') return JSON.stringify(entry.leftValue)
  if (entry.kind === 'modified') return `${JSON.stringify(entry.leftValue)} \u2192 ${JSON.stringify(entry.rightValue)}`
  return JSON.stringify(entry.leftValue)
}

function InlineDiffView({ entries, isDark }: { entries: DiffEntry[]; isDark: boolean }) {
  const changedEntries = entries.filter((e) => e.kind !== 'unchanged')

  return (
    <div className="font-mono text-[13px]">
      {changedEntries.length === 0 ? (
        <p className={`p-4 text-sm ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`}>No differences found.</p>
      ) : (
        changedEntries.map((entry, i) => (
          <div key={i} className={`flex gap-2 px-5 py-1 ${diffColor(entry.kind, isDark)}`}>
            <span className="w-4 flex-shrink-0 text-center opacity-60">{diffPrefix(entry.kind)}</span>
            <span className="min-w-0 opacity-60">{entry.path}</span>
            <span className="ml-auto flex-shrink-0">{formatEntryValue(entry)}</span>
          </div>
        ))
      )}
    </div>
  )
}

function SideBySideDiffView({ entries, isDark }: { entries: DiffEntry[]; isDark: boolean }) {
  const changedEntries = entries.filter((e) => e.kind !== 'unchanged')
  const border = isDark ? 'border-border' : 'border-border-light'

  return (
    <div className="flex font-mono text-[13px]">
      <div className={`flex-1 border-r ${border}`}>
        {changedEntries.length === 0 ? (
          <p className={`p-4 ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`}>No differences.</p>
        ) : (
          changedEntries.map((entry, i) => (
            <div
              key={i}
              className={`px-5 py-1 ${entry.kind === 'removed' || entry.kind === 'modified' ? diffColor(entry.kind, isDark) : (isDark ? 'text-subtle' : 'text-gray-300')}`}
            >
              <span className="opacity-50">{entry.path}: </span>
              {entry.kind === 'added' ? (
                <span className="opacity-30">\u2014</span>
              ) : (
                <span>{JSON.stringify(entry.leftValue)}</span>
              )}
            </div>
          ))
        )}
      </div>
      <div className="flex-1">
        {changedEntries.length === 0 ? (
          <p className={`p-4 ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`}>No differences.</p>
        ) : (
          changedEntries.map((entry, i) => (
            <div
              key={i}
              className={`px-5 py-1 ${entry.kind === 'added' || entry.kind === 'modified' ? diffColor(entry.kind, isDark) : (isDark ? 'text-subtle' : 'text-gray-300')}`}
            >
              <span className="opacity-50">{entry.path}: </span>
              {entry.kind === 'removed' ? (
                <span className="opacity-30">\u2014</span>
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

  const border = isDark ? 'border-border' : 'border-border-light'

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <DiffInput />

      {diffResult && (
        <>
          <div className={`flex items-center gap-4 px-5 py-2 border-b ${border}`}>
            <span className="text-[11px] font-mono tracking-wide">
              <span className="text-accent-green">{diffResult.added} added</span>
              <span className={isDark ? 'text-subtle' : 'text-gray-300'}>{' \u00b7 '}</span>
              <span className="text-accent-red">{diffResult.removed} removed</span>
              <span className={isDark ? 'text-subtle' : 'text-gray-300'}>{' \u00b7 '}</span>
              <span className="text-accent-yellow">{diffResult.modified} modified</span>
            </span>
            <div className="ml-auto flex gap-0.5">
              {(['inline', 'side-by-side'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setDiffViewStyle(style)}
                  className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                    diffViewStyle === style
                      ? isDark ? 'bg-overlay text-text-primary' : 'bg-white text-text-light shadow-sm'
                      : isDark ? 'text-text-faint hover:text-text-secondary' : 'text-text-light-secondary hover:text-text-light'
                  }`}
                >
                  {style === 'inline' ? 'Inline' : 'Side by Side'}
                </button>
              ))}
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
          <p className={`font-mono text-xs tracking-wide ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`}>
            Paste JSON in both panels to compare
          </p>
        </div>
      )}
    </div>
  )
}
