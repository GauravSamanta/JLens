import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Eraser, WrapText, ChevronDown, ChevronRight } from 'lucide-react'
import { useJsonStore } from '../stores/jsonStore'

export function JsonInput() {
  const { rawInput, setRawInput, parseError, parseResult } = useJsonStore()
  const [collapsed, setCollapsed] = useState(false)
  const [localInput, setLocalInput] = useState(rawInput)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setLocalInput(rawInput)
  }, [rawInput])

  const handleChange = useCallback((value: string) => {
    setLocalInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const delay = value.length > 100_000 ? 500 : 100
    debounceRef.current = setTimeout(() => setRawInput(value), delay)
  }, [setRawInput])

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(localInput)
      const formatted = JSON.stringify(parsed, null, 2)
      setLocalInput(formatted)
      setRawInput(formatted)
    } catch { /* ignore if invalid */ }
  }, [localInput, setRawInput])

  const handleClear = useCallback(() => {
    setLocalInput('')
    setRawInput('')
    setCollapsed(false)
  }, [setRawInput])

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setLocalInput(text)
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
    if (parseResult && !parseError && localInput.trim()) {
      setCollapsed(true)
    }
  }, [parseResult, parseError])

  if (collapsed && parseResult) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800">
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 font-mono"
        >
          <ChevronRight size={14} />
          JSON loaded ({parseResult.totalNodes} nodes, depth {parseResult.maxDepth})
        </button>
        <button
          onClick={handleClear}
          className="text-sm text-gray-500 hover:text-gray-300 ml-auto"
        >
          Clear
        </button>
      </div>
    )
  }

  return (
    <div className="border-b border-gray-800 p-4">
      <div className="flex items-center gap-2 mb-2">
        {parseResult && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-gray-400 hover:text-gray-200"
          >
            <ChevronDown size={14} />
          </button>
        )}
        <span className="text-xs text-gray-500 font-mono">INPUT</span>
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={handleFormat}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            title="Format JSON"
          >
            <WrapText size={14} />
            Format
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            title="Upload file"
          >
            <Upload size={14} />
            Upload
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            title="Clear"
          >
            <Eraser size={14} />
            Clear
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
      <textarea
        value={localInput}
        onChange={(e) => handleChange(e.target.value)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        placeholder="Paste JSON here..."
        className="w-full h-40 resize-y rounded bg-gray-900 border border-gray-800 p-3 font-mono text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600"
        spellCheck={false}
      />
      {parseError && (
        <p className="mt-1 text-xs text-red-400 font-mono">{parseError}</p>
      )}
    </div>
  )
}
