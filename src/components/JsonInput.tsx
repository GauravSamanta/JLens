import { useRef, useCallback, useEffect, useState, lazy, Suspense } from 'react'
import Upload from 'lucide-react/dist/esm/icons/upload'
import Eraser from 'lucide-react/dist/esm/icons/eraser'
import WrapText from 'lucide-react/dist/esm/icons/wrap-text'
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down'
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right'
import Wrench from 'lucide-react/dist/esm/icons/wrench'
import Copy from 'lucide-react/dist/esm/icons/copy'
import Check from 'lucide-react/dist/esm/icons/check'
import { useJsonStore } from '../stores/jsonStore'
import { useUIStore } from '../stores/uiStore'
import type { JsonEditorHandle } from './JsonEditor'

const JsonEditor = lazy(() => import('./JsonEditor'))

export function JsonInput() {
  const { rawInput, setRawInput, parseError, parseResult } = useJsonStore()
  const repairInfo = useJsonStore((s) => s.repairInfo)
  const selectedNodeId = useJsonStore((s) => s.selectedNodeId)
  const isDark = useUIStore((s) => s.theme) === 'dark'
  const editorHeight = useUIStore((s) => s.editorHeight)
  const collapsed = useUIStore((s) => s.editorCollapsed)
  const setCollapsed = useUIStore((s) => s.setEditorCollapsed)
  const [copiedFixed, setCopiedFixed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<JsonEditorHandle>(null)

  const handleCopyFixed = useCallback(() => {
    if (!repairInfo?.repairedInput) return
    navigator.clipboard.writeText(repairInfo.repairedInput).then(() => {
      setCopiedFixed(true)
      setTimeout(() => setCopiedFixed(false), 1500)
    }).catch(() => {})
  }, [repairInfo])

  const handleFormat = useCallback(() => {
    const source = repairInfo?.repairedInput ?? editorRef.current?.getValue() ?? rawInput
    try {
      const parsed = JSON.parse(source)
      const formatted = JSON.stringify(parsed, null, 2)
      editorRef.current?.setValue(formatted)
      setRawInput(formatted)
    } catch { /* ignore if invalid */ }
  }, [repairInfo, rawInput, setRawInput])

  const handleClear = useCallback(() => {
    editorRef.current?.setValue('')
    setRawInput('')
    setCollapsed(false)
  }, [setRawInput])

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      editorRef.current?.setValue(text)
      setRawInput(text)
    }
    reader.readAsText(file)
  }, [setRawInput])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  useEffect(() => {
    if (!collapsed && selectedNodeId) {
      editorRef.current?.scrollToPath(selectedNodeId)
    }
  }, [selectedNodeId, collapsed])

  const btnClass = isDark
    ? 'text-text-faint hover:text-text-secondary hover:bg-overlay/50'
    : 'text-text-light-secondary hover:text-text-light hover:bg-surface-light'

  if (collapsed && parseResult) {
    return (
      <div className={`flex items-center gap-3 px-5 py-2 border-b ${isDark ? 'border-border' : 'border-border-light'}`}>
        <button
          onClick={() => setCollapsed(false)}
          className={`flex items-center gap-1.5 text-xs font-mono ${isDark ? 'text-text-faint hover:text-text-secondary' : 'text-text-light-secondary hover:text-text-light'}`}
        >
          <ChevronRight size={12} />
          <span className="tracking-wide">{parseResult.totalNodes} nodes</span>
          <span className={isDark ? 'text-subtle' : 'text-text-light-secondary'}>·</span>
          <span className="tracking-wide">depth {parseResult.maxDepth}</span>
        </button>
        {repairInfo?.wasRepaired && (
          <button
            onClick={handleCopyFixed}
            className={`flex items-center gap-1 transition-colors ${
              isDark ? 'text-accent-yellow hover:text-accent-green' : 'text-amber-600 hover:text-emerald-600'
            }`}
            title="Copy corrected JSON"
          >
            {copiedFixed ? <Check size={10} className="text-accent-green" /> : <Wrench size={10} />}
            <span className="text-[10px]">{copiedFixed ? 'Copied' : 'Fixed · Copy'}</span>
          </button>
        )}
        <button
          onClick={handleClear}
          className={`text-xs ml-auto ${isDark ? 'text-text-faint hover:text-accent-red' : 'text-text-light-secondary hover:text-red-500'}`}
        >
          Clear
        </button>
      </div>
    )
  }

  return (
    <div
      className={`border-b ${isDark ? 'border-border' : 'border-border-light'}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex items-center gap-2 px-5 py-2">
        {parseResult && (
          <button
            onClick={() => setCollapsed(true)}
            className={isDark ? 'text-text-faint hover:text-text-secondary' : 'text-text-light-secondary hover:text-text-light'}
          >
            <ChevronDown size={12} />
          </button>
        )}
        <span className={`text-[10px] font-medium tracking-widest uppercase ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`}>
          Editor
        </span>
        <div className="flex items-center gap-0.5 ml-auto">
          {repairInfo?.wasRepaired && (
            <button
              onClick={handleCopyFixed}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
                isDark ? 'text-accent-yellow hover:text-accent-green hover:bg-overlay/50' : 'text-amber-600 hover:text-emerald-600 hover:bg-surface-light'
              }`}
              title="Copy corrected JSON"
            >
              {copiedFixed ? <Check size={12} className="text-accent-green" /> : <Copy size={12} />}
              <span className="hidden sm:inline">{copiedFixed ? 'Copied' : 'Copy Fixed'}</span>
            </button>
          )}
          <button onClick={handleFormat} className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${btnClass}`} title="Format">
            <WrapText size={12} />
            <span className="hidden sm:inline">Format</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${btnClass}`} title="Upload">
            <Upload size={12} />
            <span className="hidden sm:inline">Upload</span>
          </button>
          <button onClick={handleClear} className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${btnClass}`} title="Clear">
            <Eraser size={12} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileUpload(file)
          }}
        />
      </div>
      <Suspense fallback={
        <div className={`flex items-center justify-center font-mono text-xs ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`} style={{ height: `${editorHeight}px` }}>
          Loading editor…
        </div>
      }>
        <JsonEditor
          ref={editorRef}
          initialValue={rawInput}
          onChange={setRawInput}
          height={editorHeight}
        />
      </Suspense>
      {parseError && (
        <div className={`mx-5 mb-3 rounded-md p-3 ${isDark ? 'bg-red-950/30 border border-red-900/30' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-xs font-mono ${isDark ? 'text-accent-red' : 'text-red-600'}`}>
            {parseError.message}
          </p>
          {parseError.context && (
            <pre className={`mt-2 text-[11px] font-mono leading-relaxed whitespace-pre ${isDark ? 'text-text-faint' : 'text-gray-500'}`}>
              {parseError.context}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
