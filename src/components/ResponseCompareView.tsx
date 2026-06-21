import { useResponseCompare } from '../hooks/useResponseCompare'
import { useResponseCompareStore, type ResponseSideId, type ResponseSideState } from '../stores/responseCompareStore'
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

function formatStructureValue(entry: DiffEntry): string {
  if (entry.kind === 'added') return String(entry.rightValue)
  if (entry.kind === 'removed') return String(entry.leftValue)
  if (entry.kind === 'modified') return `${String(entry.leftValue)} \u2192 ${String(entry.rightValue)}`
  return String(entry.leftValue)
}

function RequestPanel({
  id,
  title,
  side,
}: {
  id: ResponseSideId
  title: string
  side: ResponseSideState
}) {
  const setInput = useResponseCompareStore((state) => state.setInput)
  const inputClass = 'bg-surface border-border text-text placeholder-faint focus:border-accent/40'

  return (
    <div className="flex-1 p-3 border-r last:border-r-0 border-border">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-medium tracking-wider uppercase text-faint">
          {title}
        </span>
        {side.status !== null && (
          <span className="font-mono text-[11px] text-sub">
            {side.status} {side.statusText}
            {side.durationMs !== null && ` · ${side.durationMs}ms`}
          </span>
        )}
      </div>
      <textarea
        value={side.input}
        onChange={(event) => setInput(id, event.target.value)}
        placeholder="Paste a URL or curl command..."
        className={`w-full h-32 resize-y rounded-lg border p-2.5 font-mono text-[13px] leading-relaxed focus:outline-none transition-colors ${inputClass}`}
        spellCheck={false}
      />
      {side.spec && (
        <p className="mt-1.5 font-mono text-[11px] text-faint truncate">
          {side.spec.method} {side.spec.url}
        </p>
      )}
      {side.warnings.length > 0 && (
        <div className="mt-2 space-y-1">
          {side.warnings.map((warning) => (
            <p key={warning} className="font-mono text-[11px] text-syntax-number">
              {warning}
            </p>
          ))}
        </div>
      )}
      {side.error && (
        <p className="mt-2 rounded-md border border-error/30 bg-error/10 p-2 font-mono text-[11px] text-error">
          {side.error}
        </p>
      )}
    </div>
  )
}

function StructureDiffList({ entries }: { entries: DiffEntry[] }) {
  const changedEntries = entries.filter((entry) => entry.kind !== 'unchanged')

  if (changedEntries.length === 0) {
    return <p className="p-4 text-sm text-faint">No structure differences found.</p>
  }

  return (
    <div className="font-mono text-[13px]">
      {changedEntries.map((entry, index) => (
        <div key={`${entry.path}-${index}`} className={`flex gap-2 px-4 py-1 ${diffColor(entry.kind)}`}>
          <span className="w-4 flex-shrink-0 text-center opacity-60">{diffPrefix(entry.kind)}</span>
          <span className="min-w-0 opacity-60">{entry.path}</span>
          <span className="ml-auto flex-shrink-0">{formatStructureValue(entry)}</span>
        </div>
      ))}
    </div>
  )
}

export function ResponseCompareView() {
  const { left, right, diffResult, fetchAndCompare, isLoading } = useResponseCompare()

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex border-b border-border">
        <RequestPanel id="left" title="Request A" side={left} />
        <RequestPanel id="right" title="Request B" side={right} />
      </div>

      <div className="flex items-center gap-3 px-4 py-2 border-b border-border">
        <button
          onClick={() => void fetchAndCompare()}
          disabled={isLoading}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            isLoading
              ? 'cursor-wait bg-overlay text-faint'
              : 'bg-accent/15 text-accent hover:bg-accent/20'
          }`}
        >
          {isLoading ? 'Fetching...' : 'Fetch & Compare'}
        </button>
        <span className="font-mono text-[11px] text-faint">
          Compares keys, nesting, array item shape, and value types.
        </span>
        {diffResult && (
          <span className="ml-auto font-mono text-[11px]">
            <span className="text-syntax-string">{diffResult.added} added</span>
            <span className="text-faint">{' · '}</span>
            <span className="text-error">{diffResult.removed} removed</span>
            <span className="text-faint">{' · '}</span>
            <span className="text-syntax-number">{diffResult.modified} type changes</span>
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {diffResult ? (
          <StructureDiffList entries={diffResult.entries} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-xs tracking-wide text-faint">
              Enter two requests to compare response structure
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
