import { useRef, useCallback, useEffect, useState, lazy, Suspense } from 'react'
import Upload from 'lucide-react/dist/esm/icons/upload'
import Eraser from 'lucide-react/dist/esm/icons/eraser'
import WrapText from 'lucide-react/dist/esm/icons/wrap-text'
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down'
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right'
import Wrench from 'lucide-react/dist/esm/icons/wrench'
import Copy from 'lucide-react/dist/esm/icons/copy'
import Check from 'lucide-react/dist/esm/icons/check'
import Loader from 'lucide-react/dist/esm/icons/loader'
import { useJsonStore } from '../stores/jsonStore'
import { useUIStore } from '../stores/uiStore'
import type { JsonEditorHandle } from './JsonEditor'
import type { FormatResponse } from '../workers/format.worker'

const JsonEditor = lazy(() => import('./JsonEditor'))

export function JsonInput() {
  const { rawInput, setRawInput, parseError, parseResult } = useJsonStore()
  const repairInfo = useJsonStore((s) => s.repairInfo)
  const selectedNodeId = useJsonStore((s) => s.selectedNodeId)
  const editorHeight = useUIStore((s) => s.editorHeight)
  const collapsed = useUIStore((s) => s.editorCollapsed)
  const setCollapsed = useUIStore((s) => s.setEditorCollapsed)
  const [copiedFixed, setCopiedFixed] = useState(false)
  const [isFormatting, setIsFormatting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<JsonEditorHandle>(null)
  const formatWorkerRef = useRef<Worker | null>(null)

  const handleCopyFixed = useCallback(() => {
    if (!repairInfo?.repairedInput) return
    navigator.clipboard.writeText(repairInfo.repairedInput).then(() => {
      setCopiedFixed(true)
      setTimeout(() => setCopiedFixed(false), 1500)
    }).catch(() => {})
  }, [repairInfo])

  const handleFormat = useCallback(() => {
    if (isFormatting) return
    const source = repairInfo?.repairedInput ?? editorRef.current?.getValue() ?? rawInput
    if (!source.trim()) return

    const SMALL_THRESHOLD = 100_000
    if (source.length < SMALL_THRESHOLD) {
      try {
        const parsed = JSON.parse(source)
        const formatted = JSON.stringify(parsed, null, 2)
        editorRef.current?.setValue(formatted)
      } catch { /* ignore if invalid */ }
      return
    }

    setIsFormatting(true)
    formatWorkerRef.current?.terminate()
    const worker = new Worker(
      new URL('../workers/format.worker.ts', import.meta.url),
      { type: 'module' }
    )
    formatWorkerRef.current = worker
    worker.onmessage = (e: MessageEvent<FormatResponse>) => {
      if (e.data.success && e.data.formatted) {
        editorRef.current?.setValue(e.data.formatted)
      }
      setIsFormatting(false)
      worker.terminate()
      formatWorkerRef.current = null
    }
    worker.postMessage({ jsonString: source })
  }, [isFormatting, repairInfo, rawInput])

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

  useEffect(() => {
    return () => {
      formatWorkerRef.current?.terminate()
    }
  }, [])

  const btnClass = 'text-faint hover:text-sub hover:bg-overlay/50'

  if (collapsed && parseResult) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border">
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-1.5 text-xs font-mono text-faint hover:text-sub"
        >
          <ChevronRight size={12} />
          <span>{parseResult.totalNodes} nodes</span>
          <span className="text-faint">·</span>
          <span>depth {parseResult.maxDepth}</span>
        </button>
        {repairInfo?.wasRepaired && (
          <button
            onClick={handleCopyFixed}
            className="flex items-center gap-1 transition-colors text-syntax-number hover:text-syntax-string"
            title="Copy corrected JSON"
          >
            {copiedFixed ? <Check size={10} className="text-syntax-string" /> : <Wrench size={10} />}
            <span className="text-[10px]">{copiedFixed ? 'Copied' : 'Fixed · Copy'}</span>
          </button>
        )}
        <button
          onClick={handleClear}
          className="text-xs ml-auto text-faint hover:text-error"
        >
          Clear
        </button>
      </div>
    )
  }

  return (
    <div
      className="border-b border-border"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex items-center gap-2 px-4 py-2">
        {parseResult && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-faint hover:text-sub"
          >
            <ChevronDown size={12} />
          </button>
        )}
        <span className="text-[10px] font-medium tracking-wider uppercase text-faint">
          Editor
        </span>
        <div className="flex items-center gap-0.5 ml-auto">
          {repairInfo?.wasRepaired && (
            <button
              onClick={handleCopyFixed}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-syntax-number hover:text-syntax-string hover:bg-overlay/50"
              title="Copy corrected JSON"
            >
              {copiedFixed ? <Check size={12} className="text-syntax-string" /> : <Copy size={12} />}
              <span className="hidden sm:inline">{copiedFixed ? 'Copied' : 'Copy Fixed'}</span>
            </button>
          )}
          <button onClick={handleFormat} disabled={isFormatting} className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${btnClass} ${isFormatting ? 'opacity-50 cursor-wait' : ''}`} title="Format">
            {isFormatting ? <Loader size={12} className="animate-spin" /> : <WrapText size={12} />}
            <span className="hidden sm:inline">{isFormatting ? 'Formatting…' : 'Format'}</span>
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
        <div className="flex items-center justify-center font-mono text-xs text-faint" style={{ height: `${editorHeight}px` }}>
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
        <div className="mx-4 mb-3 rounded-md p-3 bg-error/10 border border-error/30">
          <p className="text-xs font-mono text-error">
            {parseError.message}
          </p>
          {parseError.context && (
            <pre className="mt-2 text-[11px] font-mono leading-relaxed whitespace-pre text-faint">
              {parseError.context}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
