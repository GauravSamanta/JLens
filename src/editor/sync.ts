import type { EditorState } from '@codemirror/state'
import type { SyntaxNode } from '@lezer/common'
import { syntaxTree } from '@codemirror/language'

export function getJsonPathAtPosition(state: EditorState, pos: number): string | null {
  const tree = syntaxTree(state)
  let node = tree.resolveInner(pos, -1)

  if (!node || node.name === 'JsonText') return null

  const segments: string[] = []
  let current = node

  while (current.parent) {
    if (current.parent.name === 'Property') {
      const propName = current.parent.getChild('PropertyName')
      if (propName) {
        const name = state.doc.sliceString(propName.from + 1, propName.to - 1)
        segments.unshift(`.${name}`)
      }
      current = current.parent
    } else if (current.parent.name === 'Array') {
      let index = 0
      let sibling = current.prevSibling
      while (sibling) {
        if (sibling.name !== ',' && sibling.name !== '[') {
          index++
        }
        sibling = sibling.prevSibling
      }
      segments.unshift(`[${index}]`)
      current = current.parent
    } else {
      current = current.parent
    }
  }

  return '$' + segments.join('')
}

export function getPositionForPath(state: EditorState, path: string): { from: number; to: number } | null {
  const tree = syntaxTree(state)
  const root = tree.topNode

  if (!root || root.name !== 'JsonText') return null
  if (path === '$') {
    const value = root.firstChild
    return value ? { from: value.from, to: value.to } : null
  }

  const parts = parsePath(path)
  if (parts.length === 0) return null

  let currentNode = root.firstChild
  if (!currentNode) return null

  for (const part of parts) {
    if (!currentNode) return null

    if (part.type === 'key') {
      if (currentNode.name !== 'Object') return null
      let found = false
      let child: SyntaxNode | null = currentNode.firstChild
      while (child) {
        if (child.name === 'Property') {
          const propName: SyntaxNode | null = child.getChild('PropertyName')
          if (propName) {
            const name = state.doc.sliceString(propName.from + 1, propName.to - 1)
            if (name === part.value) {
              const valueNode: SyntaxNode | null = propName.nextSibling
              currentNode = valueNode?.name === ':' ? valueNode.nextSibling : valueNode
              found = true
              break
            }
          }
        }
        child = child.nextSibling
      }
      if (!found) return null
    } else {
      if (currentNode.name !== 'Array') return null
      let idx = 0
      let child: SyntaxNode | null = currentNode.firstChild
      let found = false
      while (child) {
        if (child.name !== ',' && child.name !== '[' && child.name !== ']') {
          if (idx === part.index) {
            currentNode = child
            found = true
            break
          }
          idx++
        }
        child = child.nextSibling
      }
      if (!found) return null
    }
  }

  return currentNode ? { from: currentNode.from, to: currentNode.to } : null
}

interface PathPartKey { type: 'key'; value: string }
interface PathPartIndex { type: 'index'; index: number }
type PathPart = PathPartKey | PathPartIndex

function parsePath(path: string): PathPart[] {
  const parts: PathPart[] = []
  let rest = path.startsWith('$') ? path.slice(1) : path

  while (rest.length > 0) {
    if (rest.startsWith('.')) {
      rest = rest.slice(1)
      const match = rest.match(/^[^.[]+/)
      if (match) {
        parts.push({ type: 'key', value: match[0] })
        rest = rest.slice(match[0].length)
      }
    } else if (rest.startsWith('[')) {
      const match = rest.match(/^\[(\d+)]/)
      if (match) {
        parts.push({ type: 'index', index: parseInt(match[1], 10) })
        rest = rest.slice(match[0].length)
      } else {
        break
      }
    } else {
      break
    }
  }

  return parts
}
