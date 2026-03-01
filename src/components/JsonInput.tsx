import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Eraser, WrapText, ChevronDown, ChevronRight, Wrench, Copy, Check } from 'lucide-react'
import { useJsonStore } from '../stores/jsonStore'
import { useUIStore } from '../stores/uiStore'

export function JsonInput() {
  const { rawInput, setRawInput, parseError, parseResult } = useJsonStore()
  const repairInfo = useJsonStore((s) => s.repairInfo)
  const isDark = useUIStore((s) => s.theme) === 'dark'
  const [collapsed, setCollapsed] = useState(false)
  const [localInput, setLocalInput] = useState(rawInput)
  const [copiedFixed, setCopiedFixed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleCopyFixed = useCallback(() => {
    if (!repairInfo?.repairedInput) return
    navigator.clipboard.writeText(repairInfo.repairedInput).then(() => {
      setCopiedFixed(true)
      setTimeout(() => setCopiedFixed(false), 1500)
    })
  }, [repairInfo])

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
    <div className={`border-b px-5 py-3 ${isDark ? 'border-border' : 'border-border-light'}`}>
      <div className="flex items-center gap-2 mb-2">
        {parseResult && (
          <button
            onClick={() => setCollapsed(true)}
            className={isDark ? 'text-text-faint hover:text-text-secondary' : 'text-text-light-secondary hover:text-text-light'}
          >
            <ChevronDown size={12} />
          </button>
        )}
        <span className={`text-[10px] font-medium tracking-widest uppercase ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`}>
          Input
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
      <textarea
        value={localInput}
        onChange={(e) => handleChange(e.target.value)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        placeholder="Paste JSON here..."
        className={`w-full h-36 resize-y rounded-lg border p-3.5 font-mono text-[13px] leading-relaxed focus:outline-none transition-colors duration-150 ${
          isDark
            ? 'bg-base border-border text-text-primary placeholder-muted focus:border-accent-blue/40'
            : 'bg-white border-border-light text-text-light placeholder-text-light-secondary focus:border-blue-400/50'
        }`}
        spellCheck={false}
      />
      {parseError && (
        <div className={`mt-1.5 rounded-md p-3 ${isDark ? 'bg-red-950/30 border border-red-900/30' : 'bg-red-50 border border-red-200'}`}>
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
