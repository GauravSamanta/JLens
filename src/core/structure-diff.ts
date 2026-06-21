import type { DiffEntry, DiffResult } from './diff-types'

type StructureKind = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'

interface StructureNode {
  kind: StructureKind
  children?: Map<string, StructureNode>
  element?: StructureNode
  mixed?: StructureNode[]
}

function primitiveKind(value: unknown): StructureKind {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value as StructureKind
}

function sameStructure(left: StructureNode, right: StructureNode): boolean {
  if (left.kind !== right.kind) return false
  if (left.kind === 'object') {
    const leftKeys = [...(left.children?.keys() ?? [])]
    const rightKeys = [...(right.children?.keys() ?? [])]
    if (leftKeys.length !== rightKeys.length) return false
    return leftKeys.every((key) => {
      const leftChild = left.children?.get(key)
      const rightChild = right.children?.get(key)
      return leftChild !== undefined && rightChild !== undefined && sameStructure(leftChild, rightChild)
    })
  }
  if (left.kind === 'array') {
    if (!left.element || !right.element) return left.element === right.element
    return sameStructure(left.element, right.element)
  }
  return true
}

function mergeStructure(left: StructureNode, right: StructureNode): StructureNode {
  if (sameStructure(left, right)) return left
  if (left.kind !== right.kind) return { kind: 'array', mixed: [left, right] }

  if (left.kind === 'object') {
    const children = new Map<string, StructureNode>()
    const keys = new Set([...(left.children?.keys() ?? []), ...(right.children?.keys() ?? [])])
    for (const key of keys) {
      const leftChild = left.children?.get(key)
      const rightChild = right.children?.get(key)
      if (leftChild && rightChild) children.set(key, mergeStructure(leftChild, rightChild))
      else if (leftChild) children.set(key, leftChild)
      else if (rightChild) children.set(key, rightChild)
    }
    return { kind: 'object', children }
  }

  if (left.kind === 'array') {
    if (!left.element) return right
    if (!right.element) return left
    return { kind: 'array', element: mergeStructure(left.element, right.element) }
  }

  return { kind: 'array', mixed: [left, right] }
}

function toStructure(value: unknown): StructureNode {
  const kind = primitiveKind(value)

  if (kind === 'object') {
    const children = new Map<string, StructureNode>()
    for (const [key, childValue] of Object.entries(value as Record<string, unknown>)) {
      children.set(key, toStructure(childValue))
    }
    return { kind: 'object', children }
  }

  if (kind === 'array') {
    let element: StructureNode | undefined
    for (const item of value as unknown[]) {
      const itemStructure = toStructure(item)
      element = element ? mergeStructure(element, itemStructure) : itemStructure
    }
    return { kind: 'array', element }
  }

  return { kind }
}

function label(node: StructureNode | undefined): string {
  if (!node) return 'empty array'
  if (node.mixed) return `mixed(${node.mixed.map(label).join(' | ')})`
  return node.kind
}

export function diffJsonStructure(left: unknown, right: unknown): DiffResult {
  const entries: DiffEntry[] = []
  const leftStructure = toStructure(left)
  const rightStructure = toStructure(right)

  function walk(l: StructureNode | undefined, r: StructureNode | undefined, path: string): void {
    if (!l && r) {
      entries.push({ path, kind: 'added', rightValue: label(r) })
      return
    }
    if (l && !r) {
      entries.push({ path, kind: 'removed', leftValue: label(l) })
      return
    }
    if (!l || !r) return

    if (l.kind !== r.kind) {
      entries.push({ path, kind: 'modified', leftValue: label(l), rightValue: label(r) })
      return
    }

    if (l.kind === 'object') {
      const keys = new Set([...(l.children?.keys() ?? []), ...(r.children?.keys() ?? [])])
      for (const key of keys) {
        walk(l.children?.get(key), r.children?.get(key), `${path}.${key}`)
      }
      return
    }

    if (l.kind === 'array') {
      if (!l.element && !r.element) return
      walk(l.element, r.element, `${path}[]`)
      return
    }

    entries.push({ path, kind: 'unchanged', leftValue: l.kind, rightValue: r.kind })
  }

  walk(leftStructure, rightStructure, '$')

  let added = 0, removed = 0, modified = 0, unchanged = 0
  for (const entry of entries) {
    switch (entry.kind) {
      case 'added': added++; break
      case 'removed': removed++; break
      case 'modified': modified++; break
      case 'unchanged': unchanged++; break
      default: { const _exhaustive: never = entry.kind; return _exhaustive }
    }
  }

  return { entries, added, removed, modified, unchanged }
}
