import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

const editorTheme = EditorView.theme({
  '&': {
    fontSize: '13px',
    height: '100%',
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
  },
  '.cm-content': {
    fontFamily: 'var(--font-mono)',
    padding: '12px 0',
    caretColor: 'var(--text)',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '&.cm-editor .cm-cursor, &.cm-editor .cm-dropCursor': {
    borderLeftColor: 'var(--text)',
    borderLeftWidth: '2px',
  },
  '.cm-gutters': {
    border: 'none',
    paddingLeft: '8px',
    backgroundColor: 'var(--bg)',
    color: 'var(--faint)',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px 0 0',
    minWidth: '32px',
    fontSize: '11px',
  },
  '.cm-foldGutter .cm-gutterElement': {
    padding: '0 4px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: 'var(--sub)',
  },
  '.cm-activeLine': {
    backgroundColor: 'color-mix(in srgb, var(--text) 2%, transparent)',
  },
  '.cm-matchingBracket': {
    outline: '1px solid var(--faint)',
    backgroundColor: 'transparent',
  },
  '.cm-foldPlaceholder': {
    border: 'none',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    padding: '0 4px',
    backgroundColor: 'var(--overlay)',
    color: 'var(--faint)',
  },
})

const highlight = HighlightStyle.define([
  { tag: tags.propertyName, color: 'var(--text)' },
  { tag: tags.string, color: 'var(--syntax-string)' },
  { tag: tags.number, color: 'var(--accent)' },
  { tag: tags.bool, color: 'var(--syntax-number)' },
  { tag: tags.null, color: 'var(--faint)', fontStyle: 'italic' },
  { tag: tags.punctuation, color: 'var(--faint)' },
])

export function getEditorExtensions() {
  return [
    editorTheme,
    syntaxHighlighting(highlight),
  ]
}
