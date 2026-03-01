import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

const editorTheme = EditorView.theme({
  '&': {
    fontSize: '13px',
    height: '100%',
  },
  '.cm-content': {
    fontFamily: 'var(--font-mono)',
    padding: '12px 0',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-gutters': {
    border: 'none',
    paddingLeft: '8px',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px 0 0',
    minWidth: '32px',
    fontSize: '11px',
  },
  '.cm-foldGutter .cm-gutterElement': {
    padding: '0 4px',
  },
  '.cm-activeLine': {
    backgroundColor: 'transparent',
  },
  '.cm-matchingBracket': {
    outline: '1px solid var(--color-muted)',
    backgroundColor: 'transparent',
  },
  '.cm-foldPlaceholder': {
    border: 'none',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    padding: '0 4px',
  },
})

const darkEditorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--color-base)',
    color: 'var(--color-text-primary)',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: 'var(--color-accent-blue)',
  },
  '&.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(122, 162, 247, 0.2)',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(122, 162, 247, 0.15)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--color-base)',
    color: 'var(--color-subtle)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: 'var(--color-text-faint)',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'var(--color-overlay)',
    color: 'var(--color-text-faint)',
  },
}, { dark: true })

const lightEditorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--color-base-light)',
    color: 'var(--color-text-light)',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: '#3b82f6',
  },
  '&.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--color-base-light)',
    color: '#9ca3af',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: 'var(--color-text-light-secondary)',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'var(--color-surface-light)',
    color: 'var(--color-text-light-secondary)',
  },
})

const darkHighlight = HighlightStyle.define([
  { tag: tags.propertyName, color: 'var(--color-text-primary)' },
  { tag: tags.string, color: 'var(--color-accent-green)' },
  { tag: tags.number, color: 'var(--color-accent-blue)' },
  { tag: tags.bool, color: 'var(--color-accent-peach)' },
  { tag: tags.null, color: 'var(--color-text-faint)', fontStyle: 'italic' },
  { tag: tags.punctuation, color: 'var(--color-muted)' },
])

const lightHighlight = HighlightStyle.define([
  { tag: tags.propertyName, color: 'var(--color-text-light)' },
  { tag: tags.string, color: '#16a34a' },
  { tag: tags.number, color: '#2563eb' },
  { tag: tags.bool, color: '#ea580c' },
  { tag: tags.null, color: '#9ca3af', fontStyle: 'italic' },
  { tag: tags.punctuation, color: '#9ca3af' },
])

export function getEditorExtensions(isDark: boolean) {
  return [
    editorTheme,
    isDark ? darkEditorTheme : lightEditorTheme,
    syntaxHighlighting(isDark ? darkHighlight : lightHighlight),
  ]
}
