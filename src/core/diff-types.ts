export type DiffKind = 'added' | 'removed' | 'modified' | 'unchanged'

export interface DiffEntry {
  path: string
  kind: DiffKind
  leftValue?: unknown
  rightValue?: unknown
}

export interface DiffResult {
  entries: DiffEntry[]
  added: number
  removed: number
  modified: number
  unchanged: number
}
