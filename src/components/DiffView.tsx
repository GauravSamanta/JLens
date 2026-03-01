import { useUIStore } from '../stores/uiStore'
import { useDiff } from '../hooks/useDiff'
import { DiffInput } from './DiffInput'
import type { DiffEntry, DiffKind } from '../core/diff-types'

function diffColor(kind: DiffKind): string {
  switch (kind) {
    case 'added': return 'bg-syntax-string/10 text-syntax-string'
    case 'removed': return 'bg-error/10 text-error'
    case 'modified': return 'bg-syntax-number/10 text-syntax-number'
    case 'unchanged': return 'text-faint'
    default: { const _exhaustive: never = kind; return _exhaustive }
  }
}

function diffPrefix(kind: DiffKind): string {
  switch (kind) {
    case 'added': return '+'
    case 'removed': return '\u2212'
    case 'modified': return '~'
    case 'unchanged': return ' '
    default: { const _exhaustive: never = kind; return _exhaustive }
  }
}

function formatEntryValue(entry: DiffEntry): string {
  if (entry.kind === 'added') return JSON.stringify(entry.rightValue)
  if (entry.kind === 'removed') return JSON.stringify(entry.leftValue)
  if (entry.kind === 'modified') return `${JSON.stringify(entry.leftValue)} \u2192 ${JSON.stringify(entry.rightValue)}`
  return JSON.stringify(entry.leftValue)
}

function InlineDiffView({ entries }: { entries: DiffEntry[] }) {
  const changedEntries = entries.filter((e) => e.kind !== 'unchanged')

  return (
    <div className="font-mono text-[13px]">
      {changedEntries.length === 0 ? (
        <p className="p-4 text-sm text-faint">No differences found.</p>
      ) : (
        changedEntries.map((entry, i) => (
          <div key={i} className={`flex gap-2 px-4 py-1 ${diffColor(entry.kind)}`}>
            <span className="w-4 flex-shrink-0 text-center opacity-60">{diffPrefix(entry.kind)}</span>
            <span className="min-w-0 opacity-60">{entry.path}</span>
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
    <div className="flex font-mono text-[13px]">
      <div className="flex-1 border-r border-border">
        {changedEntries.length === 0 ? (
          <p className="p-4 text-faint">No differences.</p>
        ) : (
          changedEntries.map((entry, i) => (
            <div
              key={i}
              className={`px-4 py-1 ${entry.kind === 'removed' || entry.kind === 'modified' ? diffColor(entry.kind) : 'text-faint'}`}
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
          <p className="p-4 text-faint">No differences.</p>
        ) : (
          changedEntries.map((entry, i) => (
            <div
              key={i}
              className={`px-4 py-1 ${entry.kind === 'added' || entry.kind === 'modified' ? diffColor(entry.kind) : 'text-faint'}`}
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
  const diffResult = useDiff()

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <DiffInput />

      {diffResult && (
        <>
          <div className="flex items-center gap-4 px-4 py-2 border-b border-border">
            <span className="text-[11px] font-mono tracking-wide">
              <span className="text-syntax-string">{diffResult.added} added</span>
              <span className="text-faint">{' \u00b7 '}</span>
              <span className="text-error">{diffResult.removed} removed</span>
              <span className="text-faint">{' \u00b7 '}</span>
              <span className="text-syntax-number">{diffResult.modified} modified</span>
            </span>
            <div className="ml-auto flex gap-0.5">
              {(['inline', 'side-by-side'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setDiffViewStyle(style)}
                  className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                    diffViewStyle === style
                      ? 'bg-overlay text-text'
                      : 'text-faint hover:text-sub'
                  }`}
                >
                  {style === 'inline' ? 'Inline' : 'Side by Side'}
                </button>
              ))}
            </div>
          </div>

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
          <p className="font-mono text-xs tracking-wide text-faint">
            Paste JSON in both panels to compare
          </p>
        </div>
      )}
    </div>
  )
}
