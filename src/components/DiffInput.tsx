import { useJsonStore } from '../stores/jsonStore'

export function DiffInput() {
  const { rawInputLeft, rawInputRight, setRawInputLeft, setRawInputRight } = useJsonStore()

  const inputClass = 'bg-surface border-border text-text placeholder-faint focus:border-accent/40'

  return (
    <div className="flex gap-0 border-b border-border">
      <div className="flex-1 p-3 border-r border-border">
        <span className="text-[10px] font-medium tracking-wider uppercase mb-1.5 block text-faint">
          Original
        </span>
        <textarea
          value={rawInputLeft}
          onChange={(e) => setRawInputLeft(e.target.value)}
          placeholder="Paste original JSON\u2026"
          className={`w-full h-28 resize-y rounded-lg border p-2.5 font-mono text-[13px] leading-relaxed focus:outline-none transition-colors ${inputClass}`}
          spellCheck={false}
        />
      </div>
      <div className="flex-1 p-3">
        <span className="text-[10px] font-medium tracking-wider uppercase mb-1.5 block text-faint">
          Modified
        </span>
        <textarea
          value={rawInputRight}
          onChange={(e) => setRawInputRight(e.target.value)}
          placeholder="Paste modified JSON\u2026"
          className={`w-full h-28 resize-y rounded-lg border p-2.5 font-mono text-[13px] leading-relaxed focus:outline-none transition-colors ${inputClass}`}
          spellCheck={false}
        />
      </div>
    </div>
  )
}
