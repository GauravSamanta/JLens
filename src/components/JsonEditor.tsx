import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import { EditorView, lineNumbers, drawSelection, highlightActiveLine } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { bracketMatching, foldGutter, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { json } from '@codemirror/lang-json'
import { getEditorExtensions } from '../editor/theme'
import { getJsonPathAtPosition } from '../editor/sync'
import { getPositionForPath } from '../editor/sync'
import { useJsonStore } from '../stores/jsonStore'
import { useUIStore } from '../stores/uiStore'

export interface JsonEditorHandle {
  scrollToPath: (path: string) => void
  setValue: (value: string) => void
  getValue: () => string
}

interface JsonEditorProps {
  initialValue: string
  onChange: (value: string) => void
  height: number
}

export const JsonEditor = forwardRef<JsonEditorHandle, JsonEditorProps>(
  function JsonEditor({ initialValue, onChange, height }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const viewRef = useRef<EditorView | null>(null)
    const themeCompartment = useRef(new Compartment())
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
    const syncingFromTree = useRef(false)

    const isDark = useUIStore((s) => s.theme) === 'dark'

    const handleDocChange = useCallback((value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      const delay = value.length > 100_000 ? 500 : 100
      debounceRef.current = setTimeout(() => onChange(value), delay)
    }, [onChange])

    const handleCursorActivity = useCallback((state: EditorState) => {
      if (syncingFromTree.current) return
      const pos = state.selection.main.head
      const path = getJsonPathAtPosition(state, pos)
      if (path) {
        const currentSelected = useJsonStore.getState().selectedNodeId
        if (path !== currentSelected) {
          const { parseResult } = useJsonStore.getState()
          if (parseResult?.nodes.has(path)) {
            useJsonStore.getState().expandToNode(path)
            useJsonStore.getState().selectNode(path)
          }
        }
      }
    }, [])

    useEffect(() => {
      if (!containerRef.current) return

      const themeExts = getEditorExtensions(isDark)

      const view = new EditorView({
        state: EditorState.create({
          doc: initialValue,
          extensions: [
            lineNumbers(),
            drawSelection(),
            highlightActiveLine(),
            bracketMatching(),
            foldGutter(),
            json(),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            themeCompartment.current.of(themeExts),
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                handleDocChange(update.state.doc.toString())
              }
              if (update.selectionSet && !update.docChanged) {
                handleCursorActivity(update.state)
              }
            }),
            EditorView.lineWrapping,
          ],
        }),
        parent: containerRef.current,
      })

      viewRef.current = view
      return () => {
        view.destroy()
        if (debounceRef.current) clearTimeout(debounceRef.current)
      }
    }, [])

    useEffect(() => {
      const view = viewRef.current
      if (!view) return
      view.dispatch({
        effects: themeCompartment.current.reconfigure(getEditorExtensions(isDark)),
      })
    }, [isDark])

    useImperativeHandle(ref, () => ({
      scrollToPath(path: string) {
        const view = viewRef.current
        if (!view) return
        const range = getPositionForPath(view.state, path)
        if (!range) return
        syncingFromTree.current = true
        view.dispatch({
          selection: { anchor: range.from },
          effects: EditorView.scrollIntoView(range.from, { y: 'center' }),
        })
        requestAnimationFrame(() => {
          syncingFromTree.current = false
        })
      },
      setValue(value: string) {
        const view = viewRef.current
        if (!view) return
        const currentDoc = view.state.doc.toString()
        if (currentDoc === value) return
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: value },
        })
      },
      getValue() {
        return viewRef.current?.state.doc.toString() ?? ''
      },
    }), [])

    return (
      <div
        ref={containerRef}
        className="overflow-hidden flex-shrink-0"
        style={{ height: `${height}px` }}
      />
    )
  }
)

export default JsonEditor
